import type { CandidateAnalysis } from '../ai/analyze.js';
import {
  decodeSessionAnalysis,
  type BlindCandidateSnapshot,
  type RecruiterReviewSnapshot,
  type SessionConfidenceSnapshot,
} from '../conversation/summary.js';
import { buildBlindCandidateSnapshot } from '../skills/blind-screening.js';
import { buildSessionConfidence } from '../skills/confidence-engine.js';

export interface RecruiterReviewQueueItem {
  session_id: string;
  job_id: string;
  recruiter_id: string;
  state: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  match_score: number | null;
  candidate: BlindCandidateSnapshot;
  analysis: {
    summary: string | null;
    recommendation: CandidateAnalysis['recommendation'] | null;
    strengths: string[];
    concerns: string[];
    confidence: SessionConfidenceSnapshot;
  };
  review: RecruiterReviewSnapshot;
}

const PRIORITY_RANK: Record<RecruiterReviewSnapshot['priority'], number> = {
  low: 0,
  medium: 1,
  high: 2,
  urgent: 3,
};

function derivePriority(params: {
  state: string;
  confidence: SessionConfidenceSnapshot;
  reasons: string[];
}): RecruiterReviewSnapshot['priority'] {
  if (params.state === 'handoff_requested') return 'urgent';
  if (
    params.confidence.score < 55 ||
    params.reasons.includes('analysis_fallback') ||
    params.reasons.includes('low_confidence')
  ) {
    return 'high';
  }
  if (params.state === 'questioning' || params.confidence.score < 72) return 'medium';
  return 'low';
}

export function buildRecruiterReviewSnapshot(params: {
  state: string;
  existingReview: RecruiterReviewSnapshot | null;
  confidence: SessionConfidenceSnapshot;
  requiresHumanReview: boolean;
}): RecruiterReviewSnapshot {
  if (params.existingReview?.status === 'reviewed') {
    return params.existingReview;
  }

  const reasons = Array.from(
    new Set(
      [
        params.requiresHumanReview ? 'human_review_required' : null,
        !params.confidence.autoRecommendationAllowed ? 'auto_recommendation_blocked' : null,
        ...params.confidence.reasons,
        params.state === 'handoff_requested' ? 'handoff_requested' : null,
        params.state === 'questioning' ? 'triage_in_progress' : null,
      ].filter((reason): reason is string => !!reason)
    )
  );

  const status =
    params.state === 'handoff_requested'
      ? 'handoff'
      : params.state === 'completed' || params.state === 'questioning'
        ? 'pending'
        : 'not_required';

  return {
    status,
    requiresHumanReview: params.requiresHumanReview || status !== 'not_required',
    priority: derivePriority({
      state: params.state,
      confidence: params.confidence,
      reasons,
    }),
    reasons,
    reviewedAt: null,
    reviewedBy: null,
    finalRecommendation: null,
    notes: null,
  };
}

export function buildRecruiterReviewQueueItem(
  session: any,
  options: {
    blindScreeningEnabled: boolean;
    requiresHumanReview: boolean;
  }
): RecruiterReviewQueueItem {
  const parsed = decodeSessionAnalysis(session?.summary);
  const fallbackAnalysisUsed =
    parsed.confidence?.signals.fallbackAnalysisUsed ||
    parsed.concerns.some((concern) => concern.toLowerCase().includes('fallback')) ||
    String(parsed.summary || '')
      .toLowerCase()
      .includes('fallback');

  const confidence =
    parsed.confidence ||
    buildSessionConfidence({
      questions: Array.isArray(session?.questions) ? session.questions : [],
      responses: Array.isArray(session?.responses) ? session.responses : [],
      analysis: {
        questionScores: parsed.questionScores,
        recommendation: parsed.recommendation,
        summary: parsed.summary || '',
        concerns: parsed.concerns,
        knockout: parsed.knockout || undefined,
      },
      fallbackAnalysisUsed,
    });

  const blindScreeningActive =
    options.blindScreeningEnabled || Boolean(parsed.blindCandidate?.enabled);
  const candidate = blindScreeningActive
    ? buildBlindCandidateSnapshot({
        referenceId: String(session?.id || ''),
        candidateName: session?.candidate_name,
        candidatePhone: session?.candidate_phone,
        enabled: true,
      })
    : parsed.blindCandidate ||
      buildBlindCandidateSnapshot({
        referenceId: String(session?.id || ''),
        candidateName: session?.candidate_name,
        candidatePhone: session?.candidate_phone,
        enabled: false,
      });

  const review = buildRecruiterReviewSnapshot({
    state: String(session?.state || ''),
    existingReview: parsed.recruiterReview,
    confidence,
    requiresHumanReview: options.requiresHumanReview,
  });

  return {
    session_id: String(session?.id || ''),
    job_id: String(session?.job_id || ''),
    recruiter_id: String(session?.recruiter_id || ''),
    state: String(session?.state || ''),
    created_at: String(session?.created_at || ''),
    updated_at: String(session?.updated_at || ''),
    completed_at: session?.completed_at ? String(session.completed_at) : null,
    match_score: Number.isFinite(Number(session?.match_score)) ? Number(session.match_score) : null,
    candidate,
    analysis: {
      summary: parsed.summary,
      recommendation: parsed.recommendation,
      strengths: parsed.strengths,
      concerns: parsed.concerns,
      confidence,
    },
    review,
  };
}

export function shouldIncludeInReviewQueue(item: RecruiterReviewQueueItem): boolean {
  return item.review.status === 'pending' || item.review.status === 'handoff';
}

export function compareReviewQueueItems(
  a: RecruiterReviewQueueItem,
  b: RecruiterReviewQueueItem
): number {
  const priorityDiff = PRIORITY_RANK[b.review.priority] - PRIORITY_RANK[a.review.priority];
  if (priorityDiff !== 0) return priorityDiff;

  const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
  const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
  return bTime - aTime;
}
