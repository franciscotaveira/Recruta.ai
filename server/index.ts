import './env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleVerification, handleEvent } from './whatsapp/webhook';
import { createSession } from './conversation/flow';
import { decodeSessionAnalysis, updateSessionAnalysisMetadata } from './conversation/summary';
import { wa, dual, users } from './storage/db';
import { supabase } from './storage/supabase';
import { analyzeCVSafe } from './ai/analyze-cv';
import { transcribeAudio } from './ai/transcribe';
import { requireAuth, generateToken, hashPassword, verifyPassword } from './middleware/auth';
import { ensureBootstrapAdmin, ensureBootstrapSquad } from './admin/bootstrap';
import { getAIControl, updateAIControl } from './admin/ai-control';
import { getAISquad, summarizeAISquad, updateAISquad } from './admin/ai-squad';
import { updateAIRagSettings } from './admin/ai-rag';
import { bulkAnalyzeCVs } from './ai/bulk-analyze';
import { getRAGDiagnostics } from './ai/rag';
import { createBilling, CREDIT_PACKAGES, DIAGNOSTIC_PRODUCT } from './payment/abacate';
import { handlePaymentWebhook } from './payment/webhook';
import { aiCache } from './ai/cache';
import { autoSeed } from './seed-auto';
import { downloadMediaWithMeta } from './whatsapp/client';
import { toCanonicalDigits } from './whatsapp/phone';
import { generateSimulatedResponse, evaluateSimulation, SimulationScenario, ChatMessage } from './ai/simulator';
import {
  projectBlindCandidateIdentity,
  sanitizeCandidateDocumentText,
} from './skills/blind-screening';
import { parseResume } from './ai/cv-parser';
import {
  buildBulkCandidateProfileId,
  encodeBulkAttentionPoints,
  shapeBulkAnalysisCandidateForApi,
  shapeBulkAnalysisErrorForApi,
  shapeStoredBulkAnalysisResult,
} from './skills/bulk-analysis';
import {
  buildRecruiterCandidateExportRows,
  encodeRecruiterCandidateExportCsv,
  normalizeRecruiterCandidateExportFormat,
  parseBooleanQueryFlag,
} from './export/recruiter-candidates';
import {
  buildRecruiterReviewQueueItem,
  compareReviewQueueItems,
  shouldIncludeInReviewQueue,
} from './review/queue';
import { resolveAreaPolicy, shouldRequireHumanReview } from './conversation/governance';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.get('/diag', (req, res) => res.json({ diag: 'ok', time: new Date().toISOString() }));
const PORT = parseInt(process.env.PORT || '3456', 10);
const IS_PROD = process.env.NODE_ENV === 'production';
const WHATSAPP_PROVIDER = String(process.env.WHATSAPP_PROVIDER || 'meta').trim().toLowerCase();
const SERVICE = 'recrutaria-api';

function mustHave(name: string) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    console.warn(`[BOOT] WARNING: Missing environment variable: ${name}. Some features may not work.`);
  }
}

function normalizeOrigin(origin: string): string | null {
  try {
    const parsed = new URL(origin.trim());
    return `${parsed.protocol}//${parsed.host}`.replace(/\/+$/, '').toLowerCase();
  } catch {
    return null;
  }
}

function paginate<T>(items: T[], limit: number, offset: number) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safeOffset = Math.max(offset, 0);
  return {
    data: items.slice(safeOffset, safeOffset + safeLimit),
    total: items.length,
    limit: safeLimit,
    offset: safeOffset,
  };
}

function shapeSessionForApi(session: any, blindScreeningEnabled: boolean) {
  const parsed = decodeSessionAnalysis(session?.summary);
  const blindScreeningActive = blindScreeningEnabled || Boolean(parsed.blindCandidate?.enabled);
  const candidateProjection = projectBlindCandidateIdentity({
    referenceId: String(session?.id || ''),
    candidateName: session?.candidate_name,
    candidatePhone: session?.candidate_phone,
    enabled: blindScreeningActive,
  });
  const blindCandidate = blindScreeningActive
    ? candidateProjection.blindCandidate
    : parsed.blindCandidate || candidateProjection.blindCandidate;

  return {
    ...session,
    candidate_phone: blindCandidate.enabled ? null : candidateProjection.candidatePhone,
    candidate_name: blindCandidate.enabled ? null : candidateProjection.candidateName,
    summary: parsed.summary,
    strengths: parsed.strengths,
    concerns: parsed.concerns,
    recommendation: parsed.recommendation,
    question_scores: parsed.questionScores,
    communication_performance: parsed.communicationPerformance || null,
    competency_scores: parsed.competencyScores.map((row) => ({
      requirement_id: row.requirementId,
      requirement_text: row.requirementText,
      category: row.category,
      weight: row.weight,
      score: row.score,
      bars_level: row.barsLevel,
      evidence: row.evidence,
      rationale: row.rationale,
    })),
    knockout: parsed.knockout
      ? {
          failed: parsed.knockout.status === 'fail',
          reason: parsed.knockout.reason,
          requirement_id: parsed.knockout.requirementId || null,
          requirement_text: parsed.knockout.requirementText || null,
          answer: parsed.knockout.answer || null,
        }
      : null,
    confidence: parsed.confidence,
    review: parsed.recruiterReview,
    blind_candidate: blindCandidate,
  };
}

function shapeJobApplicationForApi(application: any, blindScreeningEnabled: boolean) {
  const { candidate_profiles, ...rest } = application || {};
  const profile =
    Array.isArray(candidate_profiles) && candidate_profiles.length > 0
      ? candidate_profiles[0]
      : candidate_profiles && typeof candidate_profiles === 'object'
        ? candidate_profiles
        : null;
  const candidateName =
    typeof application?.candidate_name === 'string' && application.candidate_name.trim().length > 0
      ? application.candidate_name.trim()
      : typeof profile?.name === 'string' && profile.name.trim().length > 0
        ? profile.name.trim()
        : null;
  const candidatePhone =
    typeof application?.candidate_phone === 'string' && application.candidate_phone.trim().length > 0
      ? application.candidate_phone.trim()
      : typeof profile?.phone === 'string' && profile.phone.trim().length > 0
        ? profile.phone.trim()
        : null;
  const candidateProjection = projectBlindCandidateIdentity({
    referenceId: String(application?.id || ''),
    candidateName,
    candidatePhone,
    enabled: blindScreeningEnabled,
  });

  return {
    ...rest,
    candidate_name: candidateProjection.candidateName,
    candidate_phone: candidateProjection.candidatePhone,
    blind_candidate: candidateProjection.blindCandidate,
  };
}

function shapeRecruiterCandidateProfileForApi(
  profile: any,
  blindScreeningEnabled: boolean,
  history: any[]
) {
  const candidateProjection = projectBlindCandidateIdentity({
    referenceId: String(profile?.id || ''),
    candidateName: profile?.name,
    candidatePhone: profile?.phone,
    enabled: blindScreeningEnabled,
  });

  return {
    ...profile,
    name: candidateProjection.candidateName,
    email: blindScreeningEnabled ? null : profile?.email || null,
    phone: candidateProjection.candidatePhone,
    diagnosis: sanitizeCandidateDocumentText({
      text: profile?.diagnosis,
      candidateName: profile?.name,
      enabled: blindScreeningEnabled,
    }),
    cv_master: sanitizeCandidateDocumentText({
      text: profile?.cv_master,
      candidateName: profile?.name,
      enabled: blindScreeningEnabled,
    }),
    blind_candidate: candidateProjection.blindCandidate,
    history,
  };
}

async function loadRecruiterCandidateBankForApi(options?: {
  limit?: number;
  blindScreeningEnabledOverride?: boolean;
  squad?: Awaited<ReturnType<typeof getAISquad>>;
}): Promise<{
  candidates: any[];
  governanceBlindScreeningEnabled: boolean;
  effectiveBlindScreeningEnabled: boolean;
}> {
  const requestedLimit = Number(options?.limit ?? 200);
  const safeLimit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.round(requestedLimit), 1), 2000)
    : 200;
  const squadPromise = options?.squad ? Promise.resolve(options.squad) : getAISquad();
  const [profiles, squad] = await Promise.all([dual.listCandidateBank(safeLimit), squadPromise]);
  const governanceBlindScreeningEnabled = Boolean(squad.governance.blindScreeningEnabled);
  const effectiveBlindScreeningEnabled =
    typeof options?.blindScreeningEnabledOverride === 'boolean'
      ? options.blindScreeningEnabledOverride
      : governanceBlindScreeningEnabled;

  const profileIds = (profiles || []).map((profile: any) => String(profile?.id || '')).filter(Boolean);
  const { data: historyRows } =
    profileIds.length === 0
      ? { data: [] as any[] }
      : await supabase
          .from('job_applications')
          .select('id, profile_id, status, match_score, applied_at, updated_at, public_jobs(title, company)')
          .in('profile_id', profileIds);

  const historyByProfile = new Map<string, any[]>();
  for (const row of historyRows || []) {
    const profileId = String((row as any)?.profile_id || '');
    if (!profileId) continue;
    const items = historyByProfile.get(profileId) || [];
    items.push(row);
    historyByProfile.set(profileId, items);
  }

  const candidates = (profiles || []).map((profile: any) =>
    shapeRecruiterCandidateProfileForApi(
      profile,
      effectiveBlindScreeningEnabled,
      (historyByProfile.get(String(profile?.id || '')) || []).sort((a: any, b: any) => {
        const aTime = new Date(a?.updated_at || a?.applied_at || 0).getTime();
        const bTime = new Date(b?.updated_at || b?.applied_at || 0).getTime();
        return bTime - aTime;
      })
    )
  );

  return {
    candidates,
    governanceBlindScreeningEnabled,
    effectiveBlindScreeningEnabled,
  };
}

type NormalizedRequirement = {
  text: string;
  category: string;
  importance: 'must_have' | 'preferred';
  weight: number;
  knockout: boolean;
  evidenceType: 'objective' | 'behavioral' | 'technical' | 'situational';
  knockoutQuestion?: string;
};

function normalizeJobRequirementsPayload(input: unknown): NormalizedRequirement[] {
  if (!Array.isArray(input)) return [];

  const normalizeImportance = (raw: unknown): 'must_have' | 'preferred' => {
    const value = String(raw || '')
      .trim()
      .toLowerCase();
    return value === 'must_have' ||
      value === 'must' ||
      value === 'mandatory' ||
      value === 'obrigatorio'
      ? 'must_have'
      : 'preferred';
  };

  const normalizeEvidenceType = (
    raw: unknown,
    category: string
  ): 'objective' | 'behavioral' | 'technical' | 'situational' => {
    const value = String(raw || '')
      .trim()
      .toLowerCase();
    if (['technical', 'tecnico', 'portfolio', 'case'].includes(value)) return 'technical';
    if (['behavioral', 'comportamental', 'experience', 'audio_answer'].includes(value))
      return 'behavioral';
    if (['situational', 'situacional', 'scenario', 'cenario'].includes(value)) return 'situational';
    if (['objective', 'objetivo'].includes(value)) return 'objective';

    const normalizedCategory = category.trim().toLowerCase();
    if (normalizedCategory.includes('tech')) return 'technical';
    if (normalizedCategory.includes('comport')) return 'behavioral';
    if (normalizedCategory.includes('situac')) return 'situational';
    return 'objective';
  };

  return input
    .map((row): NormalizedRequirement | null => {
      const isObject = !!row && typeof row === 'object';
      const rawText =
        typeof row === 'string' ? row : isObject ? (row as Record<string, unknown>).text : '';
      const text = String(rawText || '').trim();
      if (!text) return null;

      const raw = (isObject ? row : {}) as Record<string, unknown>;
      const category = String(raw.category || 'skill').trim() || 'skill';
      const weightRaw = Math.round(Number(raw.weight ?? 3));
      const weight = Number.isFinite(weightRaw) ? Math.max(1, Math.min(5, weightRaw)) : 3;
      const knockoutQuestion = String(raw.knockoutQuestion || '').trim();

      return {
        text,
        category,
        importance: normalizeImportance(raw.importance),
        weight,
        knockout: Boolean(raw.knockout),
        evidenceType: normalizeEvidenceType(raw.evidenceType, category),
        knockoutQuestion: knockoutQuestion || undefined,
      };
    })
    .filter((v): v is NormalizedRequirement => !!v);
}

function fail(
  res: express.Response,
  status: number,
  error: string,
  code?: string,
  details?: unknown
) {
  const correlationId = (res.locals?.correlationId as string | undefined) || null;
  const payload: { error: string; code?: string; details?: unknown } = { error };
  if (code) payload.code = code;
  if (details !== undefined || correlationId) {
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      payload.details = { ...(details as Record<string, unknown>), correlationId };
    } else if (details !== undefined) {
      payload.details = { value: details, correlationId };
    } else {
      payload.details = { correlationId };
    }
  }
  return res.status(status).json(payload);
}

function logEvent(
  level: 'info' | 'warn' | 'error',
  event: string,
  fields: Record<string, unknown> = {}
) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    service: SERVICE,
    event,
    ...fields,
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
  // Persist asynchronously without blocking request path.
  const userId = (fields.userId as string | null | undefined) ?? null;
  const correlationId = (fields.correlationId as string | null | undefined) ?? null;
  void dual.logEvent(userId, event, level, fields, correlationId).catch((err) => {
    console.error('Failed to save system log to DB:', err);
  });
}

if (IS_PROD) {
  mustHave('JWT_SECRET');
  mustHave('SUPABASE_URL');
  mustHave('SUPABASE_SERVICE_ROLE_KEY');
  mustHave('ABACATE_PAY_TOKEN');
  mustHave('ABACATE_WEBHOOK_SECRET');

  if (WHATSAPP_PROVIDER === 'automatik') {
    mustHave('WHATSAPP_GATEWAY_API_KEY');
    mustHave('WHATSAPP_GATEWAY_ENDPOINT');
    mustHave('WHATSAPP_GATEWAY_WEBHOOK_SECRET');
  } else if (WHATSAPP_PROVIDER === 'meta') {
    mustHave('WHATSAPP_ACCESS_TOKEN');
    mustHave('WHATSAPP_PHONE_NUMBER_ID');
    mustHave('WHATSAPP_WEBHOOK_VERIFY_TOKEN');
    mustHave('WHATSAPP_APP_SECRET');
  } else {
    throw new Error(
      `[BOOT] Unsupported WHATSAPP_PROVIDER: ${WHATSAPP_PROVIDER}. Expected "meta" or "automatik".`
    );
  }
}

// Middleware
app.use(helmet());
app.use((req, res, next) => {
  if (req.path === '/api/whatsapp/webhook' || req.path === '/api/payment/webhook') {
    return next();
  }
  return express.json({ limit: '500kb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: '500kb' }));
app.use((req, res, next) => {
  const incoming = req.header('x-correlation-id');
  const correlationId = incoming && incoming.trim() ? incoming.trim() : randomUUID();
  (req as any).correlationId = correlationId;
  res.locals.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  const startedAt = Date.now();
  res.on('finish', () => {
    logEvent('info', 'http.request', {
      correlationId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
      userId: (req as any).user?.id || null,
      ip: req.ip,
    });
  });

  next();
});

const allowedOriginsSet = new Set<string>([
  'http://localhost:4050',
  'http://127.0.0.1:4050',
  'http://localhost:4051',
  'http://127.0.0.1:4051',
  ...(IS_PROD ? ['https://app.recrutaria.com.br', 'https://recrutaria.com.br'] : []),
]);

const frontendUrlOrigin = process.env.FRONTEND_URL ? normalizeOrigin(process.env.FRONTEND_URL) : null;
if (frontendUrlOrigin) {
  allowedOriginsSet.add(frontendUrlOrigin);
}

for (const rawOrigin of (process.env.ALLOWED_ORIGINS || '').split(',')) {
  const normalized = normalizeOrigin(rawOrigin);
  if (normalized) allowedOriginsSet.add(normalized);
}

const allowedOrigins = [...allowedOriginsSet];
logEvent('info', 'cors.allowed_origins', { allowedOrigins });

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const normalizedOrigin = normalizeOrigin(origin);
      if (normalizedOrigin && allowedOriginsSet.has(normalizedOrigin)) return cb(null, true);
      logEvent('warn', 'cors.blocked_origin', { origin, normalizedOrigin });
      return cb(new Error(`Origin not allowed: ${origin}`));
    },
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 60_000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { error: 'Too many requests. Try again in 1 minute.' },
  })
);

// Webhooks
const webhookJsonParser = express.json({
  limit: '1mb',
  verify: (req, _res, buf) => {
    (req as any).rawBody = buf.toString('utf8');
  },
});
const paymentJsonParser = express.json({
  limit: '500kb',
  verify: (req, _res, buf) => {
    (req as any).rawBody = buf.toString('utf8');
  },
});
const transcribeRawParser = express.raw({
  type: ['audio/*', 'application/octet-stream'],
  limit: '12mb',
});

app.get('/api/whatsapp/webhook', handleVerification);
app.post('/api/whatsapp/webhook', webhookJsonParser, handleEvent);
app.post('/api/payment/webhook', paymentJsonParser, handlePaymentWebhook);

const transcribeLimiter = rateLimit({
  windowMs: 60 * 60_000,
  max: 30,
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  validate: false,
});

const ALLOWED_TRANSCRIBE_MIME = new Set([
  'audio/ogg',
  'audio/webm',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
]);

app.post(
  '/api/transcribe',
  requireAuth(),
  transcribeLimiter,
  transcribeRawParser,
  async (req, res) => {
    try {
      const contentType = String(req.headers['content-type'] || '')
        .split(';')[0]
        .trim()
        .toLowerCase();
      const mimeType = contentType || 'application/octet-stream';
      if (!ALLOWED_TRANSCRIBE_MIME.has(mimeType)) {
        return fail(res, 415, 'Formato de áudio não suportado', 'TRANSCRIBE_UNSUPPORTED_MIME', {
          mimeType,
        });
      }

      const body = req.body;
      if (!Buffer.isBuffer(body) || body.length === 0) {
        return fail(res, 400, 'Envie o áudio no corpo da requisição', 'TRANSCRIBE_AUDIO_REQUIRED');
      }
      if (body.length > 12 * 1024 * 1024) {
        return fail(res, 413, 'Áudio excede o limite de 12MB', 'TRANSCRIBE_AUDIO_TOO_LARGE');
      }

      const text = await transcribeAudio(body, mimeType);
      return res.json({ text, mimeType, bytes: body.length });
    } catch (err: any) {
      logEvent('error', 'transcribe.failed', {
        error: err?.message,
        correlationId: (req as any).correlationId || null,
        userId: req.user?.id || null,
      });
      return fail(res, 500, 'Falha ao transcrever áudio', 'TRANSCRIBE_FAILED');
    }
  }
);

// Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  const correlationId = (req as any).correlationId;
  try {
    const { email, password, role, name } = req.body as {
      email?: string;
      password?: string;
      role?: string;
      name?: string;
    };

    if (!email || !password)
      return fail(res, 400, 'email e password são obrigatórios', 'AUTH_REQUIRED_FIELDS');
    if (typeof email !== 'string' || !email.includes('@') || email.length > 255)
      return fail(res, 400, 'Email inválido', 'AUTH_INVALID_EMAIL');
    if (typeof password !== 'string' || password.length < 8)
      return fail(res, 400, 'Senha deve ter no mínimo 8 caracteres', 'AUTH_WEAK_PASSWORD');
    if (role && !['candidate', 'recruiter'].includes(role))
      return fail(res, 400, 'role deve ser candidate ou recruiter', 'AUTH_INVALID_ROLE');

    const cleanEmail = email.toLowerCase().trim();
    const existing = (await users.findByEmail(cleanEmail)) as any;
    if (existing) {
      logEvent('warn', 'auth.register.duplicate', {
        email: cleanEmail,
        userId: null,
        correlationId,
      });
      return fail(res, 409, 'Email já cadastrado', 'AUTH_EMAIL_EXISTS');
    }

    const userId = randomUUID();
    const userRole = (role || 'candidate') as 'candidate' | 'recruiter';
    const passwordHash = await hashPassword(password);

    // P0: User Creation
    await users.create(userId, cleanEmail, passwordHash, userRole, name || null);

    // P1: Role-Specific Initialization
    if (userRole === 'candidate') {
      await dual.createProfile(
        `profile_${userId}`,
        userId,
        name || null,
        cleanEmail,
        null,
        null,
        null,
        null
      );
      logEvent('info', 'auth.register.candidate', {
        userId,
        email: cleanEmail,
        correlationId,
      });
    } else {
      await dual.initWallet(userId);
      logEvent('info', 'auth.register.recruiter', {
        userId,
        email: cleanEmail,
        correlationId,
      });
    }

    const token = generateToken(userId, userRole);
    res.status(201).json({ token, userId, role: userRole, email: cleanEmail, name: name || null });
  } catch (err: any) {
    logEvent('error', 'auth.register.failed', {
      error: err?.message,
      userId: null,
      correlationId,
    });
    fail(res, 500, 'Erro ao criar conta', 'AUTH_REGISTER_FAILED');
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password)
      return fail(res, 400, 'email e password são obrigatórios', 'AUTH_REQUIRED_FIELDS');

    const user = (await users.findByEmail(email.toLowerCase().trim())) as any;
    if (!user) return fail(res, 401, 'Email ou senha incorretos', 'AUTH_INVALID_CREDENTIALS');

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return fail(res, 401, 'Email ou senha incorretos', 'AUTH_INVALID_CREDENTIALS');

    await users.updateLastLogin(user.id);

    const token = generateToken(user.id, user.role);
    res.json({ token, userId: user.id, role: user.role, email: user.email, name: user.name });
  } catch (err: any) {
    logEvent('error', 'auth.login.failed', {
      error: err?.message,
      correlationId: (req as any).correlationId || null,
    });
    fail(res, 500, 'Erro no login', 'AUTH_LOGIN_FAILED');
  }
});

app.get('/api/auth/me', requireAuth(), async (req, res) => {
  try {
    const user = (await users.findById(req.user!.id)) as any;
    if (!user) return fail(res, 404, 'Usuário não encontrado', 'AUTH_USER_NOT_FOUND');
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      verified: !!user.verified,
    });
  } catch {
    fail(res, 500, 'Erro interno', 'AUTH_ME_FAILED');
  }
});

// Health
app.get('/api/health', async (_req, res) => {
  try {
    await dual.getActiveJobs();
    const providers = {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    };

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      ai: providers,
      cache: aiCache.stats(),
    });
  } catch (err: any) {
    res.status(503).json({ status: 'degraded', error: err.message || 'health failed' });
  }
});

app.get('/api/ai/status', (_req, res) => {
  res.json({
    providers: {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    },
    cache: aiCache.stats(),
  });
});

// Simulator
const simulatorLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: { error: 'Too many simulation requests' }
});

app.post('/api/simulator/chat', requireAuth(), simulatorLimiter, async (req, res) => {
  try {
    const { scenario, history } = req.body as { scenario: SimulationScenario; history: ChatMessage[] };
    if (!scenario || !history || !Array.isArray(history)) {
      return fail(res, 400, 'Payload inválido para simulação', 'SIMULATOR_INVALID_PAYLOAD');
    }
    const text = await generateSimulatedResponse(scenario, history);
    res.json({ text });
  } catch (err: any) {
    logEvent('error', 'simulator.chat.failed', {
      error: err?.message,
      correlationId: (req as any).correlationId || null,
      userId: req.user?.id || null,
    });
    fail(res, 500, 'Erro ao processar mensagem do simulador', 'SIMULATOR_CHAT_FAILED');
  }
});

app.post('/api/simulator/evaluate', requireAuth(), simulatorLimiter, async (req, res) => {
  try {
    const { scenario, history } = req.body as { scenario: SimulationScenario; history: ChatMessage[] };
    if (!scenario || !history || history.length === 0) {
      return fail(res, 400, 'Histórico vazio', 'SIMULATOR_EMPTY_HISTORY');
    }
    const evalData = await evaluateSimulation(scenario, history);
    res.json(evalData);
  } catch (err: any) {
    logEvent('error', 'simulator.evaluate.failed', {
      error: err?.message,
      correlationId: (req as any).correlationId || null,
      userId: req.user?.id || null,
    });
    fail(res, 500, 'Erro ao avaliar simulação', 'SIMULATOR_EVAL_FAILED');
  }
});

// Admin
app.get('/api/admin/overview', requireAuth('admin'), async (req, res) => {
  try {
    const [usersResp, jobsResp, sessionsResp, paymentsResp, aiControl, aiSquad, ragDiagnostics] =
      await Promise.all([
        supabase.from('users').select('id, role, created_at'),
        supabase.from('public_jobs').select('id, is_active, created_at'),
        supabase.from('whatsapp_sessions').select('id, state, match_score, created_at, summary'),
        supabase.from('payments').select('id, amount, status, created_at'),
        getAIControl(),
        getAISquad(),
        getRAGDiagnostics(),
      ]);

    const usersData: Array<{ role?: string | null }> = Array.isArray(usersResp.data)
      ? usersResp.data
      : [];
    const jobsData = Array.isArray(jobsResp.data) ? jobsResp.data : [];
    const sessionsData: Array<{ state?: string | null; match_score?: number | null }> =
      Array.isArray(sessionsResp.data) ? sessionsResp.data : [];
    const paymentsData = Array.isArray(paymentsResp.data) ? paymentsResp.data : [];

    const usersByRole = usersData.reduce((acc: Record<string, number>, row) => {
      const role = String(row.role || 'unknown');
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    const sessionsByState = sessionsData.reduce((acc: Record<string, number>, row) => {
      const state = String(row.state || 'unknown');
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    const totalSessions = sessionsData.length;
    const completedSessions = sessionsByState.completed || 0;
    const declinedSessions = sessionsByState.declined || 0;
    const completionRate =
      totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    const declineRate =
      totalSessions > 0 ? Math.round((declinedSessions / totalSessions) * 100) : 0;
    const avgMatchScore = (() => {
      const values = sessionsData
        .map((session) => Number(session.match_score))
        .filter((v: number) => Number.isFinite(v));
      if (values.length === 0) return null;
      return Math.round(values.reduce((sum: number, v: number) => sum + v, 0) / values.length);
    })();

    const paidPayments = paymentsData.filter(
      (p: any) => String(p.status || '').toLowerCase() === 'paid'
    );
    const paidRevenueCents = paidPayments.reduce(
      (sum: number, p: any) => sum + Number(p.amount || 0),
      0
    );

    res.json({
      generatedAt: new Date().toISOString(),
      users: {
        total: usersData.length,
        byRole: usersByRole,
      },
      jobs: {
        total: jobsData.length,
        active: jobsData.filter((j: any) => Boolean(j.is_active)).length,
        closed: jobsData.filter((j: any) => !j.is_active).length,
      },
      triage: {
        total: totalSessions,
        byState: sessionsByState,
        completionRate,
        declineRate,
        avgMatchScore,
      },
      revenue: {
        paidPayments: paidPayments.length,
        paidRevenueCents,
      },
      aiControl,
      aiSquadSummary: summarizeAISquad(aiSquad),
      aiRag: ragDiagnostics,
      viewer: {
        adminCanReviewRecruiterAndCandidateViews: true,
      },
    });
  } catch (err: any) {
    logEvent('error', 'admin.overview.failed', {
      error: err?.message,
      correlationId: (req as any).correlationId || null,
      userId: req.user?.id || null,
    });
    fail(res, 500, 'Erro ao carregar painel admin', 'ADMIN_OVERVIEW_FAILED');
  }
});

app.get('/api/admin/ai-control', requireAuth('admin'), async (req, res) => {
  try {
    const control = await getAIControl();
    res.json(control);
  } catch (err: any) {
    logEvent('error', 'admin.ai_control.fetch_failed', {
      error: err?.message,
      correlationId: (req as any).correlationId || null,
      userId: req.user?.id || null,
    });
    fail(res, 500, 'Erro ao carregar controle de IA', 'ADMIN_AI_CONTROL_FETCH_FAILED');
  }
});

app.put('/api/admin/ai-control', requireAuth('admin'), async (req, res) => {
  try {
    const allowed = [
      'aiEnabled',
      'deepDiveEnabled',
      'textFallbackEnabled',
      'maxAudioBytes',
      'modelPolicy',
    ];
    const patch = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) => allowed.includes(key))
    );
    const updated = await updateAIControl(patch as any, req.user?.id || null);
    res.json(updated);
  } catch (err: any) {
    logEvent('error', 'admin.ai_control.update_failed', {
      error: err?.message,
      correlationId: (req as any).correlationId || null,
      userId: req.user?.id || null,
    });
    fail(res, 500, 'Erro ao atualizar controle de IA', 'ADMIN_AI_CONTROL_UPDATE_FAILED');
  }
});

app.get('/api/admin/ai-squad', requireAuth('admin'), async (req, res) => {
  try {
    const squad = await getAISquad();
    res.json(squad);
  } catch (err: any) {
    logEvent('error', 'admin.ai_squad.fetch_failed', {
      error: err?.message,
      correlationId: (req as any).correlationId || null,
      userId: req.user?.id || null,
    });
    fail(res, 500, 'Erro ao carregar squad de IA', 'ADMIN_AI_SQUAD_FETCH_FAILED');
  }
});

app.put('/api/admin/ai-squad', requireAuth('admin'), async (req, res) => {
  try {
    const allowed = ['experts', 'governance'];
    const patch = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) => allowed.includes(key))
    );
    const updated = await updateAISquad(patch as any, req.user?.id || null);
    res.json(updated);
  } catch (err: any) {
    logEvent('error', 'admin.ai_squad.update_failed', {
      error: err?.message,
      correlationId: (req as any).correlationId || null,
      userId: req.user?.id || null,
    });
    fail(res, 500, 'Erro ao atualizar squad de IA', 'ADMIN_AI_SQUAD_UPDATE_FAILED');
  }
});

app.get('/api/admin/ai-rag', requireAuth('admin'), async (req, res) => {
  try {
    const diagnostics = await getRAGDiagnostics();
    res.json(diagnostics);
  } catch (err: any) {
    logEvent('error', 'admin.ai_rag.fetch_failed', {
      error: err?.message,
      correlationId: (req as any).correlationId || null,
      userId: req.user?.id || null,
    });
    fail(res, 500, 'Erro ao carregar configuração de RAG', 'ADMIN_AI_RAG_FETCH_FAILED');
  }
});

app.put('/api/admin/ai-rag', requireAuth('admin'), async (req, res) => {
  try {
    const allowed = [
      'enabled',
      'topK',
      'minScore',
      'maxContextChars',
      'cacheTtlSeconds',
      'includeCitations',
    ];
    const patch = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) => allowed.includes(key))
    );
    const updated = await updateAIRagSettings(patch as any, req.user?.id || null);
    res.json(updated);
  } catch (err: any) {
    logEvent('error', 'admin.ai_rag.update_failed', {
      error: err?.message,
      correlationId: (req as any).correlationId || null,
      userId: req.user?.id || null,
    });
    fail(res, 500, 'Erro ao atualizar configuração de RAG', 'ADMIN_AI_RAG_UPDATE_FAILED');
  }
});

// WhatsApp Token Management (Admin)
app.get('/api/admin/whatsapp-token', requireAuth('admin'), async (req, res) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || '';
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  if (!token || !phoneId) {
    return res.json({ status: 'missing', message: 'Token ou Phone ID não configurados.' });
  }
  try {
    const testRes = await fetch(`https://graph.facebook.com/v21.0/${phoneId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await testRes.json() as any;
    if (testRes.ok) {
      return res.json({ status: 'valid', phoneId, displayPhoneNumber: body.display_phone_number });
    }
    return res.json({ status: 'invalid', error: body?.error?.message || 'Token inválido', code: body?.error?.code });
  } catch (err: any) {
    return res.json({ status: 'error', message: err.message });
  }
});

app.put('/api/admin/whatsapp-token', requireAuth('admin'), async (req, res) => {
  const { token } = req.body || {};
  if (!token || typeof token !== 'string' || token.trim().length < 20) {
    return fail(res, 400, 'Token inválido ou muito curto', 'WHATSAPP_TOKEN_INVALID');
  }
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  // Validate token against Meta API before saving
  try {
    const testRes = await fetch(`https://graph.facebook.com/v21.0/${phoneId}`, {
      headers: { Authorization: `Bearer ${token.trim()}` },
    });
    const body = await testRes.json() as any;
    if (!testRes.ok) {
      return fail(res, 400, `Token rejeitado pela Meta: ${body?.error?.message || 'inválido'}`, 'WHATSAPP_TOKEN_REJECTED');
    }
    // Token is valid — update runtime env (persists until next process restart)
    process.env.WHATSAPP_ACCESS_TOKEN = token.trim();
    logEvent('info', 'admin.whatsapp_token.updated', { userId: req.user?.id, phoneId });
    return res.json({ status: 'updated', displayPhoneNumber: body.display_phone_number });
  } catch (err: any) {
    return fail(res, 500, `Erro ao validar token: ${err.message}`, 'WHATSAPP_TOKEN_VALIDATION_FAILED');
  }
});

// Jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const { location } = req.query;
    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);
    const jobs =
      location && typeof location === 'string'
        ? await dual.getJobsByLocation(`%${location}%`)
        : await dual.getActiveJobs();
    res.json(paginate(jobs, limit, offset));
  } catch {
    fail(res, 500, 'Erro interno', 'JOBS_LIST_FAILED');
  }
});

app.get('/api/recruiter/jobs', requireAuth('recruiter'), async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);
    const jobs = await dual.getJobsByRecruiter(req.user!.id);
    res.json(paginate(jobs, limit, offset));
  } catch {
    fail(res, 500, 'Erro interno', 'JOBS_RECRUITER_LIST_FAILED');
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = (await dual.getJobById(req.params.id)) as any;
    if (!job) return fail(res, 404, 'Vaga não encontrada', 'JOB_NOT_FOUND');
    res.json(job);
  } catch {
    fail(res, 500, 'Erro interno', 'JOB_FETCH_FAILED');
  }
});

app.post('/api/jobs', requireAuth('recruiter'), async (req, res) => {
  try {
    const { title, company, location, description, requirements, salaryRange, jobType, modality } =
      req.body;
    if (!title || !company || !location || !description) {
      return fail(
        res,
        400,
        'title, company, location, description são obrigatórios',
        'JOB_REQUIRED_FIELDS'
      );
    }
    const normalizedRequirements = normalizeJobRequirementsPayload(requirements);

    const id = randomUUID();
    await dual.createJob(
      id,
      req.user!.id,
      title,
      company,
      location,
      description,
      JSON.stringify(normalizedRequirements),
      salaryRange || null,
      jobType || 'CLT',
      modality || 'Hybrid'
    );

    for (const r of normalizedRequirements) {
      try {
        await dual.upsertInsight(randomUUID(), id, r.text, r.category || 'skill');
      } catch {
        // ignore duplicates
      }
    }

    const created = await dual.getJobById(id);
    res.status(201).json(created);
  } catch (err: any) {
    fail(res, 500, err.message || 'Erro interno', 'JOB_CREATE_FAILED');
  }
});

app.put('/api/jobs/:id', requireAuth('recruiter'), async (req, res) => {
  try {
    const jobId = String(req.params.id);
    const job = (await dual.getJobById(jobId)) as any;
    if (!job) return fail(res, 404, 'Vaga não encontrada', 'JOB_NOT_FOUND');
    if (job.recruiter_id !== req.user!.id) return fail(res, 403, 'Acesso negado', 'JOB_FORBIDDEN');

    const { title, description, requirements } = req.body;
    if (!title || !description)
      return fail(res, 400, 'title, description obrigatórios', 'JOB_UPDATE_REQUIRED_FIELDS');
    const normalizedRequirements = normalizeJobRequirementsPayload(requirements);

    await dual.updateJob(title, description, JSON.stringify(normalizedRequirements), jobId);
    res.json({ ok: true });
  } catch {
    fail(res, 500, 'Erro interno', 'JOB_UPDATE_FAILED');
  }
});

app.post('/api/jobs/:id/close', requireAuth('recruiter'), async (req, res) => {
  try {
    const jobId = String(req.params.id);
    const job = (await dual.getJobById(jobId)) as any;
    if (!job) return fail(res, 404, 'Vaga não encontrada', 'JOB_NOT_FOUND');
    if (job.recruiter_id !== req.user!.id) return fail(res, 403, 'Acesso negado', 'JOB_FORBIDDEN');

    await dual.closeJob(jobId);
    res.json({ ok: true });
  } catch {
    fail(res, 500, 'Erro interno', 'JOB_CLOSE_FAILED');
  }
});

app.get('/api/jobs/:id/applications', requireAuth('recruiter'), async (req, res) => {
  try {
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);
    const jobId = String(req.params.id);
    const job = (await dual.getJobById(jobId)) as any;
    if (!job) return fail(res, 404, 'Vaga não encontrada', 'JOB_NOT_FOUND');
    if (job.recruiter_id !== req.user!.id) return fail(res, 403, 'Acesso negado', 'JOB_FORBIDDEN');

    const data = await dual.getApplicationsByJob(jobId);
    const squad = await getAISquad();
    res.json(
      paginate(
        data.map((application: any) =>
          shapeJobApplicationForApi(application, Boolean(squad.governance.blindScreeningEnabled))
        ),
        limit,
        offset
      )
    );
  } catch {
    fail(res, 500, 'Erro interno', 'JOB_APPLICATIONS_LIST_FAILED');
  }
});

// Recruiter feedback on application (approve / reject / shortlist)
app.patch('/api/jobs/:jobId/applications/:appId', requireAuth('recruiter'), async (req, res) => {
  try {
    const jobId = String(req.params.jobId || '');
    const appId = String(req.params.appId || '');
    const { status, recruiter_notes } = req.body as { status?: string; recruiter_notes?: string };

    const allowed = ['new', 'shortlisted', 'interview', 'approved', 'rejected'];
    if (!status || !allowed.includes(status)) {
      return fail(res, 400, `status deve ser um de: ${allowed.join(', ')}`, 'INVALID_APP_STATUS');
    }

    const job = (await dual.getJobById(jobId)) as any;
    if (!job) return fail(res, 404, 'Vaga não encontrada', 'JOB_NOT_FOUND');
    if (job.recruiter_id !== req.user!.id) return fail(res, 403, 'Acesso negado', 'JOB_FORBIDDEN');

    await dual.updateApplicationStatus(status, recruiter_notes ?? '', appId);
    res.json({ id: appId, status, updated: true });
  } catch {
    fail(res, 500, 'Erro interno', 'APP_STATUS_UPDATE_FAILED');
  }
});

// Candidate
app.get('/api/candidate/profile', requireAuth('candidate'), async (req, res) => {
  try {
    let profile = (await dual.getProfileByUser(req.user!.id)) as any;
    if (!profile) {
      const id = `profile_${randomUUID()}`;
      await dual.createProfile(id, req.user!.id, null, null, null, null, null, null);
      profile = await dual.getProfileByUser(req.user!.id);
    }
    const diagnostic_unlocked = await dual.hasPaidDiagnostic(req.user!.id);
    res.json({ ...profile, diagnostic_unlocked });
  } catch {
    fail(res, 500, 'Erro interno', 'CANDIDATE_PROFILE_FETCH_FAILED');
  }
});

app.put('/api/candidate/profile', requireAuth('candidate'), async (req, res) => {
  try {
    const { name, email, phone, location, targetRole, seniority } = req.body;
    await dual.updateProfile(
      name || null,
      email || null,
      phone || null,
      location || null,
      targetRole || null,
      seniority || null,
      req.user!.id
    );
    res.json({ ok: true });
  } catch {
    fail(res, 500, 'Erro interno', 'CANDIDATE_PROFILE_UPDATE_FAILED');
  }
});

const cvAnalyzeLimiter = rateLimit({
  windowMs: 60 * 60_000,
  max: 5,
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  validate: false,
});

app.post(
  '/api/candidate/cv/analyze',
  requireAuth('candidate'),
  cvAnalyzeLimiter,
  async (req, res) => {
    try {
      const { cvText } = req.body;
      if (!cvText || typeof cvText !== 'string')
        return fail(res, 400, 'cvText obrigatório', 'CV_TEXT_REQUIRED');

      const hasPaid = await dual.hasPaidDiagnostic(req.user!.id);
      if (!hasPaid) {
        return fail(res, 402, 'Pagamento obrigatório. Adquira o diagnóstico para desbloquear a análise.', 'PAYMENT_REQUIRED');
      }

      const result = await analyzeCVSafe(cvText);

      const score = result.data?.score || 50;
      const breakdown = {
        clarity: score > 60,
        evidence: score > 70,
        focus: score > 50,
        freshness: score > 40,
      };

      await dual.setCV(
        cvText,
        score,
        JSON.stringify(breakdown),
        result.data?.reasoning || result.error?.message || '',
        JSON.stringify(result.data?.suggestions || []),
        req.user!.id
      );

      res.json(result);
    } catch (err: any) {
      fail(res, 500, err.message || 'Erro na análise', 'CV_ANALYZE_FAILED');
    }
  }
);

app.get('/api/candidate/cv/versions', requireAuth('candidate'), async (req, res) => {
  try {
    const profile = (await dual.getProfileByUser(req.user!.id)) as any;
    if (!profile) return fail(res, 404, 'Perfil não encontrado', 'PROFILE_NOT_FOUND');
    const versions = await dual.getVersionsByProfile(profile.id);
    res.json(versions);
  } catch {
    fail(res, 500, 'Erro interno', 'CV_VERSIONS_FETCH_FAILED');
  }
});

app.post('/api/public/apply', async (req, res) => {
  try {
    const { name, phone, email, jobId, cvText } = req.body;
    if (!name || !phone || !jobId || !cvText) {
      return fail(res, 400, 'Campos obrigatórios: name, phone, jobId, cvText', 'PUBLIC_APPLY_REQUIRED_FIELDS');
    }

    const job = (await dual.getJobById(jobId)) as any;
    if (!job) return fail(res, 404, 'Vaga não encontrada', 'JOB_NOT_FOUND');

    // Link or create profile by phone
    const normalizedPhone = toCanonicalDigits ? toCanonicalDigits(phone) : phone.replace(/\D/g, '');
    let profile = (await dual.getProfileByPhone(normalizedPhone)) as any;
    
    if (!profile) {
      const id = `profile_${randomUUID()}`;
      await dual.createProfile(
        id,
        null,
        name,
        email || `${normalizedPhone}@whatsapp.com`,
        normalizedPhone,
        null,
        null,
        null
      );
      profile = (await dual.getProfileByPhone(normalizedPhone)) as any;
    }

    const appId = `app_${randomUUID()}`;
    
    // 1. Intelligent CV Analysis for initial score
    let matchScore = 50;
    try {
      const analysis = await analyzeCVSafe(cvText);
      if (analysis.data) {
        matchScore = analysis.data.score;
      }
    } catch (err) {
      console.error('[public-apply] AI Analysis failed, defaulting to 50:', err);
    }

    // 2. Record application with real/fallback score
    await dual.applyToJob(profile.id, jobId, 'public_cv', matchScore, appId);

    res.json({ 
      success: true, 
      appId, 
      profileId: profile.id,
      matchScore 
    });
  } catch (err: any) {
    fail(res, 500, err.message || 'Erro interno', 'PUBLIC_APPLY_FAILED');
  }
});

app.post('/api/candidate/apply', requireAuth('candidate'), async (req, res) => {
  try {
    const { jobId, cvVersionId, matchScore } = req.body;
    if (!jobId) return fail(res, 400, 'jobId obrigatório', 'APPLICATION_JOB_ID_REQUIRED');

    const profile = (await dual.getProfileByUser(req.user!.id)) as any;
    if (!profile) return fail(res, 404, 'Perfil não encontrado', 'PROFILE_NOT_FOUND');

    const existing = (await dual.hasApplied(profile.id, jobId)) as any;
    if (existing.cnt > 0)
      return fail(res, 409, 'Candidatura já enviada', 'APPLICATION_ALREADY_EXISTS');

    const id = randomUUID();
    await dual.createApplication(id, profile.id, jobId, cvVersionId || null, matchScore || 0);
    await dual.incrementApplications(jobId);

    res.status(201).json({ id, status: 'applied' });
  } catch {
    fail(res, 500, 'Erro interno', 'APPLICATION_CREATE_FAILED');
  }
});

app.get('/api/candidate/applications', requireAuth('candidate'), async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);
    const profile = (await dual.getProfileByUser(req.user!.id)) as any;
    if (!profile) return fail(res, 404, 'Perfil não encontrado', 'PROFILE_NOT_FOUND');
    const applications = await dual.getApplicationsByProfile(profile.id);
    res.json(paginate(applications, limit, offset));
  } catch {
    fail(res, 500, 'Erro interno', 'APPLICATIONS_LIST_FAILED');
  }
});

// Payments
function normalizePhone(phone: string): string {
  return phone.replace(/\D+/g, '');
}

function isValidTaxId(taxId: string): boolean {
  const digits = taxId.replace(/\D+/g, '');
  return digits.length === 11 || digits.length === 14;
}

app.post('/api/payment/credits', requireAuth('recruiter'), async (req, res) => {
  try {
    const { packageId, customer } = req.body as any;
    const pkg = (CREDIT_PACKAGES as any)[packageId];
    if (!pkg) return fail(res, 400, 'Pacote inválido', 'PAYMENT_INVALID_PACKAGE');

    const authUser = (await users.findById(req.user!.id)) as any;
    const resolvedCustomer =
      customer ||
      (IS_PROD
        ? null
        : {
            name: authUser?.name || 'Recruiter',
            email: authUser?.email || `${req.user!.id}@recruta.ai`,
            phone: authUser?.phone || '11999990000',
            taxId: '00000000000',
          });

    if (
      !resolvedCustomer?.name ||
      !resolvedCustomer?.email ||
      !resolvedCustomer?.phone ||
      !resolvedCustomer?.taxId
    ) {
      return fail(
        res,
        400,
        'customer.name, customer.email, customer.phone, customer.taxId são obrigatórios',
        'PAYMENT_CUSTOMER_REQUIRED'
      );
    }

    const cleanPhone = normalizePhone(resolvedCustomer.phone);
    if (cleanPhone.length < 10) return fail(res, 400, 'Telefone inválido', 'PAYMENT_INVALID_PHONE');
    if (!isValidTaxId(resolvedCustomer.taxId))
      return fail(res, 400, 'CPF/CNPJ inválido', 'PAYMENT_INVALID_TAXID');

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4050';

    const billing = await createBilling({
      frequency: 'ONE_TIME',
      methods: ['PIX', 'CARD'],
      products: [
        {
          externalId: pkg.externalId,
          name: pkg.name,
          description: `${pkg.credits} créditos de triagem`,
          quantity: 1,
          price: pkg.priceCents,
        },
      ],
      returnUrl: `${frontendUrl}/recruiter/billing`,
      completionUrl: `${frontendUrl}/recruiter/billing?payment=success`,
      customer: {
        name: resolvedCustomer.name,
        cellphone: cleanPhone,
        email: resolvedCustomer.email,
        taxId: resolvedCustomer.taxId,
      },
    });

    await dual.createPayment(
      paymentId,
      billing.id,
      req.user!.id,
      'recruiter',
      'credits',
      pkg.credits,
      pkg.priceCents,
      `${frontendUrl}/recruiter/billing`,
      billing.url,
      JSON.stringify({ packageId, phone: cleanPhone, taxId: resolvedCustomer.taxId })
    );

    res.json({ paymentId, checkoutUrl: billing.url, amount: pkg.priceCents, credits: pkg.credits });
  } catch (err: any) {
    logEvent('error', 'payment.credits.create_failed', {
      error: err?.message,
      correlationId: (req as any).correlationId || null,
    });
    fail(res, 500, 'Erro ao criar pagamento', 'PAYMENT_CREATE_FAILED');
  }
});

app.post('/api/payment/diagnostic', requireAuth('candidate'), async (req, res) => {
  try {
    const { customer } = req.body as any;
    const authUser = (await users.findById(req.user!.id)) as any;
    const profile = (await dual.getProfileByUser(req.user!.id)) as any;
    const resolvedCustomer =
      customer ||
      (IS_PROD
        ? null
        : {
            name: profile?.name || authUser?.name || 'Candidate',
            email: profile?.email || authUser?.email || `${req.user!.id}@recruta.ai`,
            phone: profile?.phone || '11999990000',
            taxId: '00000000000',
          });

    if (
      !resolvedCustomer?.name ||
      !resolvedCustomer?.email ||
      !resolvedCustomer?.phone ||
      !resolvedCustomer?.taxId
    ) {
      return fail(
        res,
        400,
        'customer.name, customer.email, customer.phone, customer.taxId são obrigatórios',
        'PAYMENT_CUSTOMER_REQUIRED'
      );
    }

    const cleanPhone = normalizePhone(resolvedCustomer.phone);
    if (cleanPhone.length < 10) return fail(res, 400, 'Telefone inválido', 'PAYMENT_INVALID_PHONE');
    if (!isValidTaxId(resolvedCustomer.taxId))
      return fail(res, 400, 'CPF/CNPJ inválido', 'PAYMENT_INVALID_TAXID');

    const paymentId = `pay_diag_${Date.now()}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4050';

    const billing = await createBilling({
      frequency: 'ONE_TIME',
      methods: ['PIX', 'CARD'],
      products: [
        {
          externalId: DIAGNOSTIC_PRODUCT.externalId,
          name: DIAGNOSTIC_PRODUCT.name,
          description: DIAGNOSTIC_PRODUCT.description,
          quantity: 1,
          price: DIAGNOSTIC_PRODUCT.priceCents,
        },
      ],
      returnUrl: `${frontendUrl}/candidate`,
      completionUrl: `${frontendUrl}/candidate?payment=success`,
      customer: {
        name: resolvedCustomer.name,
        cellphone: cleanPhone,
        email: resolvedCustomer.email,
        taxId: resolvedCustomer.taxId,
      },
    });

    await dual.createPayment(
      paymentId,
      billing.id,
      req.user!.id,
      'candidate',
      'diagnostic',
      0,
      DIAGNOSTIC_PRODUCT.priceCents,
      `${frontendUrl}/candidate`,
      billing.url,
      JSON.stringify({ phone: cleanPhone, taxId: resolvedCustomer.taxId })
    );

    res.json({ paymentId, checkoutUrl: billing.url, amount: DIAGNOSTIC_PRODUCT.priceCents });
  } catch (err: any) {
    logEvent('error', 'payment.diagnostic.create_failed', {
      error: err?.message,
      correlationId: (req as any).correlationId || null,
    });
    fail(res, 500, 'Erro ao criar pagamento', 'PAYMENT_CREATE_FAILED');
  }
});

app.get('/api/recruiter/wallet', requireAuth('recruiter'), async (req, res) => {
  try {
    await dual.initWallet(req.user!.id);
    const wallet = await dual.getWallet(req.user!.id);
    const transactions = await dual.getTransactions(req.user!.id);
    const payments = await dual.getPaymentsByUser(req.user!.id, 'recruiter');
    res.json({ wallet, transactions, payments });
  } catch {
    fail(res, 500, 'Erro interno', 'WALLET_FETCH_FAILED');
  }
});

app.get('/api/recruiter/transactions', requireAuth('recruiter'), async (req, res) => {
  try {
    const transactions = await dual.getTransactions(req.user!.id);
    res.json(transactions);
  } catch {
    fail(res, 500, 'Erro interno', 'TRANSACTIONS_FETCH_FAILED');
  }
});

// Bulk analysis
const bulkAnalyzeLimiter = rateLimit({
  windowMs: 3_600_000,
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  validate: false,
});

app.post(
  '/api/recruiter/bulk-analyze',
  requireAuth('recruiter'),
  bulkAnalyzeLimiter,
  async (req, res) => {
    try {
      const { jobId, candidates } = req.body as { jobId?: string; candidates?: Array<any> };
      if (!jobId || !Array.isArray(candidates) || candidates.length === 0) {
        return fail(res, 400, 'jobId e candidates são obrigatórios', 'BULK_REQUIRED_FIELDS');
      }

      const job = (await dual.getJobById(jobId)) as any;
      if (!job) return fail(res, 404, 'Vaga não encontrada', 'JOB_NOT_FOUND');
      if (job.recruiter_id !== req.user!.id)
        return fail(res, 403, 'Acesso negado', 'JOB_FORBIDDEN');
      const squadPromise = getAISquad();

      await dual.initWallet(req.user!.id);
      const wallet = (await dual.getWallet(req.user!.id)) as any;
      const creditsNeeded = candidates.length;

      if (!wallet || wallet.balance < creditsNeeded) {
        return res.status(402).json({
          error: `Créditos insuficientes. Necessário: ${creditsNeeded}, disponível: ${wallet?.balance || 0}`,
          code: 'BILLING_INSUFFICIENT_CREDITS',
          details: {
            creditsNeeded,
            creditsAvailable: wallet?.balance || 0,
          },
        });
      }

      await dual.spendCredits(creditsNeeded, req.user!.id);
      const reqText = (job.requirements || []).map((r: any) => r.text).join(', ');

      const result = await bulkAnalyzeCVs(candidates, job.title, job.description, reqText, jobId);
      const squad = await squadPromise;
      const blindScreeningEnabled = Boolean(squad.governance.blindScreeningEnabled);

      for (const c of result.candidates) {
        const profileId = buildBulkCandidateProfileId(jobId, c.phone);
        try {
          await dual.createProfile(
            profileId,
            profileId,
            c.name,
            c.email || null,
            c.phone || null,
            null,
            job.title,
            null
          );
        } catch {
          // duplicate profile
        }

        await dual.setCV(
          c.cvText,
          c.matchScore,
          JSON.stringify({
            clarity: c.matchScore > 60,
            evidence: c.matchScore > 70,
            focus: c.matchScore > 50,
            freshness: c.matchScore > 40,
          }),
          c.summary,
          JSON.stringify(encodeBulkAttentionPoints(c.strengths || [], c.concerns || [])),
          profileId
        );
      }

      if (result.errors.length > 0) {
        await dual.addCredits(result.errors.length, 0, req.user!.id);
      }

      const updatedWallet = (await dual.getWallet(req.user!.id)) as any;

      res.json({
        jobId: result.jobId,
        totalAnalyzed: result.totalAnalyzed,
        candidates: result.candidates.map((candidate) =>
          shapeBulkAnalysisCandidateForApi(
            {
              ...candidate,
              profile_id: buildBulkCandidateProfileId(jobId, candidate.phone),
            },
            { jobId, blindScreeningEnabled }
          )
        ),
        errors: result.errors.map((error) =>
          shapeBulkAnalysisErrorForApi(error, { jobId, blindScreeningEnabled })
        ),
        creditsSpent: creditsNeeded - result.errors.length,
        creditsRefunded: result.errors.length,
        creditsRemaining: updatedWallet?.balance || 0,
      });
    } catch (err: any) {
      console.error('[bulk-analyze] error:', err);
      fail(res, 500, err.message || 'Erro interno', 'BULK_ANALYZE_FAILED');
    }
  }
);

app.get('/api/recruiter/bulk-results/:jobId', requireAuth('recruiter'), async (req, res) => {
  try {
    const jobId = String(req.params.jobId);
    const job = (await dual.getJobById(jobId)) as any;
    if (!job) return fail(res, 404, 'Vaga não encontrada', 'JOB_NOT_FOUND');
    if (job.recruiter_id !== req.user!.id) return fail(res, 403, 'Acesso negado', 'JOB_FORBIDDEN');

    const [profiles, squad] = await Promise.all([dual.listBulkProfilesByJob(jobId), getAISquad()]);
    res.json(
      (profiles || []).map((profile: any) =>
        shapeStoredBulkAnalysisResult(profile, {
          blindScreeningEnabled: Boolean(squad.governance.blindScreeningEnabled),
        })
      )
    );
  } catch {
    fail(res, 500, 'Erro interno', 'BULK_RESULTS_FETCH_FAILED');
  }
});

app.get('/api/recruiter/candidates', requireAuth('recruiter'), async (req, res) => {
  try {
    const { candidates } = await loadRecruiterCandidateBankForApi({ limit: 200 });
    res.json(candidates);
  } catch {
    fail(res, 500, 'Erro interno', 'CANDIDATE_BANK_FETCH_FAILED');
  }
});

app.get('/api/recruiter/candidates/export', requireAuth('recruiter'), async (req, res) => {
  try {
    const format = normalizeRecruiterCandidateExportFormat(req.query.format);
    if (!format) {
      return fail(res, 400, 'format deve ser csv ou json', 'EXPORT_FORMAT_INVALID');
    }

    const includePiiRequested = parseBooleanQueryFlag(req.query.includePii ?? req.query.include_pii);
    const requestedLimit = Number(req.query.limit ?? 1000);
    const safeLimit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.round(requestedLimit), 1), 2000)
      : 1000;

    const squad = await getAISquad();
    const governanceBlindScreeningEnabled = Boolean(squad.governance.blindScreeningEnabled);
    const includePiiApplied = includePiiRequested && !governanceBlindScreeningEnabled;
    const { candidates } = await loadRecruiterCandidateBankForApi({
      limit: safeLimit,
      blindScreeningEnabledOverride: !includePiiApplied,
      squad,
    });

    const rows = buildRecruiterCandidateExportRows(candidates);
    if (format === 'json') {
      return res.json({
        exportedAt: new Date().toISOString(),
        format,
        total: rows.length,
        includePiiRequested,
        includePiiApplied,
        governanceBlindScreeningEnabled,
        data: rows,
      });
    }

    const csv = encodeRecruiterCandidateExportCsv(rows);
    const dateSuffix = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="recruiter-candidates-${dateSuffix}.csv"`
    );
    res.send(csv);
  } catch {
    fail(res, 500, 'Erro interno', 'CANDIDATE_EXPORT_FAILED');
  }
});

// WhatsApp
const inviteLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  validate: false,
});

const bulkInviteLimiter = rateLimit({
  windowMs: 3_600_000,
  max: 5,
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  validate: false,
});

app.post('/api/whatsapp/invite', requireAuth('recruiter'), inviteLimiter, async (req, res) => {
  try {
    const { candidatePhone, candidateName, profileId, jobId, jobTitle, companyName, scenario } = req.body;
    if (!jobId || (!candidatePhone && !profileId)) {
      return fail(
        res,
        400,
        'jobId e candidatePhone ou profileId são obrigatórios',
        'WHATSAPP_INVITE_REQUIRED_FIELDS'
      );
    }

    const job = (await dual.getJobById(String(jobId))) as any;
    if (!job) return fail(res, 404, 'Vaga não encontrada', 'JOB_NOT_FOUND');
    if (job.recruiter_id !== req.user!.id) return fail(res, 403, 'Acesso negado', 'JOB_FORBIDDEN');

    const profile =
      profileId && String(profileId).trim().length > 0
        ? ((await dual.getProfileById(String(profileId).trim())) as any)
        : null;
    if (profileId && !profile) {
      return fail(res, 404, 'Perfil não encontrado', 'PROFILE_NOT_FOUND');
    }

    const resolvedCandidatePhone =
      String(candidatePhone || '').trim() || String(profile?.phone || '').trim();
    if (!resolvedCandidatePhone) {
      return fail(
        res,
        400,
        'Não foi possível resolver o telefone do candidato',
        'WHATSAPP_INVITE_PHONE_REQUIRED'
      );
    }

    const resolvedCandidateName =
      String(candidateName || '').trim() || String(profile?.name || '').trim() || 'Candidato';
    const canonicalPhone = toCanonicalDigits(resolvedCandidatePhone);
    const sessionId = await createSession(
      canonicalPhone || resolvedCandidatePhone,
      resolvedCandidateName,
      jobId,
      jobTitle || 'Vaga',
      companyName || 'Empresa',
      req.user!.id,
      scenario === 'talent_bank' ? 'talent_bank' : 'direct'
    );

    res.json({ sessionId, status: 'invited' });
  } catch (err: any) {
    fail(res, 500, err.message || 'Erro interno', 'WHATSAPP_INVITE_FAILED');
  }
});

app.post('/api/resumes/upload', express.json({ limit: '10mb' }), requireAuth('recruiter'), async (req, res) => {
  const { jobId, fileName, fileType, base64 } = req.body;
  const recruiterId = (req as any).user?.id;

  if (!jobId || !base64) {
    return res.status(400).json({ error: 'Job ID and base64 content are required' });
  }

  try {
    const job = await dual.getJobById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // 1. Convert Base64 to Buffer
    const buffer = Buffer.from(base64, 'base64');

    // 2. Parse Resume with Gemini
    const parsed = await parseResume(buffer, fileType || 'application/pdf');
    
    // 3. Find or Create Profile
    let profile = await dual.getProfileByPhone(parsed.phone);
    if (!profile && parsed.email) {
      const u = await users.findByEmail(parsed.email);
      if (u) profile = await dual.getProfileByUser(u.id);
    }

    const profileId = profile?.id || randomUUID();
    if (!profile) {
      await dual.createProfile(
        profileId,
        null, // No user account yet
        parsed.name,
        parsed.email,
        parsed.phone,
        parsed.location || null,
        null,
        null
      );
    }

    // 4. Create CV Version
    const cvId = randomUUID();
    await supabase.from('cv_versions').insert([{
      id: cvId,
      profile_id: profileId,
      version_num: 1,
      target_job_id: jobId,
      cv_text: parsed.markdown,
      created_at: new Date().toISOString()
    }]);

    // 5. Start WhatsApp Session
    const sessionId = randomUUID();
    await createSession(
      sessionId,
      parsed.phone,
      parsed.name,
      jobId,
      recruiterId,
      { scenario: 'direct_invite' }
    );

    res.json({
      success: true,
      sessionId,
      candidateName: parsed.name,
      candidatePhone: parsed.phone,
      summary: parsed.summary
    });
  } catch (err: any) {
    console.error('[upload] Failed to process resume:', err);
    res.status(500).json({ error: err.message || 'Failed to process resume' });
  }
});

app.post(
  '/api/whatsapp/invite-bulk',
  requireAuth('recruiter'),
  bulkInviteLimiter,
  async (req, res) => {
    try {
      const { candidates, jobId, jobTitle, companyName, scenario } = req.body;
      const resolvedJobId = String(jobId || '').trim();
      if (!resolvedJobId || !Array.isArray(candidates) || candidates.length === 0) {
        return fail(
          res,
          400,
          'jobId e candidates são obrigatórios',
          'WHATSAPP_BULK_REQUIRED_FIELDS'
        );
      }

      const job = (await dual.getJobById(resolvedJobId)) as any;
      if (!job) return fail(res, 404, 'Vaga não encontrada', 'JOB_NOT_FOUND');
      if (job.recruiter_id !== req.user!.id) return fail(res, 403, 'Acesso negado', 'JOB_FORBIDDEN');

      const squad = await getAISquad();
      const blindScreeningEnabled = Boolean(squad.governance.blindScreeningEnabled);
      const results: Array<{
        profile_id: string | null;
        name: string | null;
        phone: string | null;
        sessionId?: string;
        error?: string;
        blind_candidate: ReturnType<typeof projectBlindCandidateIdentity>['blindCandidate'];
      }> = [];

      for (const rawCandidate of candidates) {
        const candidate =
          rawCandidate && typeof rawCandidate === 'object' ? (rawCandidate as Record<string, any>) : {};
        const profileId = String(candidate.profileId || '').trim() || null;
        const requestedName = String(candidate.name || '').trim();
        const requestedPhone = String(candidate.phone || '').trim();
        const requestedReferenceId =
          profileId ||
          `bulk_${resolvedJobId}_${String(requestedPhone || '')
            .replace(/\D+/g, '')
            .slice(-16) || 'candidate'}`;
        let resolvedName = requestedName || 'Candidato';
        let resolvedPhone = requestedPhone;
        let candidateProjection = projectBlindCandidateIdentity({
          referenceId: requestedReferenceId,
          candidateName: requestedName,
          candidatePhone: requestedPhone,
          enabled: blindScreeningEnabled,
        });

        try {
          if (profileId) {
            const profile = (await dual.getProfileById(profileId)) as any;
            if (!profile) throw new Error('PROFILE_NOT_FOUND');
            resolvedName = requestedName || String(profile?.name || '').trim() || 'Candidato';
            resolvedPhone = requestedPhone || String(profile?.phone || '').trim();
            candidateProjection = projectBlindCandidateIdentity({
              referenceId: profileId,
              candidateName: resolvedName,
              candidatePhone: resolvedPhone,
              enabled: blindScreeningEnabled,
            });
          }

          if (!resolvedPhone) throw new Error('WHATSAPP_INVITE_PHONE_REQUIRED');
          const canonicalPhone = toCanonicalDigits(String(resolvedPhone || ''));
          const sessionId = await createSession(
            canonicalPhone || resolvedPhone,
            resolvedName,
            resolvedJobId,
            jobTitle || 'Vaga',
            companyName || 'Empresa',
            req.user!.id,
            scenario === 'talent_bank' ? 'talent_bank' : 'direct'
          );

          results.push({
            profile_id: profileId,
            name: candidateProjection.candidateName || candidateProjection.blindCandidate.label,
            phone: candidateProjection.candidatePhone,
            sessionId,
            blind_candidate: candidateProjection.blindCandidate,
          });
        } catch (err: any) {
          const reason = String(err?.message || '').trim();
          const error =
            reason === 'PROFILE_NOT_FOUND'
              ? 'Perfil não encontrado'
              : reason === 'WHATSAPP_INVITE_PHONE_REQUIRED'
                ? 'Telefone do candidato não encontrado'
                : 'Erro ao convidar';

          results.push({
            profile_id: profileId,
            name: candidateProjection.candidateName || candidateProjection.blindCandidate.label,
            phone: candidateProjection.candidatePhone,
            error,
            blind_candidate: candidateProjection.blindCandidate,
          });
        }
      }

      res.json({ total: candidates.length, results });
    } catch (err: any) {
      fail(res, 500, err.message || 'Erro interno', 'WHATSAPP_BULK_INVITE_FAILED');
    }
  }
);

app.get('/api/whatsapp/sessions/:sessionId/audios', requireAuth('recruiter'), async (req, res) => {
  try {
    const sessionId = String(req.params.sessionId);
    const session = (await wa.getSession(sessionId)) as any;
    if (!session) return fail(res, 404, 'Sessão não encontrada', 'WHATSAPP_SESSION_NOT_FOUND');
    if (session.recruiter_id !== req.user!.id)
      return fail(res, 403, 'Acesso negado', 'WHATSAPP_SESSION_FORBIDDEN');

    const audios = await wa.getAudioBySession(sessionId);
    res.json(
      (audios || []).map((a: any) => ({
        id: a.id,
        sessionId: a.session_id,
        createdAt: a.created_at,
        transcription: a.transcription || null,
        streamPath: `/api/whatsapp/audio/${a.id}/stream`,
      }))
    );
  } catch {
    fail(res, 500, 'Erro interno', 'WHATSAPP_AUDIOS_BY_SESSION_FAILED');
  }
});

app.get('/api/whatsapp/audio/:audioId/stream', requireAuth('recruiter'), async (req, res) => {
  try {
    const audioId = String(req.params.audioId);
    const audio = (await wa.getAudioById(audioId)) as any;
    if (!audio) return fail(res, 404, 'Áudio não encontrado', 'WHATSAPP_AUDIO_NOT_FOUND');

    const session = (await wa.getSession(audio.session_id)) as any;
    if (!session) return fail(res, 404, 'Sessão não encontrada', 'WHATSAPP_SESSION_NOT_FOUND');
    if (session.recruiter_id !== req.user!.id)
      return fail(res, 403, 'Acesso negado', 'WHATSAPP_AUDIO_FORBIDDEN');

    const media = await downloadMediaWithMeta(audio.wa_media_id);
    const contentType = media.mimeType || 'audio/ogg';
    const buffer = Buffer.from(media.buffer);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', String(buffer.length));
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buffer);
  } catch (err: any) {
    logEvent('error', 'whatsapp.audio.stream_failed', {
      error: err?.message,
      correlationId: (req as any).correlationId || null,
      userId: req.user?.id || null,
      audioId: req.params.audioId,
    });
    return fail(res, 502, 'Não foi possível carregar o áudio', 'WHATSAPP_AUDIO_STREAM_FAILED');
  }
});

app.get('/api/whatsapp/sessions/:jobId', requireAuth('recruiter'), async (req, res) => {
  try {
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);
    const sessions = await wa.getSessionsByJob(String(req.params.jobId));
    const squad = await getAISquad();
    res.json(
      paginate(
        (sessions || []).map((session: any) =>
          shapeSessionForApi(session, Boolean(squad.governance.blindScreeningEnabled))
        ),
        limit,
        offset
      )
    );
  } catch {
    fail(res, 500, 'Erro interno', 'WHATSAPP_SESSIONS_BY_JOB_FAILED');
  }
});

app.get('/api/jobs/:id/stats', requireAuth('recruiter'), async (req, res) => {
  try {
    const jobId = String(req.params.id || '');
    const job = (await dual.getJobById(jobId)) as any;
    if (!job) return fail(res, 404, 'Vaga não encontrada', 'JOB_NOT_FOUND');
    if (job.recruiter_id !== req.user!.id) return fail(res, 403, 'Acesso negado', 'JOB_FORBIDDEN');

    const sessions = await wa.getSessionsByJob(jobId);
    const applications = await dual.getApplicationsByJob(jobId);

    res.json({
      jobId,
      funnel: {
        invites: sessions.length, // Cada sessão é um convite
        responded: sessions.filter((s: any) => (s.responses?.length || 0) > 0).length,
        matchOk: applications.filter((a: any) => (a.match_score || 0) >= 70).length,
        hired: applications.filter((a: any) => a.status === 'approved').length,
      }
    });
  } catch (err: any) {
    fail(res, 500, err.message || 'Erro interno', 'JOB_STATS_FAILED');
  }
});

app.get('/api/whatsapp/recruiter/sessions', requireAuth('recruiter'), async (req, res) => {
  try {
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);
    const sessions = await wa.getSessionsByRecruiter(req.user!.id);
    const squad = await getAISquad();
    res.json(
      paginate(
        (sessions || []).map((session: any) =>
          shapeSessionForApi(session, Boolean(squad.governance.blindScreeningEnabled))
        ),
        limit,
        offset
      )
    );
  } catch {
    fail(res, 500, 'Erro interno', 'WHATSAPP_SESSIONS_BY_RECRUITER_FAILED');
  }
});

app.get('/api/recruiter/review-queue', requireAuth('recruiter'), async (req, res) => {
  try {
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);
    const sessions = await wa.getSessionsByRecruiter(req.user!.id);
    const squad = await getAISquad();
    const triagePolicy = resolveAreaPolicy(squad, 'triage');
    const qualityPolicy = resolveAreaPolicy(squad, 'quality');
    const requiresHumanReview =
      shouldRequireHumanReview(squad, triagePolicy) || shouldRequireHumanReview(squad, qualityPolicy);

    const items = (sessions || [])
      .map((session: any) =>
        buildRecruiterReviewQueueItem(session, {
          blindScreeningEnabled: Boolean(squad.governance.blindScreeningEnabled),
          requiresHumanReview,
        })
      )
      .filter(shouldIncludeInReviewQueue)
      .sort(compareReviewQueueItems);

    res.json(paginate(items, limit, offset));
  } catch {
    fail(res, 500, 'Erro interno', 'RECRUITER_REVIEW_QUEUE_FAILED');
  }
});

app.patch('/api/whatsapp/sessions/:sessionId', requireAuth('recruiter'), async (req, res) => {
  try {
    const sessionId = String(req.params.sessionId || '');
    const { recommendation, state, notes } = req.body as {
      recommendation?: 'entrevista' | 'rejeitar' | 'mais_info';
      state?: string;
      notes?: string;
    };

    const session = await wa.getSession(sessionId);
    if (!session) return fail(res, 404, 'Sessão não encontrada', 'WHATSAPP_SESSION_NOT_FOUND');
    if (session.recruiter_id !== req.user!.id)
      return fail(res, 403, 'Acesso negado', 'WHATSAPP_SESSION_FORBIDDEN');

    const now = new Date().toISOString();
    const patch: any = {
      updated_at: now,
      summary: updateSessionAnalysisMetadata(session.summary, {
        recommendation,
        recruiterReview:
          recommendation || typeof notes === 'string'
            ? {
                status: 'reviewed',
                reviewedAt: now,
                reviewedBy: req.user!.id,
                finalRecommendation: recommendation,
                notes: typeof notes === 'string' ? notes : null,
              }
            : undefined,
      }),
    };
    if (state) patch.state = state;

    await supabase.from('whatsapp_sessions').update(patch).eq('id', sessionId);
    res.json({ id: sessionId, updated: true });
  } catch {
    fail(res, 500, 'Erro interno', 'WHATSAPP_SESSION_UPDATE_FAILED');
  }
});

// JSON fallback for any unknown API route (prevents HTML responses on API clients).
app.use('/api', (_req, res) => {
  return fail(res, 404, 'Endpoint não encontrado', 'API_ROUTE_NOT_FOUND');
});

// Global error handler to keep API responses consistently in JSON.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!err) return next();

  const correlationId = ((req as any).correlationId as string | undefined) || null;
  const originalError = typeof err?.message === 'string' ? err.message : 'Internal server error';
  const isCorsError = originalError.startsWith('Origin not allowed:');
  const status = isCorsError ? 403 : 500;
  const code = isCorsError ? 'CORS_ORIGIN_NOT_ALLOWED' : 'INTERNAL_ERROR';
  const error = isCorsError ? 'Origin not allowed' : 'Erro interno';

  logEvent('error', 'http.unhandled_error', {
    correlationId,
    method: req.method,
    path: req.originalUrl,
    status,
    code,
    message: originalError,
  });

  if (req.path.startsWith('/api/')) {
    return res.status(status).json({
      error,
      code,
      details: { correlationId },
    });
  }

  return next(err);
});

if (IS_PROD) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath, { dotfiles: 'ignore', etag: true, maxAge: '1d' }));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return fail(res, 404, 'Endpoint não encontrado', 'API_ROUTE_NOT_FOUND');
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (process.env.SKIP_SERVER_START !== '1' && process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    logEvent('info', 'server.started', { port: PORT, bind: '0.0.0.0' });
    ensureBootstrapAdmin().catch((err) =>
      console.error('[BOOT] Falha no bootstrap de admin:', err)
    );
    ensureBootstrapSquad().catch((err) =>
      console.error('[BOOT] Falha no bootstrap de squad:', err)
    );
    autoSeed().catch((err) => logEvent('warn', 'autoseed.warning', { error: err.message }));
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EPERM' || err.code === 'EACCES') {
      console.warn(`[server] Falha ao escutar em 0.0.0.0:${PORT} (${err.code}). Tentando localhost...`);
      const fallback = app.listen(PORT, '127.0.0.1', () => {
        logEvent('info', 'server.started', { port: PORT, bind: '127.0.0.1' });
        ensureBootstrapAdmin().catch((e) => console.error('[BOOT] Admin bootstrap falhou:', e));
        ensureBootstrapSquad().catch((e) => console.error('[BOOT] Squad bootstrap falhou:', e));
        autoSeed().catch((e) => logEvent('warn', 'autoseed.warning', { error: e.message }));
      });
      fallback.on('error', (e2: NodeJS.ErrnoException) => {
        console.error(`[server] FATAL: não foi possível iniciar o servidor na porta ${PORT}.`);
        console.error(`   Erro: ${e2.code} — ${e2.message}`);
        console.error('   Verifique se outra instância já está rodando: lsof -i :' + PORT);
        process.exit(1);
      });
    } else if (err.code === 'EADDRINUSE') {
      console.error(`[server] Porta ${PORT} já está em uso. Encerre o processo anterior: lsof -ti:${PORT} | xargs kill -9`);
      process.exit(1);
    } else {
      console.error('[server] Erro inesperado:', err);
      process.exit(1);
    }
  });
}

export default app;
