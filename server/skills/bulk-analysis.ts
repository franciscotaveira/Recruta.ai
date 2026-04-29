import {
  projectBlindCandidateIdentity,
  sanitizeCandidateDocumentText,
} from './blind-screening.js';

export type BulkRecommendation = 'entrevistar' | 'rejeitar' | 'talvez';

type BulkAnalysisCandidateLike = {
  profile_id?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  cvText?: string | null;
  matchScore?: number | null;
  strengths?: string[] | null;
  concerns?: string[] | null;
  summary?: string | null;
  recommendation?: BulkRecommendation | null;
};

export type BulkAnalysisErrorLike = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  error: string;
};

const NEGATIVE_POINT_PATTERNS = [
  /\bconcern/i,
  /\bpreocup/i,
  /\brisco/i,
  /\bgap/i,
  /\bfalta/i,
  /\baus[eê]n/i,
  /\blimitad/i,
  /\bvalidar/i,
  /\baprofundar/i,
  /\baten[cç][aã]o/i,
];

function normalizeStringList(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => String(item || '').trim())
    .filter(Boolean);
}

export function buildBulkCandidateProfileId(jobId: string, candidatePhone?: string | null): string {
  const digits = String(candidatePhone || '').replace(/\D+/g, '');
  return `bulk_${jobId}_${digits || 'candidate'}`;
}

export function encodeBulkAttentionPoints(strengths: string[] = [], concerns: string[] = []): string[] {
  return [
    ...strengths.map((item) => `[strength] ${String(item || '').trim()}`.trim()),
    ...concerns.map((item) => `[concern] ${String(item || '').trim()}`.trim()),
  ].filter((item) => item !== '[strength]' && item !== '[concern]');
}

export function decodeBulkAttentionPoints(input: unknown): {
  strengths: string[];
  concerns: string[];
} {
  const strengths: string[] = [];
  const concerns: string[] = [];

  for (const item of normalizeStringList(input)) {
    if (item.toLowerCase().startsWith('[strength]')) {
      const value = item.replace(/^\[strength\]\s*/i, '').trim();
      if (value) strengths.push(value);
      continue;
    }

    if (item.toLowerCase().startsWith('[concern]')) {
      const value = item.replace(/^\[concern\]\s*/i, '').trim();
      if (value) concerns.push(value);
      continue;
    }

    if (NEGATIVE_POINT_PATTERNS.some((pattern) => pattern.test(item))) {
      concerns.push(item);
    } else {
      strengths.push(item);
    }
  }

  return { strengths, concerns };
}

export function deriveBulkRecommendationFromScore(score: number | null | undefined): BulkRecommendation {
  const normalizedScore = Number.isFinite(score) ? Number(score) : 0;

  if (normalizedScore >= 70) return 'entrevistar';
  if (normalizedScore >= 40) return 'talvez';
  return 'rejeitar';
}

export function shapeBulkAnalysisCandidateForApi(
  candidate: BulkAnalysisCandidateLike,
  options: { jobId: string; blindScreeningEnabled: boolean }
) {
  const profileId =
    String(candidate.profile_id || '').trim() ||
    buildBulkCandidateProfileId(options.jobId, candidate.phone);
  const candidateProjection = projectBlindCandidateIdentity({
    referenceId: profileId,
    candidateName: candidate.name,
    candidatePhone: candidate.phone,
    enabled: options.blindScreeningEnabled,
  });

  return {
    profile_id: profileId,
    name: candidateProjection.candidateName,
    phone: candidateProjection.candidatePhone,
    email: options.blindScreeningEnabled ? null : String(candidate.email || '').trim() || null,
    cvText:
      sanitizeCandidateDocumentText({
        text: candidate.cvText,
        candidateName: candidate.name,
        enabled: options.blindScreeningEnabled,
      }) || '',
    matchScore: Number(candidate.matchScore || 0),
    strengths: normalizeStringList(candidate.strengths),
    concerns: normalizeStringList(candidate.concerns),
    summary:
      sanitizeCandidateDocumentText({
        text: candidate.summary,
        candidateName: candidate.name,
        enabled: options.blindScreeningEnabled,
      }) || '',
    recommendation:
      candidate.recommendation || deriveBulkRecommendationFromScore(Number(candidate.matchScore || 0)),
    blind_candidate: candidateProjection.blindCandidate,
  };
}

export function shapeBulkAnalysisErrorForApi(
  error: BulkAnalysisErrorLike,
  options: { jobId: string; blindScreeningEnabled: boolean }
) {
  const profileId = buildBulkCandidateProfileId(options.jobId, error.phone);
  const candidateProjection = projectBlindCandidateIdentity({
    referenceId: profileId,
    candidateName: error.name,
    candidatePhone: error.phone,
    enabled: options.blindScreeningEnabled,
  });

  return {
    profile_id: profileId,
    name: candidateProjection.blindCandidate.enabled
      ? candidateProjection.blindCandidate.label
      : candidateProjection.candidateName || String(error.name || '').trim() || 'Candidato',
    phone: candidateProjection.candidatePhone,
    error: String(error.error || 'Erro na análise'),
    blind_candidate: candidateProjection.blindCandidate,
  };
}

export function shapeStoredBulkAnalysisResult(
  profile: any,
  options: { blindScreeningEnabled: boolean }
) {
  const profileId = String(profile?.id || '');
  const candidateProjection = projectBlindCandidateIdentity({
    referenceId: profileId,
    candidateName: profile?.name,
    candidatePhone: profile?.phone,
    enabled: options.blindScreeningEnabled,
  });
  const points = decodeBulkAttentionPoints(profile?.attention_points);
  const matchScore = Number(profile?.scp_score || 0);

  return {
    profile_id: profileId,
    name: candidateProjection.candidateName,
    phone: candidateProjection.candidatePhone,
    email: options.blindScreeningEnabled ? null : String(profile?.email || '').trim() || null,
    cvText:
      sanitizeCandidateDocumentText({
        text: profile?.cv_master,
        candidateName: profile?.name,
        enabled: options.blindScreeningEnabled,
      }) || '',
    matchScore,
    strengths: points.strengths,
    concerns: points.concerns,
    summary:
      sanitizeCandidateDocumentText({
        text: profile?.diagnosis,
        candidateName: profile?.name,
        enabled: options.blindScreeningEnabled,
      }) || '',
    recommendation: deriveBulkRecommendationFromScore(matchScore),
    blind_candidate: candidateProjection.blindCandidate,
  };
}
