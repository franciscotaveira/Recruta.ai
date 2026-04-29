/**
 * Conversation Flow Orchestrator V3
 * Deterministic triage flow:
 * 1) Invite
 * 2) Explicit accept/decline
 * 3) Structured questions
 * 4) Final AI analysis (no random score)
 */

import { randomUUID } from 'node:crypto';
import { wa, dual } from '../storage/db.js';
import {
  sendTextMessage,
  sendTemplate,
  downloadMediaWithMeta,
  sendListMessage,
  type InteractiveListRow,
} from '../whatsapp/client.js';
import { TEMPLATES, TEXT_MESSAGES } from '../whatsapp/templates.js';
import { toCanonicalDigits } from '../whatsapp/phone.js';
import { transcribeAudio } from '../ai/transcribe.js';
import { analyzeCandidate, type CandidateAnalysis } from '../ai/analyze.js';
import { getAIControl, type AIControlSettings } from '../admin/ai-control.js';
import { getAISquad, type AISquadSettings } from '../admin/ai-squad.js';
import { retrieveRAGContext } from '../ai/rag.js';
import { generateQuestions, type GeneratedQuestion } from './questions.js';
import { encodeSessionAnalysis, encodeSessionAnalysisWithMetadata } from './summary.js';
import {
  canUseAutomatedAnalysis,
  canUseRagByGovernance,
  resolveAreaPolicy,
  sanitizeForBlindScreening,
  shouldRequireHumanReview,
  shouldThrottleForCapacity,
} from './governance.js';
import { buildBlindCandidateSnapshot } from '../skills/blind-screening.js';
import {
  applyConfidenceAbstention,
  buildSessionConfidence,
} from '../skills/confidence-engine.js';
import { buildRecruiterReviewSnapshot } from '../review/queue.js';
import {
  buildStructuredQuestions,
  computeCompetencyScores,
  evaluateKnockoutReply,
  normalizeJobRequirements,
  type StructuredSessionQuestion,
} from './method.js';
import {
  isExplicitAcceptIntent,
  isExplicitConsentGrantIntent,
  isExplicitDeclineIntent,
  isHumanHandoffIntent,
  isTextFallbackIntent,
  looksLikePromptInjection,
  sanitizeForModelInput,
} from './intents.js';
import { analyzeResponseRealtime } from '../ai/sentiment.js';

const inboundPhoneLocks = new Map<string, Promise<void>>();

function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function triageCode(): string {
  return randomUUID();
}

const TRIAGE_CODE_ON_INVITE_ENABLED =
  String(process.env.WHATSAPP_SEND_TRIAGE_CODE_ON_INVITE || '1').trim() !== '0';

type SessionQuestion = {
  text: string;
  category: string;
  questionType: StructuredSessionQuestion['type'] | 'legacy';
  requirementId?: string;
  requirementText?: string;
  weight?: number;
};
type SessionQuestionType = SessionQuestion['questionType'];

function extractTriageCode(text: string): string | null {
  const raw = String(text || '').trim();
  if (!raw) return null;
  const uuidMatch = raw.match(/\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/i);
  if (uuidMatch?.[0]) return uuidMatch[0].toLowerCase();
  const legacyMatch = raw.match(/\b\d{13}_[a-z0-9]{8}\b/i);
  if (legacyMatch?.[0]) return legacyMatch[0];
  return null;
}

function looksLikeInterviewStartIntent(text: string): boolean {
  const normalized = sanitizeForModelInput(String(text || ''))
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
  return /(iniciar|comecar|comecar|entrevista|triagem|codigo|participar)/i.test(normalized);
}

async function createReentrySessionFromSource(
  sourceSession: any,
  candidatePhone: string
): Promise<any> {
  const newSessionId = triageCode();
  const canonicalPhone = toCanonicalDigits(candidatePhone) || candidatePhone;
  const sourceQuestions = safeQuestions(sourceSession?.questions);

  await wa.createSession(
    newSessionId,
    canonicalPhone,
    String(sourceSession?.candidate_name || 'Candidato'),
    String(sourceSession?.job_id || ''),
    String(sourceSession?.recruiter_id || ''),
    JSON.stringify(sourceQuestions)
  );

  await wa.addResponse(
    {
      system: 'reactivated_from_code',
      sourceSessionId: String(sourceSession?.id || ''),
      sourceState: String(sourceSession?.state || ''),
      createdAt: new Date().toISOString(),
    },
    newSessionId,
    { advanceQuestion: false }
  );

  return wa.getSession(newSessionId);
}

function buildTriageCodeMessage(sessionId: string): string {
  return `Numero da triagem -- ${sessionId} --\n\nGuarde esse codigo para retomar o processo se precisar.`;
}

async function sendTriageCodeMessage(
  toPhone: string,
  sessionId: string,
  sessionDbId: string
): Promise<void> {
  if (!TRIAGE_CODE_ON_INVITE_ENABLED) return;
  const message = buildTriageCodeMessage(sessionId);
  await sendTextMessage(toPhone, message);
  await wa.logMessage(uid(), sessionDbId, 'outbound', 'text', message, '', 'sent');
}

function buildJobContext(job: any): string {
  const description = String(job?.description || '');
  const requirements = Array.isArray(job?.requirements)
    ? job.requirements
        .map((r: any) => (typeof r === 'string' ? r : String(r?.text || '')))
        .filter((r: string) => r.trim().length > 0)
    : [];

  if (requirements.length === 0) return description;
  return `${description}\n\nRequisitos-chave:\n- ${requirements.join('\n- ')}`;
}

function safeQuestions(input: unknown): SessionQuestion[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (
        q
      ): q is {
        text?: unknown;
        category?: unknown;
        type?: unknown;
        questionType?: unknown;
        requirementId?: unknown;
        requirementText?: unknown;
        weight?: unknown;
      } => !!q && typeof q === 'object'
    )
    .map((q) => {
      const questionType: SessionQuestionType =
        q.questionType === 'knockout' || q.type === 'knockout'
          ? 'knockout'
          : q.questionType === 'bars' || q.type === 'bars'
            ? 'bars'
            : 'legacy';
      return {
        text: String(q.text || '').trim(),
        category: String(q.category || 'experience'),
        questionType,
        requirementId: typeof q.requirementId === 'string' ? q.requirementId : undefined,
        requirementText: typeof q.requirementText === 'string' ? q.requirementText : undefined,
        weight: Number.isFinite(Number(q.weight))
          ? Math.max(1, Math.min(5, Math.round(Number(q.weight))))
          : undefined,
      };
    })
    .filter((q) => q.text.length > 0);
}

async function buildSessionQuestionsForJob(
  job: { title?: string; description?: string; requirements?: unknown } | null,
  options?: { ragEnabled?: boolean }
): Promise<SessionQuestion[]> {
  const jobTitle = String(job?.title || 'Vaga');
  const jobContext = buildJobContext(job);
  const requirements = normalizeJobRequirements(job?.requirements);
  
  const structured = buildStructuredQuestions(jobTitle, requirements, {
    maxBarsQuestions: 4,
    maxKnockoutQuestions: 4,
  });

  // Se já temos 3 ou mais perguntas estruturadas, usamos elas.
  if (structured.length >= 3) {
    return structured.map((q) => ({
      text: q.text,
      category: q.category,
      questionType: q.type as SessionQuestionType,
      requirementId: q.requirementId,
      requirementText: q.requirementText,
      weight: q.weight,
    }));
  }

  // Se temos menos de 3, usamos a IA para complementar ou gerar do zero.
  let ragContext = '';
  if (options?.ragEnabled) {
    try {
      const rag = await retrieveRAGContext(`${jobTitle}\n${jobContext}`, 'question_generation');
      ragContext = rag.context;
    } catch (err) {
      console.error('[flow] RAG question context fallback:', err);
    }
  }

  // Pede para a IA gerar o complemento (ou o total)
  const neededCount = Math.max(3, 4 - structured.length);
  const generated = await generateQuestions(jobTitle, jobContext, neededCount, { ragContext });
  
  const finalQuestions: SessionQuestion[] = structured.map((q) => ({
    text: q.text,
    category: q.category,
    questionType: q.type as SessionQuestionType,
    requirementId: q.requirementId,
    requirementText: q.requirementText,
    weight: q.weight,
  }));

  generated.forEach((g: GeneratedQuestion) => {
    // Evita duplicar perguntas muito parecidas se já houver estruturadas
    if (!finalQuestions.some(fq => fq.text.toLowerCase().includes(g.text.toLowerCase().slice(0, 20)))) {
      finalQuestions.push({
        text: g.text,
        category: g.category,
        questionType: 'bars', // Novas perguntas seguem o padrão BARS/Situacional
      });
    }
  });

  return finalQuestions.slice(0, 5); // Limite de 5 perguntas para não cansar o candidato
}

async function ensureSessionQuestions(
  session: any,
  job: { title?: string; description?: string; requirements?: unknown } | null,
  options?: { ragEnabled?: boolean }
): Promise<SessionQuestion[]> {
  const existing = safeQuestions(session?.questions);
  if (existing.length > 0) return existing;

  const normalized = await buildSessionQuestionsForJob(job, options);
  await wa.updateSessionQuestions(JSON.stringify(normalized), session.id);
  return normalized;
}

type AnsweredQuestion = {
  question: string;
  transcription: string;
  questionType: SessionQuestion['questionType'];
  requirementId?: string;
  requirementText?: string;
  weight?: number;
  category: string;
};

function extractAnsweredQuestions(
  questions: SessionQuestion[],
  responses: unknown
): AnsweredQuestion[] {
  if (!Array.isArray(responses)) return [];

  return responses
    .filter((response: any) => response?.system !== 'deep_dive_requested' && !response?.system)
    .map((response: any, idx: number) => {
      const fallbackIdx = Number.isFinite(response?.questionIdx)
        ? Number(response.questionIdx)
        : idx;
      const questionMeta = questions?.[fallbackIdx];
      const question = String(response?.question || questionMeta?.text || `Pergunta ${idx + 1}`);
      const transcription = sanitizeForModelInput(
        String(response?.text || response?.transcription || '').trim()
      );
      const questionType: SessionQuestionType =
        response?.questionType === 'knockout' || questionMeta?.questionType === 'knockout'
          ? 'knockout'
          : response?.questionType === 'bars' || questionMeta?.questionType === 'bars'
            ? 'bars'
            : 'legacy';

      return {
        question,
        transcription,
        questionType,
        requirementId:
          typeof response?.requirementId === 'string'
            ? response.requirementId
            : questionMeta?.requirementId,
        requirementText:
          typeof response?.requirementText === 'string'
            ? response.requirementText
            : questionMeta?.requirementText,
        weight: Number.isFinite(Number(response?.weight))
          ? Math.round(Number(response.weight))
          : questionMeta?.weight,
        category: String(response?.category || questionMeta?.category || 'experience'),
      };
    })
    .filter((qa) => qa.transcription.length > 0);
}

function fallbackAnalysis(qaCount: number): CandidateAnalysis {
  const baseScore = 50 + Math.min(40, qaCount * 10);
  return {
    matchScore: Math.max(0, Math.min(100, baseScore)),
    summary:
      'Triagem concluída com análise parcial por fallback. Recomendamos validação manual antes da próxima etapa.',
    strengths: ['Completou a triagem e forneceu evidências de experiência'],
    concerns: ['Análise automática indisponível no momento'],
    recommendation: 'mais_info',
    questionScores: Array.from({ length: qaCount }, () => 60),
    competencyScores: [],
  };
}

function canUseTextFallback(userMessage: string, control: AIControlSettings): boolean {
  return control.textFallbackEnabled && isTextFallbackIntent(userMessage);
}

function isSessionInTextFallbackMode(responses: unknown): boolean {
  if (!Array.isArray(responses)) return false;
  return responses.some((r: any) => {
    if (!r || typeof r !== 'object') return false;
    if (r.system === 'mic_check_completed' && r.answerType === 'text') return true;
    if (r.system === 'text_fallback_enabled') return true;
    return false;
  });
}

type DeclineReason = {
  rank: number;
  code: string;
  menuId: string;
  label: string;
  patterns: RegExp[];
};

const DECLINE_REASONS: DeclineReason[] = [
  {
    rank: 1,
    code: 'salary_insufficient',
    menuId: 'decline_reason:salary_insufficient',
    label: 'Salário insuficiente',
    patterns: [/salari/i, /remuner/i, /valor baixo/i],
  },
  {
    rank: 2,
    code: 'location',
    menuId: 'decline_reason:location',
    label: 'Local de trabalho',
    patterns: [/local/i, /distanci/i, /desloc/i, /cidade/i],
  },
  {
    rank: 3,
    code: 'benefits',
    menuId: 'decline_reason:benefits',
    label: 'Benefícios',
    patterns: [/benefic/i, /vale/i, /plano/i],
  },
  {
    rank: 4,
    code: 'found_better_role',
    menuId: 'decline_reason:found_better_role',
    label: 'Achou vaga melhor',
    patterns: [/vaga melhor/i, /melhor proposta/i, /outra vaga/i],
  },
  {
    rank: 5,
    code: 'already_employed',
    menuId: 'decline_reason:already_employed',
    label: 'Já empregado',
    patterns: [/ja empregado/i, /já empregado/i, /empregado/i, /trabalhando/i],
  },
  {
    rank: 6,
    code: 'schedule',
    menuId: 'decline_reason:schedule',
    label: 'Escala/horário',
    patterns: [/escala/i, /horario/i, /horário/i, /turno/i],
  },
  {
    rank: 7,
    code: 'requirements',
    menuId: 'decline_reason:requirements',
    label: 'Requisitos insuficientes',
    patterns: [/requisit/i, /perfil/i, /experiencia/i, /experiência/i],
  },
  {
    rank: 8,
    code: 'contract_type',
    menuId: 'decline_reason:contract_type',
    label: 'Tipo de contratação',
    patterns: [/contrata/i, /clt/i, /pj/i, /temporar/i, /temporári/i],
  },
  {
    rank: 9,
    code: 'other',
    menuId: 'decline_reason:other',
    label: 'Outro motivo',
    patterns: [/outro/i, /prefiro nao informar/i, /prefiro não informar/i],
  },
];

function parseDeclineReason(text: string): DeclineReason | null {
  const normalized = sanitizeForModelInput(String(text || ''))
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
  if (!normalized) return null;
  const byMenuIdOrCode = DECLINE_REASONS.find(
    (reason) => reason.menuId === normalized || reason.code === normalized
  );
  if (byMenuIdOrCode) return byMenuIdOrCode;

  const byNumber = Number(normalized);
  if (Number.isInteger(byNumber)) {
    const mapped = DECLINE_REASONS.find((reason) => reason.rank === byNumber);
    if (mapped) return mapped;
  }

  return (
    DECLINE_REASONS.find((reason) => reason.patterns.some((pattern) => pattern.test(normalized))) ||
    null
  );
}

function isMoreInfoIntent(text: string): boolean {
  const normalized = sanitizeForModelInput(String(text || ''))
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
  return /(mais infos?|mais informac|detalhes?|saber mais)/i.test(normalized);
}

function buildInviteDetailsMessage(job: any): string {
  const title = String(job?.title || 'Vaga em aberto');
  const company = String(job?.company || 'Empresa contratante');
  const descriptionRaw = String(job?.description || '').replace(/\s+/g, ' ').trim();
  const description = descriptionRaw.length > 320 ? `${descriptionRaw.slice(0, 317)}...` : descriptionRaw;

  const header = [`*Mais infos sobre a vaga*`, `Cargo: ${title}`, `Empresa: ${company}`];
  if (description) header.push(`Resumo: ${description}`);
  header.push('');
  header.push('Se quiser participar da triagem, responda *SIM*.');
  header.push('Se preferir recusar, responda *NÃO*.');
  return header.join('\n');
}

const DECLINE_REASON_MENU_ENABLED =
  String(process.env.WHATSAPP_DECLINE_REASON_MENU_ENABLED || '1').trim() !== '0';

function declineReasonRows(): InteractiveListRow[] {
  return DECLINE_REASONS.map((reason) => ({
    id: reason.menuId,
    title: reason.label,
  }));
}

async function sendDeclineReasonPrompt(
  to: string,
  sessionId: string,
  mode: 'initial' | 'reminder'
): Promise<string> {
  if (DECLINE_REASON_MENU_ENABLED) {
    try {
      await sendListMessage(to, TEXT_MESSAGES.DECLINE_REASON_PROMPT_BODY, declineReasonRows(), {
        buttonText: TEXT_MESSAGES.DECLINE_REASON_PROMPT_BUTTON,
        sectionTitle: TEXT_MESSAGES.DECLINE_REASON_PROMPT_SECTION,
      });
      await wa.logMessage(
        uid(),
        sessionId,
        'outbound',
        'interactive',
        TEXT_MESSAGES.DECLINE_REASON_PROMPT_BODY,
        '',
        'sent'
      );
      return TEXT_MESSAGES.DECLINE_REASON_PROMPT_BODY;
    } catch (err) {
      console.error('[flow] interactive decline prompt failed, fallback to text:', err);
    }
  }

  const fallbackText =
    mode === 'initial' ? TEXT_MESSAGES.DECLINE_REASON_PROMPT : TEXT_MESSAGES.DECLINE_REASON_REMINDER;
  await wa.logMessage(uid(), sessionId, 'outbound', 'text', fallbackText, '', 'sent');
  await sendTextMessage(to, fallbackText);
  return fallbackText;
}

function hasDeepDiveMarker(responses: unknown, questionIdx: number): boolean {
  if (!Array.isArray(responses)) return false;
  return responses.some(
    (r: any) =>
      r &&
      typeof r === 'object' &&
      Number(r.questionIdx) === questionIdx &&
      r.system === 'deep_dive_requested'
  );
}

function shouldAskDeepDive(
  question: SessionQuestion | undefined,
  message: string,
  control: AIControlSettings
): boolean {
  if (!control.deepDiveEnabled) return false;
  const content = String(message || '').trim();
  if (!content) return false;

  const normalized = content
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const hasNumberSignal = /\d/.test(normalized);
  const mentionsResultSignal =
    /(resultado|impacto|entrega|meta|aumentou|reduziu|percentual|prazo|kpi)/i.test(normalized);
  const category = String(question?.category || 'experience').toLowerCase();
  const expectsEvidence = ['experience', 'technical', 'behavioral'].includes(category);

  if (!expectsEvidence) return false;
  if (wordCount < 20) return true;
  if (!hasNumberSignal && !mentionsResultSignal && wordCount < 40) return true;
  return false;
}

function buildDeepDivePrompt(question: SessionQuestion | undefined): string {
  const base = String(question?.text || 'sua resposta anterior');
  return `Obrigado. Para uma avaliação justa, preciso de um pouco mais de contexto sobre "${base}".\n\nExplique no formato *Situação -> Ação -> Resultado*, incluindo um exemplo concreto e, se possível, um número de impacto.`;
}

async function finalizeSession(
  session: any,
  job: any,
  questions: SessionQuestion[],
  control: AIControlSettings,
  squad: AISquadSettings
): Promise<{ nextState: 'completed'; recruiterSummary: string }> {
  const refreshedSession = (await wa.getSession(session.id)) as any;
  const answered = extractAnsweredQuestions(questions, refreshedSession?.responses || []);
  const triagePolicy = resolveAreaPolicy(squad, 'triage');
  const qualityPolicy = resolveAreaPolicy(squad, 'quality');
  const blindScreeningEnabled = Boolean(squad.governance.blindScreeningEnabled);
  const requiresHumanReview =
    shouldRequireHumanReview(squad, triagePolicy) || shouldRequireHumanReview(squad, qualityPolicy);
  const governanceNotes = [
    'Avalie somente evidências observáveis nas respostas.',
    'Evite inferência de atributos sensíveis (gênero, etnia, religião).',
    'Use foco em aderência técnica/comportamental à vaga.',
  ];

  const qa = answered
    .filter((item) => item.questionType !== 'knockout')
    .map((item) => ({
      question: sanitizeForBlindScreening(item.question, blindScreeningEnabled),
      transcription: sanitizeForBlindScreening(item.transcription, blindScreeningEnabled),
    }));

  let analysis: CandidateAnalysis;
  let fallbackAnalysisUsed = false;
  if (!canUseAutomatedAnalysis(control, triagePolicy)) {
    analysis = fallbackAnalysis(qa.length);
    fallbackAnalysisUsed = true;
    analysis.concerns = Array.from(
      new Set([
        ...analysis.concerns,
        'Análise automática limitada por política de governança/configuração.',
      ])
    );
  } else {
    try {
      let ragContext = '';
      if (canUseRagByGovernance(squad)) {
        const ragQuery = `${String(job?.title || 'Vaga')}\n${buildJobContext(job)}\n${qa
          .map((item) => item.transcription)
          .join('\n')}`;
        const rag = await retrieveRAGContext(ragQuery, 'analysis');
        ragContext = rag.context;
      }

      analysis = await analyzeCandidate(
        String(job?.title || 'Vaga'),
        buildJobContext(job),
        String(job?.company || 'Empresa'),
        qa,
        {
          ragContext,
          governanceNotes,
        }
      );
    } catch (err) {
      console.error('[flow] analyzeCandidate fallback:', err);
      analysis = fallbackAnalysis(qa.length);
      fallbackAnalysisUsed = true;
    }
  }

  analysis.competencyScores = computeCompetencyScores(
    answered
      .filter((item) => item.questionType !== 'knockout')
      .map((item) => ({
        requirementId: item.requirementId,
        requirementText: item.requirementText,
        category: item.category,
        weight: item.weight,
      })),
    analysis.questionScores || []
  );

  const knockoutAnswers = answered.filter((item) => item.questionType === 'knockout');
  if (knockoutAnswers.length > 0) {
    analysis.knockout = {
      status: 'pass',
      reason: 'Requisitos eliminatórios respondidos como atendidos.',
      details: knockoutAnswers.map((item) => ({
        requirementId: item.requirementId,
        requirementText: item.requirementText,
        weight: item.weight,
      })),
    };
  }

  if (requiresHumanReview) {
    analysis.concerns = Array.from(
      new Set([
        ...analysis.concerns,
        'Revisão humana obrigatória antes de qualquer decisão final.',
      ])
    );
  }

  const confidence = buildSessionConfidence({
    questions,
    responses: refreshedSession?.responses || [],
    analysis,
    fallbackAnalysisUsed,
  });
  const finalAnalysis = applyConfidenceAbstention({
    analysis,
    confidence,
    requiresHumanReview,
  });
  const blindCandidate = buildBlindCandidateSnapshot({
    referenceId: String(session.id || ''),
    candidateName: session?.candidate_name,
    candidatePhone: session?.candidate_phone,
    enabled: blindScreeningEnabled,
  });
  const recruiterReview = buildRecruiterReviewSnapshot({
    state: 'completed',
    existingReview: null,
    confidence,
    requiresHumanReview,
  });

  await wa.setSummary(
    encodeSessionAnalysisWithMetadata(finalAnalysis, {
      confidence,
      recruiterReview,
      blindCandidate,
    }),
    finalAnalysis.matchScore,
    session.id
  );

  const candidateMsg =
    'Perfeito! Encerramos sua etapa de áudio. O time de RH vai avaliar seu diagnóstico e te atualizar pelos próximos canais.';
  await wa.logMessage(uid(), session.id, 'outbound', 'text', candidateMsg, '', 'sent');
  await sendTextMessage(session.candidate_phone, candidateMsg);

  return {
    nextState: 'completed',
    recruiterSummary: finalAnalysis.summary,
  };
}

export async function createSession(
  candidatePhone: string,
  candidateName: string,
  jobId: string,
  jobTitle: string,
  companyName: string,
  recruiterId: string,
  scenario: 'direct' | 'talent_bank' = 'direct'
): Promise<string> {
  const sessionId = triageCode();
  const canonicalPhone = toCanonicalDigits(candidatePhone);
  const job = (await dual.getJobById(jobId)) as any;
  const squad = await getAISquad();
  const ragEnabled = canUseRagByGovernance(squad);

  const resolvedJobTitle = String(jobTitle || job?.title || 'Vaga');
  const resolvedCompanyName = String(companyName || job?.company || 'Empresa');
  const questions = await buildSessionQuestionsForJob({
    title: resolvedJobTitle,
    description: job?.description,
    requirements: job?.requirements,
  }, { ragEnabled });

  await wa.createSession(
    sessionId,
    canonicalPhone || candidatePhone,
    candidateName,
    jobId,
    recruiterId,
    JSON.stringify(questions)
  );

  try {
    const template = scenario === 'talent_bank' ? TEMPLATES.TALENT_BANK_INVITE : TEMPLATES.INVITE;
    const templateVars = scenario === 'talent_bank' 
      ? TEMPLATES.TALENT_BANK_INVITE.buildVariables(candidateName, resolvedCompanyName, resolvedJobTitle)
      : TEMPLATES.INVITE.buildVariables(candidateName, resolvedJobTitle, resolvedCompanyName);

    await sendTemplate(canonicalPhone || candidatePhone, template.name, 'pt_BR', [
      {
        type: 'body',
        parameters: templateVars,
      },
    ] as any);
    await wa.logMessage(
      uid(),
      sessionId,
      'outbound',
      'template',
      `Template: ${template.name} (Scenario: ${scenario})`,
      '',
      'sent'
    );
    await sendTriageCodeMessage(canonicalPhone || candidatePhone, sessionId, sessionId);
  } catch (err: any) {
    console.error(`[flow] Failed to send invite to ${canonicalPhone || candidatePhone}:`, err.message);
    await wa.logMessage(
      uid(),
      sessionId,
      'outbound',
      'template',
      `Failed: ${err.message}`,
      '',
      'failed'
    );

    const fallbackTemplateName = String(process.env.WHATSAPP_FALLBACK_TEMPLATE_NAME || '').trim();
    const fallbackTemplateLang = String(
      process.env.WHATSAPP_FALLBACK_TEMPLATE_LANG || 'en_US'
    ).trim();
    if (fallbackTemplateName) {
      try {
        await sendTemplate(
          canonicalPhone || candidatePhone,
          fallbackTemplateName,
          fallbackTemplateLang,
          []
        );
        await wa.logMessage(
          uid(),
          sessionId,
          'outbound',
          'template',
          `Template fallback: ${fallbackTemplateName}`,
          '',
          'sent'
        );
        await sendTriageCodeMessage(canonicalPhone || candidatePhone, sessionId, sessionId);
        return sessionId;
      } catch (fallbackTemplateErr: any) {
        console.error(
          `[flow] Fallback template invite failed for ${canonicalPhone || candidatePhone}:`,
          fallbackTemplateErr?.message || fallbackTemplateErr
        );
        await wa.logMessage(
          uid(),
          sessionId,
          'outbound',
          'template',
          `Failed template fallback: ${fallbackTemplateErr?.message || 'unknown error'}`,
          '',
          'failed'
        );
      }
    }

    // Fallback: if template is unavailable (not approved/misconfigured), try plain text invite.
    try {
      const fallbackInvite = scenario === 'talent_bank'
        ? `Olá ${candidateName}! A empresa ${resolvedCompanyName} iniciou um processo de seleção para a vaga ${resolvedJobTitle}, a qual você demonstrou interesse anteriormente. Deseja fazer parte desse processo?\n\nResponda *SIM* para começar.\n\n${buildTriageCodeMessage(sessionId)}`
        : `Olá ${candidateName}! Você foi pré-selecionado(a) para a vaga de ${resolvedJobTitle} na empresa ${resolvedCompanyName}.\n\nQuer participar de uma triagem rápida por áudio? Leva menos de 5 minutos.\n\nResponda *SIM* para começar ou *NÃO* para recusar.\n\n${buildTriageCodeMessage(sessionId)}`;
      await sendTextMessage(canonicalPhone || candidatePhone, fallbackInvite);
      await wa.logMessage(uid(), sessionId, 'outbound', 'text', fallbackInvite, '', 'sent');
    } catch (fallbackErr: any) {
      console.error(
        `[flow] Fallback text invite failed for ${canonicalPhone || candidatePhone}:`,
        fallbackErr?.message || fallbackErr
      );
      await wa.logMessage(
        uid(),
        sessionId,
        'outbound',
        'text',
        `Failed fallback: ${fallbackErr?.message || 'unknown error'}`,
        '',
        'failed'
      );
    }
  }

  return sessionId;
}

async function withPhoneLock<T>(phone: string, task: () => Promise<T>): Promise<T> {
  const key = toCanonicalDigits(phone) || phone;
  const currentTail = inboundPhoneLocks.get(key) ?? Promise.resolve();
  let result!: T;
  let thrown: unknown;

  const nextTail = currentTail.then(async () => {
    try {
      result = await task();
    } catch (err) {
      thrown = err;
    }
  });

  const settledTail = nextTail.finally(() => {
    if (inboundPhoneLocks.get(key) === settledTail) {
      inboundPhoneLocks.delete(key);
    }
  });
  inboundPhoneLocks.set(key, settledTail);

  await settledTail;
  if (thrown) throw thrown;
  return result;
}

async function processInboundMessageUnlocked(
  fromPhone: string,
  messageType: 'text' | 'audio',
  content: string,
  isAudio?: boolean
): Promise<{ sessionId: string; nextState: string; replyMessage?: string }> {
  const canonicalFrom = toCanonicalDigits(fromPhone) || fromPhone;
  let session = (await wa.getSessionByPhone(canonicalFrom)) as any;
  const extractedCode = !isAudio ? extractTriageCode(content) : null;
  let activatedByCode = false;
  let codeRotated = false;

  if (!session && extractedCode) {
    const source = (await wa.getSession(extractedCode)) as any;
    if (!source) {
      const invalidCodeMsg =
        'Nao encontrei esse numero da triagem. Confira o codigo e envie novamente no formato: INICIAR <codigo>.';
      await sendTextMessage(
        canonicalFrom,
        invalidCodeMsg
      );
      return { sessionId: '', nextState: 'no_session', replyMessage: invalidCodeMsg };
    }

    const sourcePhone = toCanonicalDigits(String(source.candidate_phone || ''));
    if (!sourcePhone || sourcePhone !== canonicalFrom) {
      const invalidOwnerMsg =
        'Esse codigo de triagem pertence a outro numero. Para sua seguranca, use apenas o codigo vinculado ao seu WhatsApp.';
      await sendTextMessage(canonicalFrom, invalidOwnerMsg);
      return { sessionId: '', nextState: 'no_session', replyMessage: invalidOwnerMsg };
    }

    const sourceState = String(source.state || '');
    if (['completed', 'declined'].includes(sourceState)) {
      session = await createReentrySessionFromSource(source, canonicalFrom);
      codeRotated = true;
    } else {
      session = source;
    }
    activatedByCode = Boolean(session);
  }

  if (!session) {
    if (!isAudio && looksLikeInterviewStartIntent(content)) {
      const missingCodeMsg =
        'Para iniciar por este canal, preciso do seu numero da triagem.\n\nEnvie: INICIAR <codigo-da-triagem>';
      await sendTextMessage(canonicalFrom, missingCodeMsg);
      return { sessionId: '', nextState: 'no_session', replyMessage: missingCodeMsg };
    }
    await sendTextMessage(
      canonicalFrom,
      'Olá! No momento não temos um processo ativo para seu número. Entre em contato com o recrutador para mais informações.'
    );
    return { sessionId: '', nextState: 'no_session' };
  }

  const job = (await dual.getJobById(session.job_id)) as any;
  if (!job) {
    await sendTextMessage(
      canonicalFrom,
      'Não localizei os dados da vaga neste momento. O recrutador será avisado para regularizar o processo.'
    );
    return { sessionId: session.id, nextState: session.state };
  }
  const aiControl = await getAIControl();
  const aiSquad = await getAISquad();
  const interviewPolicy = resolveAreaPolicy(aiSquad, 'interview');
  const ragEnabled = canUseRagByGovernance(aiSquad);

  let userMessage = content;
  if (!isAudio && activatedByCode && extractedCode) {
    const stripped = String(content || '').replace(extractedCode, '').trim();
    userMessage = stripped || 'SIM';
  }
  if (isAudio) {
    const audioRecordId = uid();
    try {
      const audio = await downloadMediaWithMeta(content);
      const totalBytes = Number(audio.fileSize || audio.buffer.byteLength || 0);
      if (totalBytes > aiControl.maxAudioBytes) {
        await sendTextMessage(
          fromPhone,
          'Seu áudio ficou muito longo para análise. Envie uma resposta de até 2 minutos, por favor.'
        );
        return { sessionId: session.id, nextState: session.state };
      }
      await wa.createAudioRecord(audioRecordId, session.id, content, `wa://${content}`);
      userMessage = await transcribeAudio(audio.buffer, audio.mimeType || 'audio/ogg');
      await wa.updateAudioTranscription(userMessage, audioRecordId);
    } catch (err) {
      console.error('[flow] audio processing failed:', err);
      await sendTextMessage(
        fromPhone,
        'Tive um problema para ouvir seu áudio. Pode responder por texto ou reenviar o áudio?'
      );
      return { sessionId: session.id, nextState: session.state };
    }
  }

  if (activatedByCode) {
    const activationMsg = codeRotated
      ? `Codigo validado. Geramos um novo numero da triagem para sua retomada: -- ${session.id} --`
      : 'Codigo validado. Sessao ativa localizada para continuar sua triagem.';
    await wa.logMessage(uid(), session.id, 'outbound', 'text', activationMsg, '', 'sent');
    await sendTextMessage(canonicalFrom, activationMsg);
  }

  await wa.logMessage(uid(), session.id, 'inbound', messageType, userMessage, '', 'delivered');

  if (session.state === 'completed' || session.state === 'declined') {
    const closedMsg =
      'Este processo já foi encerrado. Se houver nova vaga, o RH fará novo convite.';
    await wa.logMessage(uid(), session.id, 'outbound', 'text', closedMsg, '', 'sent');
    await sendTextMessage(canonicalFrom, closedMsg);
    return { sessionId: session.id, nextState: session.state, replyMessage: closedMsg };
  }

  if (session.state === 'decline_reason_pending') {
    const parsedReason = parseDeclineReason(userMessage);
    if (!parsedReason) {
      const reminder = await sendDeclineReasonPrompt(canonicalFrom, session.id, 'reminder');
      return {
        sessionId: session.id,
        nextState: 'decline_reason_pending',
        replyMessage: reminder,
      };
    }

    await wa.addResponse(
      {
        system: 'decline_reason',
        reasonCode: parsedReason.code,
        reasonLabel: parsedReason.label,
        text: sanitizeForModelInput(userMessage),
        createdAt: new Date().toISOString(),
      },
      session.id,
      { advanceQuestion: false }
    );

    const declineAnalysis: CandidateAnalysis = {
      matchScore: 0,
      summary: `Convite recusado pelo candidato. Motivo: ${parsedReason.label}.`,
      strengths: [],
      concerns: [`Candidato recusou convite antes da triagem. Motivo: ${parsedReason.label}.`],
      recommendation: 'rejeitar',
      questionScores: [],
      competencyScores: [],
    };
    await wa.declineSessionWithSummary(session.id, encodeSessionAnalysis(declineAnalysis), 0);
    await wa.logMessage(
      uid(),
      session.id,
      'outbound',
      'text',
      TEXT_MESSAGES.DECLINE_REASON_THANK_YOU,
      '',
      'sent'
    );
    await sendTextMessage(canonicalFrom, TEXT_MESSAGES.DECLINE_REASON_THANK_YOU);
    return {
      sessionId: session.id,
      nextState: 'declined',
      replyMessage: TEXT_MESSAGES.DECLINE_REASON_THANK_YOU,
    };
  }

  if (isExplicitDeclineIntent(userMessage)) {
    if (session.state === 'invited') {
      await wa.updateSessionState('decline_reason_pending', session.id);
      const prompt = await sendDeclineReasonPrompt(canonicalFrom, session.id, 'initial');
      return {
        sessionId: session.id,
        nextState: 'decline_reason_pending',
        replyMessage: prompt,
      };
    }

    if (session.state === 'consent_pending') {
      await wa.declineSession(session.id);
      await wa.logMessage(
        uid(),
        session.id,
        'outbound',
        'text',
        TEXT_MESSAGES.CONSENT_DECLINED,
        '',
        'sent'
      );
      await sendTextMessage(canonicalFrom, TEXT_MESSAGES.CONSENT_DECLINED);
      return {
        sessionId: session.id,
        nextState: 'declined',
        replyMessage: TEXT_MESSAGES.CONSENT_DECLINED,
      };
    }

    await wa.declineSession(session.id);
    await wa.logMessage(uid(), session.id, 'outbound', 'text', TEXT_MESSAGES.DECLINED, '', 'sent');
    await sendTextMessage(canonicalFrom, TEXT_MESSAGES.DECLINED);
    return { sessionId: session.id, nextState: 'declined', replyMessage: TEXT_MESSAGES.DECLINED };
  }

  if (session.state === 'handoff_requested') {
    const waitingMsg =
      'Seu atendimento já foi encaminhado para o recrutador responsável. Em breve você receberá retorno humano por este canal.';
    await wa.logMessage(uid(), session.id, 'outbound', 'text', waitingMsg, '', 'sent');
    await sendTextMessage(canonicalFrom, waitingMsg);
    return { sessionId: session.id, nextState: 'handoff_requested', replyMessage: waitingMsg };
  }

  if (
    !interviewPolicy.enabled &&
    ['invited', 'consent_pending', 'mic_check', 'accepted', 'questioning'].includes(
      String(session.state)
    )
  ) {
    const governanceMsg =
      'Esta triagem automática está temporariamente indisponível por política de governança. Seu atendimento foi encaminhado para o recrutador.';
    await wa.updateSessionState('handoff_requested', session.id);
    await wa.addResponse(
      {
        system: 'governance_handoff',
        reason: 'interview_specialist_disabled',
        createdAt: new Date().toISOString(),
      },
      session.id,
      { advanceQuestion: false }
    );
    await wa.logMessage(uid(), session.id, 'outbound', 'text', governanceMsg, '', 'sent');
    await sendTextMessage(fromPhone, governanceMsg);
    return { sessionId: session.id, nextState: 'handoff_requested', replyMessage: governanceMsg };
  }

  if (
    ['accepted', 'questioning', 'consent_pending', 'mic_check'].includes(String(session.state)) &&
    isHumanHandoffIntent(userMessage)
  ) {
    const handoffMsg =
      'Perfeito. Vou encaminhar agora para atendimento humano do RH. Nossa automação fica pausada até o recrutador assumir.';
    await wa.updateSessionState('handoff_requested', session.id);
    await wa.addResponse(
      {
        system: 'handoff_requested',
        reason: sanitizeForModelInput(userMessage),
        requestedAt: new Date().toISOString(),
      },
      session.id,
      { advanceQuestion: false }
    );
    await wa.logMessage(uid(), session.id, 'outbound', 'text', handoffMsg, '', 'sent');
    await sendTextMessage(fromPhone, handoffMsg);
    return { sessionId: session.id, nextState: 'handoff_requested', replyMessage: handoffMsg };
  }

  if (session.state === 'invited') {
    if (isMoreInfoIntent(userMessage)) {
      const details = buildInviteDetailsMessage(job);
      await wa.logMessage(uid(), session.id, 'outbound', 'text', details, '', 'sent');
      await sendTextMessage(canonicalFrom, details);
      return { sessionId: session.id, nextState: 'invited', replyMessage: details };
    }

    if (!isExplicitAcceptIntent(userMessage)) {
      const guide =
        'Para iniciar sua triagem, responda *SIM*. Se preferir não participar, responda *NÃO*. Se precisar falar com alguém do RH, responda *HUMANO*.';
      await wa.logMessage(uid(), session.id, 'outbound', 'text', guide, '', 'sent');
      await sendTextMessage(canonicalFrom, guide);
      return { sessionId: session.id, nextState: 'invited', replyMessage: guide };
    }

    const activeSessions = await wa.getActiveSessions();
    if (shouldThrottleForCapacity(aiSquad, activeSessions.length)) {
      const capacityMsg =
        'Estamos com alta demanda no momento. Seu processo foi encaminhado para acompanhamento humano do RH.';
      await wa.updateSessionState('handoff_requested', session.id);
      await wa.addResponse(
        {
          system: 'capacity_handoff',
          activeSessions: activeSessions.length,
          maxParallelSessions: aiSquad.governance.maxParallelSessions,
          createdAt: new Date().toISOString(),
        },
        session.id,
        { advanceQuestion: false }
      );
      await wa.logMessage(uid(), session.id, 'outbound', 'text', capacityMsg, '', 'sent');
      await sendTextMessage(fromPhone, capacityMsg);
      return {
        sessionId: session.id,
        nextState: 'handoff_requested',
        replyMessage: capacityMsg,
      };
    }

    if (!aiSquad.governance.consentRequired) {
      await wa.updateSessionState('mic_check', session.id);
      await wa.logMessage(
        uid(),
        session.id,
        'outbound',
        'text',
        TEXT_MESSAGES.MIC_CHECK_REQUEST,
        '',
        'sent'
      );
      await sendTextMessage(fromPhone, TEXT_MESSAGES.MIC_CHECK_REQUEST);
      return {
        sessionId: session.id,
        nextState: 'mic_check',
        replyMessage: TEXT_MESSAGES.MIC_CHECK_REQUEST,
      };
    }

    await wa.updateSessionState('consent_pending', session.id);
    await wa.logMessage(
      uid(),
      session.id,
      'outbound',
      'text',
      TEXT_MESSAGES.CONSENT_REQUEST,
      '',
      'sent'
    );
    await sendTextMessage(fromPhone, TEXT_MESSAGES.CONSENT_REQUEST);
    return {
      sessionId: session.id,
      nextState: 'consent_pending',
      replyMessage: TEXT_MESSAGES.CONSENT_REQUEST,
    };
  }

  if (session.state === 'consent_pending') {
    if (!aiSquad.governance.consentRequired) {
      await wa.updateSessionState('mic_check', session.id);
      await wa.logMessage(
        uid(),
        session.id,
        'outbound',
        'text',
        TEXT_MESSAGES.MIC_CHECK_REQUEST,
        '',
        'sent'
      );
      await sendTextMessage(fromPhone, TEXT_MESSAGES.MIC_CHECK_REQUEST);
      return {
        sessionId: session.id,
        nextState: 'mic_check',
        replyMessage: TEXT_MESSAGES.MIC_CHECK_REQUEST,
      };
    }

    if (isExplicitDeclineIntent(userMessage)) {
      await wa.declineSession(session.id);
      await wa.logMessage(
        uid(),
        session.id,
        'outbound',
        'text',
        TEXT_MESSAGES.CONSENT_DECLINED,
        '',
        'sent'
      );
      await sendTextMessage(fromPhone, TEXT_MESSAGES.CONSENT_DECLINED);
      return {
        sessionId: session.id,
        nextState: 'declined',
        replyMessage: TEXT_MESSAGES.CONSENT_DECLINED,
      };
    }

    if (!isExplicitConsentGrantIntent(userMessage)) {
      await wa.logMessage(
        uid(),
        session.id,
        'outbound',
        'text',
        TEXT_MESSAGES.CONSENT_REMINDER,
        '',
        'sent'
      );
      await sendTextMessage(fromPhone, TEXT_MESSAGES.CONSENT_REMINDER);
      return {
        sessionId: session.id,
        nextState: 'consent_pending',
        replyMessage: TEXT_MESSAGES.CONSENT_REMINDER,
      };
    }

    await wa.updateSessionState('mic_check', session.id);
    await wa.logMessage(
      uid(),
      session.id,
      'outbound',
      'text',
      TEXT_MESSAGES.MIC_CHECK_REQUEST,
      '',
      'sent'
    );
    await sendTextMessage(fromPhone, TEXT_MESSAGES.MIC_CHECK_REQUEST);
    return {
      sessionId: session.id,
      nextState: 'mic_check',
      replyMessage: TEXT_MESSAGES.MIC_CHECK_REQUEST,
    };
  }

  if (session.state === 'mic_check') {
    if (!isAudio && !canUseTextFallback(userMessage, aiControl)) {
      await wa.logMessage(
        uid(),
        session.id,
        'outbound',
        'text',
        TEXT_MESSAGES.MIC_CHECK_REMINDER,
        '',
        'sent'
      );
      await sendTextMessage(fromPhone, TEXT_MESSAGES.MIC_CHECK_REMINDER);
      return {
        sessionId: session.id,
        nextState: 'mic_check',
        replyMessage: TEXT_MESSAGES.MIC_CHECK_REMINDER,
      };
    }

    const questions = await ensureSessionQuestions(session, job, { ragEnabled });
    const firstQuestion =
      questions[0]?.text || 'Conte brevemente sobre sua experiência mais relevante para esta vaga.';
    const kickoff = `${TEXT_MESSAGES.MIC_CHECK_SUCCESS}\n\n${TEXT_MESSAGES.FIRST_QUESTION(String(job.title || 'Vaga'), firstQuestion, questions.length || 1)}`;

    await wa.addResponse(
      {
        system: 'mic_check_completed',
        answerType: isAudio ? 'audio' : 'text',
        text: sanitizeForModelInput(userMessage),
        createdAt: new Date().toISOString(),
      },
      session.id,
      { advanceQuestion: false }
    );
    await wa.updateSessionState('accepted', session.id);
    await wa.logMessage(uid(), session.id, 'outbound', 'text', kickoff, '', 'sent');
    await sendTextMessage(fromPhone, kickoff);
    return { sessionId: session.id, nextState: 'accepted', replyMessage: kickoff };
  }

  const questions = await ensureSessionQuestions(session, job, { ragEnabled });
  const questionIdx = Math.max(0, Number(session.current_question_idx || 0));
  const currentQuestion = questions[questionIdx];

  if (session.state === 'accepted') {
    await wa.updateSessionState('questioning', session.id);
  }

  if (!currentQuestion) {
    const completion = await finalizeSession(session, job, questions, aiControl, aiSquad);
    return {
      sessionId: session.id,
      nextState: completion.nextState,
      replyMessage: completion.recruiterSummary,
    };
  }

  const textFallbackMode = isSessionInTextFallbackMode(session.responses);
  if (!isAudio && !textFallbackMode && !canUseTextFallback(userMessage, aiControl)) {
    const audioRequiredMsg =
      'Para esta etapa de triagem, preciso da resposta em *áudio* (até 2 minutos). Se estiver com problema técnico, me avise em texto.';
    await wa.logMessage(uid(), session.id, 'outbound', 'text', audioRequiredMsg, '', 'sent');
    await sendTextMessage(fromPhone, audioRequiredMsg);
    return { sessionId: session.id, nextState: 'questioning', replyMessage: audioRequiredMsg };
  }

  if (looksLikePromptInjection(userMessage)) {
    await wa.addResponse(
      {
        questionIdx,
        system: 'prompt_injection_flag',
        text: sanitizeForModelInput(userMessage),
        createdAt: new Date().toISOString(),
      },
      session.id,
      { advanceQuestion: false }
    );
  }

  const deepDiveAlreadyRequested = hasDeepDiveMarker(session.responses, questionIdx);
  if (currentQuestion.questionType === 'knockout') {
    const knockoutResult = evaluateKnockoutReply(userMessage);
    if (knockoutResult === 'unclear') {
      const clarification =
        'Para seguir, preciso de uma confirmação objetiva deste requisito eliminatório. Responda apenas *SIM* ou *NÃO*.';
      await wa.addResponse(
        {
          questionIdx,
          question: currentQuestion.text,
          questionType: currentQuestion.questionType,
          requirementId: currentQuestion.requirementId,
          requirementText: currentQuestion.requirementText,
          weight: currentQuestion.weight,
          system: 'knockout_unclear',
          text: sanitizeForModelInput(userMessage),
          answeredAt: new Date().toISOString(),
        },
        session.id,
        { advanceQuestion: false }
      );
      await wa.logMessage(uid(), session.id, 'outbound', 'text', clarification, '', 'sent');
      await sendTextMessage(fromPhone, clarification);
      return { sessionId: session.id, nextState: 'questioning', replyMessage: clarification };
    }

    if (knockoutResult === 'fail') {
      const declineReason = `Requisito eliminatório não atendido: ${currentQuestion.requirementText || currentQuestion.text}`;
      const declineAnalysis: CandidateAnalysis = {
        matchScore: 0,
        summary: 'Triagem encerrada por critério eliminatório obrigatório da vaga.',
        strengths: [],
        concerns: [declineReason],
        recommendation: 'rejeitar',
        questionScores: [],
        competencyScores: [],
        knockout: {
          status: 'fail',
          reason: declineReason,
          requirementId: currentQuestion.requirementId,
          requirementText: currentQuestion.requirementText,
          weight: currentQuestion.weight,
          questionType: 'knockout',
          answer: sanitizeForModelInput(userMessage),
        },
      };

      await wa.addResponse(
        {
          questionIdx,
          question: currentQuestion.text,
          questionType: currentQuestion.questionType,
          requirementId: currentQuestion.requirementId,
          requirementText: currentQuestion.requirementText,
          weight: currentQuestion.weight,
          text: sanitizeForModelInput(userMessage),
          type: messageType,
          answeredAt: new Date().toISOString(),
        },
        session.id,
        { advanceQuestion: false }
      );
      await wa.declineSessionWithSummary(session.id, encodeSessionAnalysis(declineAnalysis), 0);

      const declinedMsg =
        'Obrigado pelo retorno. Este requisito é eliminatório para esta vaga, então o processo foi encerrado nesta etapa.';
      await wa.logMessage(uid(), session.id, 'outbound', 'text', declinedMsg, '', 'sent');
      await sendTextMessage(fromPhone, declinedMsg);
      return { sessionId: session.id, nextState: 'declined', replyMessage: declinedMsg };
    }
  }

  if (
    currentQuestion.questionType !== 'knockout' &&
    !deepDiveAlreadyRequested &&
    shouldAskDeepDive(currentQuestion, userMessage, aiControl)
  ) {
    const followup = buildDeepDivePrompt(currentQuestion);
    await wa.addResponse(
      {
        questionIdx,
        question: currentQuestion.text,
        questionType: currentQuestion.questionType,
        requirementId: currentQuestion.requirementId,
        requirementText: currentQuestion.requirementText,
        weight: currentQuestion.weight,
        system: 'deep_dive_requested',
        requestedAt: new Date().toISOString(),
      },
      session.id,
      { advanceQuestion: false }
    );
    await wa.logMessage(uid(), session.id, 'outbound', 'text', followup, '', 'sent');
    await sendTextMessage(fromPhone, followup);
    return { sessionId: session.id, nextState: 'questioning', replyMessage: followup };
  }

  const sentimentData = await analyzeResponseRealtime(currentQuestion.text, userMessage);

  await wa.addResponse(
    {
      questionIdx,
      question: currentQuestion.text,
      questionType: currentQuestion.questionType,
      requirementId: currentQuestion.requirementId,
      requirementText: currentQuestion.requirementText,
      weight: currentQuestion.weight,
      text: sanitizeForModelInput(userMessage),
      type: messageType,
      answeredAt: new Date().toISOString(),
      sentiment: sentimentData.sentiment,
      clarity: sentimentData.clarity,
      keyInsight: sentimentData.keyInsights,
    },
    session.id
  );

  const nextQuestionIdx = questionIdx + 1;
  if (nextQuestionIdx < questions.length) {
    const nextQuestion = TEXT_MESSAGES.NEXT_QUESTION(
      questions[nextQuestionIdx].text,
      nextQuestionIdx + 1,
      questions.length
    );
    await wa.logMessage(uid(), session.id, 'outbound', 'text', nextQuestion, '', 'sent');
    await sendTextMessage(fromPhone, nextQuestion);
    return { sessionId: session.id, nextState: 'questioning', replyMessage: nextQuestion };
  }

  const completion = await finalizeSession(session, job, questions, aiControl, aiSquad);
  return {
    sessionId: session.id,
    nextState: completion.nextState,
    replyMessage: completion.recruiterSummary,
  };
}

export async function processInboundMessage(
  fromPhone: string,
  messageType: 'text' | 'audio',
  content: string,
  isAudio?: boolean
): Promise<{ sessionId: string; nextState: string; replyMessage?: string }> {
  return withPhoneLock(fromPhone, () =>
    processInboundMessageUnlocked(fromPhone, messageType, content, isAudio)
  );
}
