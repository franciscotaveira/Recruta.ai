export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface ApiErrorShape {
  error: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
  verified?: boolean;
}

export interface JobRequirement {
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
}

export interface PublicJob {
  id: string;
  recruiter_id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: JobRequirement[];
  salary_range?: string | null;
  job_type?: string | null;
  modality?: string | null;
  is_active: boolean;
  application_count: number;
  created_at: string;
  updated_at?: string;
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  target_role?: string | null;
  seniority?: string | null;
  cv_master?: string | null;
  scp_score: number;
  scp_breakdown?: {
    clarity: number;
    evidence: number;
    focus: number;
    freshness: number;
  } | null;
  diagnosis?: string | null;
  ai_suggestions?: string[];
  attention_points?: string[];
  diagnostic_unlocked?: boolean;
  blind_candidate?: WhatsAppBlindCandidate | null;
  history?: CandidateProfileHistoryItem[];
}

export interface CandidateProfileHistoryItem {
  id: string;
  profile_id?: string;
  status?: string;
  match_score?: number | null;
  applied_at?: string;
  updated_at?: string;
  public_jobs?: {
    title?: string | null;
    company?: string | null;
  } | null;
}

export type RecruiterCandidatesExportFormat = 'csv' | 'json';

export interface RecruiterCandidateExportRow {
  profile_id: string;
  blind_label: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  target_role: string | null;
  seniority: string | null;
  scp_score: number;
  history_count: number;
  latest_job: string | null;
  latest_company: string | null;
  latest_status: string | null;
  attention_points: string;
  diagnosis: string | null;
  updated_at: string | null;
}

export interface RecruiterCandidatesExportPayload {
  exportedAt: string;
  format: RecruiterCandidatesExportFormat;
  total: number;
  includePiiRequested: boolean;
  includePiiApplied: boolean;
  governanceBlindScreeningEnabled: boolean;
  data: RecruiterCandidateExportRow[];
}

export interface CVAnalysisResult {
  score: number;
  breakdown: {
    clarity: number;
    evidence: number;
    focus: number;
    freshness: number;
  };
  reasoning?: string | null;
  suggestions?: string[];
  attention_points?: string[];
  fallback?: boolean;
}

export interface AnalyzeCVResponse {
  data?: CVAnalysisResult;
  fallback?: CVAnalysisResult;
  error?: {
    message?: string;
  };
}

export interface JobApplication {
  id: string;
  job_id?: string;
  candidate_id?: string;
  candidate_name?: string | null;
  candidate_phone?: string | null;
  blind_candidate?: WhatsAppBlindCandidate | null;
  status?: string;
  match_score?: number | null;
  created_at?: string;
  applied_at?: string;
  updated_at?: string;
}

export interface PaymentCustomer {
  name: string;
  email: string;
  phone: string;
  taxId: string;
}

export interface PaymentCheckoutResponse {
  paymentId: string;
  checkoutUrl: string;
  amount: number;
  credits?: number;
}

export interface RecruiterWallet {
  id?: string;
  recruiter_id?: string;
  balance: number;
  total_purchased?: number;
  total_spent?: number;
}

export interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  balance_after?: number;
  created_at: string;
}

export interface RecruiterWalletPayload {
  wallet: RecruiterWallet | null;
  transactions: CreditTransaction[];
  payments: unknown[];
}

export interface BulkAnalysisResultItem {
  profile_id: string;
  name: string | null;
  phone: string | null;
  email?: string | null;
  cvText: string;
  matchScore: number;
  strengths: string[];
  concerns: string[];
  summary: string;
  recommendation: 'entrevistar' | 'rejeitar' | 'talvez';
  blind_candidate?: WhatsAppBlindCandidate | null;
}

export interface BulkAnalysisErrorItem {
  profile_id: string;
  name: string;
  phone?: string | null;
  error: string;
  blind_candidate?: WhatsAppBlindCandidate | null;
}

export interface BulkAnalysisResponse {
  jobId: string;
  totalAnalyzed: number;
  candidates: BulkAnalysisResultItem[];
  errors: BulkAnalysisErrorItem[];
  creditsSpent?: number;
  creditsRefunded?: number;
  creditsRemaining?: number;
}

export interface HealthResponse {
  ok?: boolean;
  status?: string;
  [key: string]: unknown;
}

export interface WhatsAppSession {
  id: string;
  candidate_phone: string | null;
  candidate_name: string | null;
  job_id: string;
  recruiter_id: string;
  state:
    | 'invited'
    | 'consent_pending'
    | 'mic_check'
    | 'accepted'
    | 'questioning'
    | 'handoff_requested'
    | 'completed'
    | 'declined';
  current_question_idx: number;
  questions: Array<{
    text: string;
    category: string;
    questionType?: 'knockout' | 'bars' | 'legacy';
    requirementId?: string;
    requirementText?: string;
    weight?: number;
  }>;
  responses: Array<{ text?: string; transcription?: string; timestamp?: string }>;
  summary: string | null;
  match_score: number | null;
  strengths?: string[];
  concerns?: string[];
  recommendation?: 'entrevista' | 'rejeitar' | 'mais_info' | null;
  question_scores?: number[];
  communication_performance?: {
    clarity: number;
    vocabulary: number;
    objectivity: number;
  };
  competency_scores?: WhatsAppCompetencyScore[];
  knockout?: WhatsAppKnockoutResult | null;
  confidence?: WhatsAppSessionConfidence | null;
  review?: WhatsAppSessionReview | null;
  blind_candidate?: WhatsAppBlindCandidate | null;
  created_at: string;
  updated_at: string;
  declined_at: string | null;
  completed_at: string | null;
}

export interface WhatsAppCompetencyScore {
  requirement_id: string;
  requirement_text: string;
  category: string;
  weight: number;
  score: number;
  bars_level: 1 | 2 | 3 | 4 | 5;
  evidence: 'fraca' | 'moderada' | 'forte';
  rationale: string;
}

export interface WhatsAppKnockoutResult {
  failed: boolean;
  reason: string;
  requirement_id: string | null;
  requirement_text: string | null;
  answer: string | null;
}

export interface WhatsAppSessionConfidenceSignals {
  answeredQuestions: number;
  totalQuestions: number;
  substantiveAnswers: number;
  scoreCoveragePct: number;
  averageQuestionScore: number | null;
  deepDiveCount: number;
  textFallbackUsed: boolean;
  fallbackAnalysisUsed: boolean;
  knockoutEvaluated: boolean;
}

export interface WhatsAppSessionConfidence {
  score: number;
  level: 'low' | 'medium' | 'high';
  autoRecommendationAllowed: boolean;
  reasons: string[];
  signals: WhatsAppSessionConfidenceSignals;
}

export interface WhatsAppSessionReview {
  status: 'pending' | 'reviewed' | 'handoff' | 'not_required';
  requiresHumanReview: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reasons: string[];
  reviewedAt: string | null;
  reviewedBy: string | null;
  finalRecommendation: 'entrevista' | 'rejeitar' | 'mais_info' | null;
  notes: string | null;
}

export interface WhatsAppBlindCandidate {
  enabled: boolean;
  label: string;
  maskedName: string | null;
  maskedPhone: string | null;
}

export interface WhatsAppAudioFile {
  id: string;
  sessionId: string;
  createdAt: string;
  transcription: string | null;
  streamPath: string;
}

export interface RecruiterReviewQueueItem {
  session_id: string;
  job_id: string;
  recruiter_id: string;
  state: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  match_score: number | null;
  candidate: WhatsAppBlindCandidate;
  analysis: {
    summary: string | null;
    recommendation: 'entrevista' | 'rejeitar' | 'mais_info' | null;
    strengths: string[];
    concerns: string[];
    confidence: WhatsAppSessionConfidence;
  };
  review: WhatsAppSessionReview;
}

export interface ContractSpecVersion {
  name: 'recruta-api-contract';
  version: 'v1';
  updatedAt: string;
}

export interface AdminAIControlSettings {
  aiEnabled: boolean;
  deepDiveEnabled: boolean;
  textFallbackEnabled: boolean;
  maxAudioBytes: number;
  modelPolicy: 'auto' | 'gemini' | 'fallback_only';
  updatedAt: string;
  updatedBy: string | null;
}

export type AdminAISquadModelPolicy = 'auto' | 'gemini' | 'openai' | 'openrouter' | 'fallback_only';

export type AdminAISpecialistArea =
  | 'attraction'
  | 'triage'
  | 'interview'
  | 'compliance'
  | 'candidate_experience'
  | 'quality'
  | 'revenue'
  | 'learning';

export interface AdminAISpecialist {
  id: string;
  name: string;
  area: AdminAISpecialistArea;
  objective: string;
  keyMetric: string;
  enabled: boolean;
  humanReviewRequired: boolean;
  modelPolicy: AdminAISquadModelPolicy;
  slaMinutes: number;
  owner: string;
  updatedAt: string;
}

export interface AdminAISquadGovernance {
  consentRequired: boolean;
  blindScreeningEnabled: boolean;
  humanInTheLoopRequired: boolean;
  biasAuditCadenceDays: number;
  maxParallelSessions: number;
}

export interface AdminAISquad {
  experts: AdminAISpecialist[];
  governance: AdminAISquadGovernance;
  updatedAt: string;
  updatedBy: string | null;
}

export interface AdminAISquadSummary {
  totalExperts: number;
  enabledExperts: number;
  coverage: Record<AdminAISpecialistArea, number>;
  governanceScore: number;
  governance?: AdminAISquadGovernance;
}

export interface AdminAIRagSettings {
  enabled: boolean;
  topK: number;
  minScore: number;
  maxContextChars: number;
  cacheTtlSeconds: number;
  includeCitations: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

export interface AdminAIRagDiagnostics {
  settings: AdminAIRagSettings;
  corpusSize: number;
  cacheEntries: number;
  cacheHitRate: number;
  corpusSignature: string;
}

export interface AdminOverview {
  generatedAt: string;
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  jobs: {
    total: number;
    active: number;
    closed: number;
  };
  triage: {
    total: number;
    byState: Record<string, number>;
    completionRate: number;
    declineRate: number;
    avgMatchScore: number | null;
  };
  revenue: {
    paidPayments: number;
    paidRevenueCents: number;
  };
  aiControl: AdminAIControlSettings;
  aiSquadSummary: AdminAISquadSummary;
  aiRag: AdminAIRagDiagnostics;
  viewer: {
    adminCanReviewRecruiterAndCandidateViews: boolean;
  };
}
