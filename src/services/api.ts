import type {
  AdminAIControlSettings,
  AdminAIRagDiagnostics,
  AdminAIRagSettings,
  AdminAISquad,
  AdminOverview,
  AnalyzeCVResponse,
  ApiErrorShape,
  BulkAnalysisResponse,
  BulkAnalysisResultItem,
  CandidateProfile,
  CreditTransaction,
  HealthResponse,
  JobApplication,
  JobRequirement,
  PaymentCheckoutResponse,
  PaymentCustomer,
  PublicJob,
  RecruiterCandidatesExportFormat,
  RecruiterCandidatesExportPayload,
  RecruiterReviewQueueItem,
  RecruiterWalletPayload,
  WhatsAppAudioFile,
  WhatsAppSession,
  PaginatedResponse,
} from '../contracts/api';
import {
  resolveApiBase as resolveRuntimeApiBase,
  resolveApiFallbackBase,
} from '../utils/runtimeHost';

function resolveApiBase(): string {
  const configured = String(import.meta.env.VITE_API_URL || '').trim();

  if (typeof window === 'undefined') {
    return configured ? configured.replace(/\/+$/, '') : '/api';
  }

  const normalized = configured.replace(/\/+$/, '');
  if (normalized.includes('localhost') && window.location.hostname !== 'localhost') {
    return '/api';
  }

  return resolveRuntimeApiBase({
    configuredApiUrl: normalized,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
  });
}

const API = resolveApiBase();
const ENABLE_API_SUBDOMAIN_FALLBACK =
  String(import.meta.env.VITE_ENABLE_API_SUBDOMAIN_FALLBACK || '').toLowerCase() === 'true';
const API_FALLBACK =
  !ENABLE_API_SUBDOMAIN_FALLBACK || typeof window === 'undefined'
    ? null
    : resolveApiFallbackBase({
        hostname: window.location.hostname,
        protocol: window.location.protocol,
      });

export class ApiError extends Error {
  code?: string;
  details?: unknown;

  constructor(payload: ApiErrorShape) {
    super(payload.error || 'API request failed');
    this.name = 'ApiError';
    this.code = payload.code;
    this.details = payload.details;
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('recruta_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function buildApiUrl(base: string, path: string): string {
  return `${base}${path}`;
}

function shouldRetryWithFallback(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return (
    error.code === 'API_NON_JSON_RESPONSE' ||
    error.code === 'API_INVALID_JSON' ||
    error.code === 'API_REQUEST_FAILED'
  );
}

async function requestJsonWithBase<T>(
  base: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers as Record<string, string>),
  };

  let res: Response;
  try {
    res = await fetch(buildApiUrl(base, path), { ...options, headers });
  } catch (error) {
    throw new ApiError({
      error: 'Falha de rede ao acessar API',
      code: 'API_REQUEST_FAILED',
      details: {
        path,
        base,
        reason: error instanceof Error ? error.message : 'unknown',
      },
    });
  }
  const rawBody = await res.text();
  const contentType = res.headers.get('content-type') || '';

  let data: unknown = null;
  if (rawBody.length > 0) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const payload = asRecord(data);
    if (data == null && !contentType.includes('application/json')) {
      throw new ApiError({
        error: `Endpoint returned non-JSON response (HTTP ${res.status})`,
        code: 'API_NON_JSON_RESPONSE',
        details: {
          path,
          base,
          status: res.status,
          contentType,
          preview: rawBody.slice(0, 140),
        },
      });
    }
    throw new ApiError({
      error: asString(payload?.error) || `HTTP ${res.status}`,
      code: asString(payload?.code),
      details: payload?.details,
    });
  }

  if (data == null) {
    throw new ApiError({
      error: 'Resposta inválida da API',
      code: 'API_INVALID_JSON',
      details: {
        path,
        base,
        status: res.status,
        contentType,
        preview: rawBody.slice(0, 140),
      },
    });
  }

  return data as T;
}

async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    return await requestJsonWithBase<T>(API, path, options);
  } catch (error) {
    if (!API_FALLBACK || API_FALLBACK === API || !shouldRetryWithFallback(error)) {
      throw error;
    }
    return requestJsonWithBase<T>(API_FALLBACK, path, options);
  }
}

async function requestBinaryWithBase(
  base: string,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    ...getAuthHeader(),
    ...(options.headers as Record<string, string>),
  };

  let res: Response;
  try {
    res = await fetch(buildApiUrl(base, path), { ...options, headers });
  } catch (error) {
    throw new ApiError({
      error: 'Falha de rede ao acessar API',
      code: 'API_REQUEST_FAILED',
      details: {
        path,
        base,
        reason: error instanceof Error ? error.message : 'unknown',
      },
    });
  }

  if (!res.ok) {
    const rawBody = await res.text();
    let payload: ApiErrorShape = { error: `HTTP ${res.status}` };
    try {
      const parsed = JSON.parse(rawBody);
      payload = {
        error: parsed?.error || payload.error,
        code: parsed?.code,
        details: parsed?.details,
      };
    } catch {
      payload = {
        error: `Falha na requisição binária (HTTP ${res.status})`,
        code: 'API_BINARY_REQUEST_FAILED',
        details: { path, base, status: res.status, preview: rawBody.slice(0, 140) },
      };
    }
    throw new ApiError(payload);
  }
  return res;
}

async function fetchBinary(path: string, options: RequestInit = {}): Promise<Response> {
  try {
    return await requestBinaryWithBase(API, path, options);
  } catch (error) {
    if (!API_FALLBACK || API_FALLBACK === API || !shouldRetryWithFallback(error)) {
      throw error;
    }
    return requestBinaryWithBase(API_FALLBACK, path, options);
  }
}

function toPaginated<T>(
  response: unknown,
  fallbackLimit: number,
  fallbackOffset: number
): PaginatedResponse<T> {
  if (Array.isArray(response)) {
    return {
      data: response as T[],
      total: response.length,
      limit: fallbackLimit,
      offset: fallbackOffset,
    };
  }

  const payload = asRecord(response);

  return {
    data: Array.isArray(payload?.data) ? (payload.data as T[]) : [],
    total: typeof payload?.total === 'number' ? payload.total : 0,
    limit: typeof payload?.limit === 'number' ? payload.limit : fallbackLimit,
    offset: typeof payload?.offset === 'number' ? payload.offset : fallbackOffset,
  };
}

// Auth
export async function login(email: string, password: string) {
  return fetchJson<{
    token: string;
    userId: string;
    role: 'candidate' | 'recruiter' | 'admin';
    email: string;
    name?: string;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  email: string,
  password: string,
  role: 'candidate' | 'recruiter',
  name?: string
) {
  return fetchJson<{
    token: string;
    userId: string;
    role: 'candidate' | 'recruiter';
    email: string;
    name?: string;
  }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, role, name }),
  });
}

export async function getCurrentUser() {
  return fetchJson<{
    id: string;
    email: string;
    role: 'candidate' | 'recruiter' | 'admin';
    name?: string;
    verified?: boolean;
  }>('/auth/me');
}

// Jobs
export async function getPublicJobs(location?: string, limit = 20, offset = 0) {
  const params = new URLSearchParams();
  if (location) params.set('location', location);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  const response = await fetchJson<unknown>(`/jobs?${params.toString()}`);
  return toPaginated<PublicJob>(response, limit, offset);
}

export async function getPublicJob(id: string) {
  return fetchJson<PublicJob>(`/jobs/${id}`);
}

export async function getRecruiterJobs(limit = 50, offset = 0) {
  const response = await fetchJson<unknown>(`/recruiter/jobs?limit=${limit}&offset=${offset}`);
  return toPaginated<PublicJob>(response, limit, offset);
}

export async function postJob(data: {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: Array<{
    text: string;
    category: string;
    importance?: 'must_have' | 'preferred' | 'should_have' | 'nice_to_have';
    weight?: number;
    knockout?: boolean;
    evidenceType?:
      | 'objective'
      | 'behavioral'
      | 'technical'
      | 'situational'
      | 'audio_answer'
      | 'experience'
      | 'portfolio';
    knockoutQuestion?: string;
  }>;
  salaryRange?: string;
  jobType?: string;
  modality?: string;
}) {
  return fetchJson<PublicJob>('/jobs', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateJob(
  id: string,
  data: { title: string; description: string; requirements?: JobRequirement[] }
) {
  return fetchJson<{ ok: true }>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function closeJob(id: string) {
  return fetchJson<{ ok: true }>(`/jobs/${id}/close`, { method: 'POST' });
}

export async function getJobApplications(jobId: string, limit = 50, offset = 0) {
  const response = await fetchJson<unknown>(
    `/jobs/${jobId}/applications?limit=${limit}&offset=${offset}`
  );
  return toPaginated<JobApplication>(response, limit, offset);
}

export async function getJobStats(jobId: string) {
  return fetchJson<{
    jobId: string;
    funnel: {
      invites: number;
      responded: number;
      matchOk: number;
      hired: number;
    };
  }>(`/jobs/${jobId}/stats`);
}

export async function updateApplicationStatus(
  jobId: string,
  appId: string,
  status: 'new' | 'shortlisted' | 'interview' | 'approved' | 'rejected',
  recruiterNotes?: string
) {
  return fetchJson<{ id: string; status: string; updated: true }>(
    `/jobs/${jobId}/applications/${appId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, recruiter_notes: recruiterNotes }),
    }
  );
}

// Candidate
export async function getCandidateProfile() {
  return fetchJson<CandidateProfile>('/candidate/profile');
}

export async function updateCandidateProfile(data: {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  targetRole?: string;
  seniority?: string;
}) {
  return fetchJson<{ ok: true }>('/candidate/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function analyzeCV(cvText: string) {
  return fetchJson<AnalyzeCVResponse>('/candidate/cv/analyze', {
    method: 'POST',
    body: JSON.stringify({ cvText }),
  });
}

export async function getCandidateWallet() {
  return fetchJson<{ balance: number }>('/api/candidate/wallet');
}

export async function tailorCV(targetJobDescription: string) {
  return fetchJson<{ markdown: string; balanceAfter: number }>('/api/candidate/tailor-cv', {
    method: 'POST',
    body: JSON.stringify({ targetJobDescription }),
  });
}

export async function buyCandidateCredits() {
  return fetchJson<{ checkoutUrl: string }>('/api/candidate/buy-credits', {
    method: 'POST'
  });
}

export async function getCVVersions() {
  const response = await fetchJson<unknown>('/candidate/cv/versions');
  if (Array.isArray(response)) return response;
  const payload = asRecord(response);
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function publicApply(data: {
  name: string;
  phone: string;
  email?: string;
  jobId: string;
  cvText: string;
}) {
  return fetchJson<{ success: true; appId: string; profileId: string }>('/public/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function applyToJob(data: {
  jobId: string;
  cvVersionId?: string;
  matchScore?: number;
}) {
  return fetchJson<{ id: string; status: string }>('/candidate/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyApplications(limit = 20, offset = 0) {
  const response = await fetchJson<unknown>(
    `/candidate/applications?limit=${limit}&offset=${offset}`
  );
  return toPaginated<JobApplication>(response, limit, offset);
}

// WhatsApp
export async function sendWhatsAppInvite(data: {
  candidatePhone?: string;
  candidateName?: string;
  profileId?: string;
  jobId: string;
  jobTitle?: string;
  companyName?: string;
}) {
  return fetchJson<{ sessionId: string; status: string }>('/whatsapp/invite', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function bulkWhatsAppInvite(data: {
  candidates: Array<{ profileId?: string; phone?: string; name?: string }>;
  jobId: string;
  jobTitle?: string;
  companyName?: string;
}) {
  return fetchJson<{
    total: number;
    results: Array<{
      profile_id: string | null;
      name: string | null;
      phone: string | null;
      sessionId?: string;
      error?: string;
      blind_candidate?: {
        enabled: boolean;
        label: string;
        maskedName: string | null;
        maskedPhone: string | null;
      };
    }>;
  }>('/whatsapp/invite-bulk', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateWhatsAppSession(
  sessionId: string,
  data: {
    recommendation?: 'entrevista' | 'rejeitar' | 'mais_info';
    state?: string;
  }
) {
  return fetchJson<{ id: string; updated: true }>(`/whatsapp/sessions/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getWhatsAppSessions(jobId: string, limit = 50, offset = 0) {
  const response = await fetchJson<unknown>(
    `/whatsapp/sessions/${jobId}?limit=${limit}&offset=${offset}`
  );
  return toPaginated<WhatsAppSession>(response, limit, offset);
}

export async function getRecruiterWhatsAppSessions(limit = 50, offset = 0) {
  const response = await fetchJson<unknown>(
    `/whatsapp/recruiter/sessions?limit=${limit}&offset=${offset}`
  );
  return toPaginated<WhatsAppSession>(response, limit, offset);
}

export async function getRecruiterReviewQueue(limit = 50, offset = 0) {
  const response = await fetchJson<unknown>(
    `/recruiter/review-queue?limit=${limit}&offset=${offset}`
  );
  return toPaginated<RecruiterReviewQueueItem>(response, limit, offset);
}

export async function getSessionAudioFiles(sessionId: string) {
  return fetchJson<WhatsAppAudioFile[]>(`/whatsapp/sessions/${sessionId}/audios`);
}

export async function fetchWhatsAppAudioBlob(audioId: string): Promise<Blob> {
  const res = await fetchBinary(`/whatsapp/audio/${audioId}/stream`);
  return res.blob();
}

export async function transcribeAudioBlob(audio: Blob) {
  const contentType = audio.type || 'application/octet-stream';
  const res = await fetchBinary('/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
    },
    body: audio,
  });
  const text = await res.text();
  try {
    return JSON.parse(text) as { text: string; mimeType: string; bytes: number };
  } catch {
    throw new ApiError({
      error: 'Resposta inválida da API de transcrição',
      code: 'TRANSCRIBE_INVALID_RESPONSE',
      details: { preview: text.slice(0, 140) },
    });
  }
}

// Bulk analysis
export async function bulkAnalyzeCVs(data: {
  jobId: string;
  candidates: Array<{ name: string; phone: string; email?: string; cvText: string }>;
}) {
  return fetchJson<BulkAnalysisResponse>('/recruiter/bulk-analyze', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getBulkResults(jobId: string) {
  return fetchJson<BulkAnalysisResultItem[]>(`/recruiter/bulk-results/${jobId}`);
}

// Billing
export async function getRecruiterWallet() {
  return fetchJson<RecruiterWalletPayload>('/recruiter/wallet');
}

export async function getRecruiterCandidates() {
  return fetchJson<CandidateProfile[]>('/recruiter/candidates');
}

function buildRecruiterCandidatesExportQuery(params: {
  format: RecruiterCandidatesExportFormat;
  includePii?: boolean;
  limit?: number;
}) {
  const query = new URLSearchParams();
  query.set('format', params.format);
  if (typeof params.includePii === 'boolean') {
    query.set('includePii', params.includePii ? 'true' : 'false');
  }
  if (typeof params.limit === 'number' && Number.isFinite(params.limit)) {
    query.set('limit', String(Math.round(params.limit)));
  }
  return query.toString();
}

export async function getRecruiterCandidatesExportJson(params?: {
  includePii?: boolean;
  limit?: number;
}) {
  const query = buildRecruiterCandidatesExportQuery({
    format: 'json',
    includePii: params?.includePii,
    limit: params?.limit,
  });
  return fetchJson<RecruiterCandidatesExportPayload>(`/recruiter/candidates/export?${query}`);
}

export async function downloadRecruiterCandidatesExportCsv(params?: {
  includePii?: boolean;
  limit?: number;
}) {
  const query = buildRecruiterCandidatesExportQuery({
    format: 'csv',
    includePii: params?.includePii,
    limit: params?.limit,
  });
  const response = await fetchBinary(`/recruiter/candidates/export?${query}`);
  return response.blob();
}

export async function getCreditTransactions() {
  return fetchJson<CreditTransaction[]>('/recruiter/transactions');
}

export async function createCreditPayment(packageId: string, customer?: PaymentCustomer) {
  return fetchJson<PaymentCheckoutResponse>('/payment/credits', {
    method: 'POST',
    body: JSON.stringify(customer ? { packageId, customer } : { packageId }),
  });
}

export async function createSubscriptionPayment(
  planId: 'monthly' | 'annual',
  customer?: PaymentCustomer
) {
  return fetchJson<PaymentCheckoutResponse>('/payment/subscription', {
    method: 'POST',
    body: JSON.stringify(customer ? { planId, customer } : { planId }),
  });
}

export async function createDiagnosticPayment(customer?: PaymentCustomer) {
  return fetchJson<PaymentCheckoutResponse>('/payment/diagnostic', {
    method: 'POST',
    body: JSON.stringify(customer ? { customer } : {}),
  });
}

// Health
export async function getHealth() {
  return fetchJson<HealthResponse>('/health');
}

export async function getAdminOverview() {
  return fetchJson<AdminOverview>('/admin/overview');
}

export async function getAdminAIControl() {
  return fetchJson<AdminAIControlSettings>('/admin/ai-control');
}

export async function updateAdminAIControl(data: Partial<AdminAIControlSettings>) {
  return fetchJson<AdminAIControlSettings>('/admin/ai-control', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getAdminAISquad() {
  return fetchJson<AdminAISquad>('/admin/ai-squad');
}

export async function updateAdminAISquad(data: Partial<AdminAISquad>) {
  return fetchJson<AdminAISquad>('/admin/ai-squad', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getAdminAIRag() {
  return fetchJson<AdminAIRagDiagnostics>('/admin/ai-rag');
}

export async function updateAdminAIRag(data: Partial<AdminAIRagSettings>) {
  return fetchJson<AdminAIRagSettings>('/admin/ai-rag', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
