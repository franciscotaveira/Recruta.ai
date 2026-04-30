import type {
  CandidateAnalysis,
  CandidateCompetencyScore,
  CandidateKnockoutSummary,
} from '../ai/analyze.js';

export interface SessionConfidenceSignals {
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

export interface SessionConfidenceSnapshot {
  score: number;
  level: 'low' | 'medium' | 'high';
  autoRecommendationAllowed: boolean;
  reasons: string[];
  signals: SessionConfidenceSignals;
}

export interface BlindCandidateSnapshot {
  enabled: boolean;
  label: string;
  maskedName: string | null;
  maskedPhone: string | null;
}

export interface RecruiterReviewSnapshot {
  status: 'pending' | 'reviewed' | 'handoff' | 'not_required';
  requiresHumanReview: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reasons: string[];
  reviewedAt: string | null;
  reviewedBy: string | null;
  finalRecommendation: CandidateAnalysis['recommendation'] | null;
  notes: string | null;
}

interface StoredSessionAnalysisBase {
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendation: CandidateAnalysis['recommendation'];
  questionScores: number[];
}

interface StoredSessionAnalysisV1 extends StoredSessionAnalysisBase {
  version: 'triage_v1';
}

interface StoredSessionAnalysisV2 extends StoredSessionAnalysisBase {
  version: 'triage_v2';
  competencyScores: CandidateCompetencyScore[];
  knockout: CandidateKnockoutSummary | null;
}

interface StoredSessionAnalysisV3 extends StoredSessionAnalysisBase {
  version: 'triage_v3';
  competencyScores: CandidateCompetencyScore[];
  communicationPerformance?: CandidateAnalysis['communicationPerformance'];
  knockout: CandidateKnockoutSummary | null;
  confidence?: SessionConfidenceSnapshot | null;
  recruiterReview?: RecruiterReviewSnapshot | null;
  blindCandidate?: BlindCandidateSnapshot | null;
}

type StoredSessionAnalysis =
  | StoredSessionAnalysisV1
  | StoredSessionAnalysisV2
  | StoredSessionAnalysisV3;

function sanitizeStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function sanitizeQuestionScores(value: unknown): number[] {
  return Array.isArray(value)
    ? value
        .filter((v): v is number => Number.isFinite(v))
        .map((v) => Math.max(0, Math.min(100, Math.round(v))))
    : [];
}

function sanitizeRecommendation(value: unknown): CandidateAnalysis['recommendation'] | null {
  return value === 'entrevista' || value === 'rejeitar' || value === 'mais_info' ? value : null;
}
function sanitizeCommunicationPerformance(
  value: unknown
): CandidateAnalysis['communicationPerformance'] | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as any;
  return {
    clarity: Math.max(1, Math.min(5, Math.round(Number(raw.clarity || 0)))),
    vocabulary: Math.max(1, Math.min(5, Math.round(Number(raw.vocabulary || 0)))),
    objectivity: Math.max(1, Math.min(5, Math.round(Number(raw.objectivity || 0)))),
  };
}

function sanitizeCompetencyScores(value: unknown): CandidateCompetencyScore[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const raw = row as Record<string, unknown>;
      if (typeof raw.requirementId !== 'string' || typeof raw.requirementText !== 'string')
        return null;
      const scoreRaw = Math.round(Number(raw.score));
      const score = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(100, scoreRaw)) : 0;
      const barsRaw = Math.round(Number(raw.barsLevel));
      const barsLevel = (
        Number.isFinite(barsRaw)
          ? Math.max(1, Math.min(5, barsRaw))
          : Math.max(1, Math.min(5, Math.ceil(score / 20) || 1))
      ) as 1 | 2 | 3 | 4 | 5;
      const evidence =
        raw.evidence === 'forte' || raw.evidence === 'moderada' || raw.evidence === 'fraca'
          ? raw.evidence
          : barsLevel <= 2
            ? 'fraca'
            : barsLevel === 3
              ? 'moderada'
              : 'forte';

      return {
        requirementId: raw.requirementId,
        requirementText: raw.requirementText,
        category: typeof raw.category === 'string' ? raw.category : 'experience',
        weight: Math.max(1, Math.min(5, Math.round(Number(raw.weight || 1)))),
        score: Number.isFinite(score) ? score : 0,
        barsLevel,
        evidence,
        rationale: typeof raw.rationale === 'string' ? raw.rationale : '',
      };
    })
    .filter((row): row is CandidateCompetencyScore => !!row);
}

function sanitizeSessionConfidence(value: unknown): SessionConfidenceSnapshot | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const scoreRaw = Math.round(Number(raw.score));
  const score = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(100, scoreRaw)) : 0;
  const level =
    raw.level === 'high' || raw.level === 'medium' || raw.level === 'low'
      ? raw.level
      : score >= 80
        ? 'high'
        : score >= 55
          ? 'medium'
          : 'low';
  const signalsRaw =
    raw.signals && typeof raw.signals === 'object' ? (raw.signals as Record<string, unknown>) : {};

  return {
    score,
    level,
    autoRecommendationAllowed: Boolean(
      raw.autoRecommendationAllowed ?? raw.auto_recommendation_allowed
    ),
    reasons: sanitizeStringList(raw.reasons),
    signals: {
      answeredQuestions: Math.max(
        0,
        Math.round(Number(signalsRaw.answeredQuestions ?? signalsRaw.answered_questions ?? 0))
      ),
      totalQuestions: Math.max(
        0,
        Math.round(Number(signalsRaw.totalQuestions ?? signalsRaw.total_questions ?? 0))
      ),
      substantiveAnswers: Math.max(
        0,
        Math.round(Number(signalsRaw.substantiveAnswers ?? signalsRaw.substantive_answers ?? 0))
      ),
      scoreCoveragePct: Math.max(
        0,
        Math.min(
          100,
          Math.round(Number(signalsRaw.scoreCoveragePct ?? signalsRaw.score_coverage_pct ?? 0))
        )
      ),
      averageQuestionScore: Number.isFinite(
        Number(signalsRaw.averageQuestionScore ?? signalsRaw.average_question_score)
      )
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(
                Number(signalsRaw.averageQuestionScore ?? signalsRaw.average_question_score)
              )
            )
          )
        : null,
      deepDiveCount: Math.max(
        0,
        Math.round(Number(signalsRaw.deepDiveCount ?? signalsRaw.deep_dive_count ?? 0))
      ),
      textFallbackUsed: Boolean(
        signalsRaw.textFallbackUsed ?? signalsRaw.text_fallback_used ?? false
      ),
      fallbackAnalysisUsed: Boolean(
        signalsRaw.fallbackAnalysisUsed ?? signalsRaw.fallback_analysis_used ?? false
      ),
      knockoutEvaluated: Boolean(
        signalsRaw.knockoutEvaluated ?? signalsRaw.knockout_evaluated ?? false
      ),
    },
  };
}

function sanitizeBlindCandidate(value: unknown): BlindCandidateSnapshot | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const label = typeof raw.label === 'string' ? raw.label.trim() : '';
  if (!label) return null;

  return {
    enabled: Boolean(raw.enabled),
    label,
    maskedName:
      typeof raw.maskedName === 'string'
        ? raw.maskedName
        : typeof raw.masked_name === 'string'
          ? raw.masked_name
          : null,
    maskedPhone:
      typeof raw.maskedPhone === 'string'
        ? raw.maskedPhone
        : typeof raw.masked_phone === 'string'
          ? raw.masked_phone
          : null,
  };
}

function sanitizeRecruiterReview(value: unknown): RecruiterReviewSnapshot | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const status =
    raw.status === 'pending' ||
    raw.status === 'reviewed' ||
    raw.status === 'handoff' ||
    raw.status === 'not_required'
      ? raw.status
      : null;
  if (!status) return null;

  const priority =
    raw.priority === 'low' ||
    raw.priority === 'medium' ||
    raw.priority === 'high' ||
    raw.priority === 'urgent'
      ? raw.priority
      : 'medium';

  return {
    status,
    requiresHumanReview: Boolean(raw.requiresHumanReview ?? raw.requires_human_review),
    priority,
    reasons: sanitizeStringList(raw.reasons),
    reviewedAt:
      typeof raw.reviewedAt === 'string'
        ? raw.reviewedAt
        : typeof raw.reviewed_at === 'string'
          ? raw.reviewed_at
          : null,
    reviewedBy:
      typeof raw.reviewedBy === 'string'
        ? raw.reviewedBy
        : typeof raw.reviewed_by === 'string'
          ? raw.reviewed_by
          : null,
    finalRecommendation: sanitizeRecommendation(
      raw.finalRecommendation ?? raw.final_recommendation ?? null
    ),
    notes: typeof raw.notes === 'string' ? raw.notes : null,
  };
}

function sanitizeKnockout(value: unknown): CandidateKnockoutSummary | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if ((raw.status !== 'pass' && raw.status !== 'fail') || typeof raw.reason !== 'string')
    return null;
  const details = Array.isArray(raw.details)
    ? raw.details
        .map((detail) => {
          if (!detail || typeof detail !== 'object') return null;
          const row = detail as Record<string, unknown>;
          return {
            requirementId: typeof row.requirementId === 'string' ? row.requirementId : undefined,
            requirementText:
              typeof row.requirementText === 'string' ? row.requirementText : undefined,
            weight: Number.isFinite(Number(row.weight))
              ? Math.max(1, Math.min(5, Math.round(Number(row.weight))))
              : undefined,
          };
        })
        .filter((row): row is NonNullable<typeof row> => !!row)
    : undefined;

  return {
    status: raw.status,
    reason: raw.reason,
    requirementId: typeof raw.requirementId === 'string' ? raw.requirementId : undefined,
    requirementText: typeof raw.requirementText === 'string' ? raw.requirementText : undefined,
    weight: Number.isFinite(Number(raw.weight))
      ? Math.max(1, Math.min(5, Math.round(Number(raw.weight))))
      : undefined,
    questionType: raw.questionType === 'knockout' ? 'knockout' : undefined,
    answer: typeof raw.answer === 'string' ? raw.answer : undefined,
    details,
  };
}

export function encodeSessionAnalysis(analysis: CandidateAnalysis): string {
  const payload: StoredSessionAnalysisV3 = {
    version: 'triage_v3',
    summary: analysis.summary,
    strengths: analysis.strengths || [],
    concerns: analysis.concerns || [],
    recommendation: analysis.recommendation,
    questionScores: analysis.questionScores || [],
    competencyScores: analysis.competencyScores || [],
    communicationPerformance: analysis.communicationPerformance,
    knockout: analysis.knockout || null,
  };
  return JSON.stringify(payload);
}

export function encodeSessionAnalysisWithMetadata(
  analysis: CandidateAnalysis,
  metadata?: {
    confidence?: SessionConfidenceSnapshot | null;
    recruiterReview?: RecruiterReviewSnapshot | null;
    blindCandidate?: BlindCandidateSnapshot | null;
  }
): string {
  const payload: StoredSessionAnalysisV3 = {
    version: 'triage_v3',
    summary: analysis.summary,
    strengths: analysis.strengths || [],
    concerns: analysis.concerns || [],
    recommendation: analysis.recommendation,
    questionScores: analysis.questionScores || [],
    competencyScores: analysis.competencyScores || [],
    communicationPerformance: analysis.communicationPerformance,
    knockout: analysis.knockout || null,
    confidence: metadata?.confidence || null,
    recruiterReview: metadata?.recruiterReview || null,
    blindCandidate: metadata?.blindCandidate || null,
  };
  return JSON.stringify(payload);
}

export function decodeSessionAnalysis(rawSummary: string | null | undefined): {
  summary: string | null;
  strengths: string[];
  concerns: string[];
  recommendation: CandidateAnalysis['recommendation'] | null;
  questionScores: number[];
  competencyScores: CandidateCompetencyScore[];
  communicationPerformance: CandidateAnalysis['communicationPerformance'] | null;
  knockout: CandidateKnockoutSummary | null;
  confidence: SessionConfidenceSnapshot | null;
  recruiterReview: RecruiterReviewSnapshot | null;
  blindCandidate: BlindCandidateSnapshot | null;
} {
  if (!rawSummary) {
    return {
      summary: null,
      strengths: [],
      concerns: [],
      recommendation: null,
      questionScores: [],
      competencyScores: [],
      communicationPerformance: null,
      knockout: null,
      confidence: null,
      recruiterReview: null,
      blindCandidate: null,
    };
  }

  try {
    const parsed = JSON.parse(rawSummary) as Partial<StoredSessionAnalysis>;
    if (
      (parsed?.version === 'triage_v1' ||
        parsed?.version === 'triage_v2' ||
        parsed?.version === 'triage_v3') &&
      typeof parsed.summary === 'string'
    ) {
      return {
        summary: parsed.summary,
        strengths: sanitizeStringList(parsed.strengths),
        concerns: sanitizeStringList(parsed.concerns),
        recommendation: sanitizeRecommendation(parsed.recommendation),
        questionScores: sanitizeQuestionScores(parsed.questionScores),
        competencyScores:
          parsed.version === 'triage_v2' || parsed.version === 'triage_v3'
            ? sanitizeCompetencyScores(parsed.competencyScores)
            : [],
        communicationPerformance:
          parsed.version === 'triage_v3'
            ? sanitizeCommunicationPerformance(parsed.communicationPerformance)
            : null,
        knockout:
          parsed.version === 'triage_v2' || parsed.version === 'triage_v3'
            ? sanitizeKnockout(parsed.knockout)
            : null,
        confidence:
          parsed.version === 'triage_v3' ? sanitizeSessionConfidence(parsed.confidence) : null,
        recruiterReview:
          parsed.version === 'triage_v3' ? sanitizeRecruiterReview(parsed.recruiterReview) : null,
        blindCandidate:
          parsed.version === 'triage_v3' ? sanitizeBlindCandidate(parsed.blindCandidate) : null,
      };
    }
  } catch {
    // Legacy free-text summary
  }

  return {
    summary: rawSummary,
    strengths: [],
    concerns: [],
    recommendation: null,
    questionScores: [],
    competencyScores: [],
    communicationPerformance: null,
    knockout: null,
    confidence: null,
    recruiterReview: null,
    blindCandidate: null,
  };
}

export function updateSessionAnalysisMetadata(
  rawSummary: string | null | undefined,
  patch: {
    recommendation?: CandidateAnalysis['recommendation'];
    confidence?: SessionConfidenceSnapshot | null;
    recruiterReview?: Partial<RecruiterReviewSnapshot> | null;
    blindCandidate?: BlindCandidateSnapshot | null;
  }
): string {
  const decoded = decodeSessionAnalysis(rawSummary);
  const nextReview =
    patch.recruiterReview === undefined
      ? decoded.recruiterReview
      : patch.recruiterReview === null
        ? null
        : sanitizeRecruiterReview({
            ...(decoded.recruiterReview || {
              status: 'pending',
              requiresHumanReview: true,
              priority: 'medium',
              reasons: [],
              reviewedAt: null,
              reviewedBy: null,
              finalRecommendation: null,
              notes: null,
            }),
            ...patch.recruiterReview,
          });

  const payload: StoredSessionAnalysisV3 = {
    version: 'triage_v3',
    summary: decoded.summary || '',
    strengths: decoded.strengths,
    concerns: decoded.concerns,
    recommendation:
      patch.recommendation !== undefined
        ? patch.recommendation
        : decoded.recommendation || 'mais_info',
    questionScores: decoded.questionScores,
    competencyScores: decoded.competencyScores,
    communicationPerformance: decoded.communicationPerformance || undefined,
    knockout: decoded.knockout,
    confidence: patch.confidence === undefined ? decoded.confidence : patch.confidence,
    recruiterReview: nextReview,
    blindCandidate:
      patch.blindCandidate === undefined ? decoded.blindCandidate : patch.blindCandidate,
  };

  return JSON.stringify(payload);
}
