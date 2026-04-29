import type { CandidateAnalysis } from '../ai/analyze.js';
import type { CandidateKnockoutSummary } from '../ai/analyze.js';
import type { SessionConfidenceSnapshot } from '../conversation/summary.js';

type ResponseLike = {
  text?: string;
  transcription?: string;
  system?: string;
  answerType?: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]): number | null {
  if (!Array.isArray(values) || values.length === 0) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function isUserAnswer(response: unknown): response is ResponseLike {
  if (!response || typeof response !== 'object') return false;
  const row = response as Record<string, unknown>;
  if (typeof row.system === 'string' && row.system.trim().length > 0) return false;

  const text = String(row.transcription || row.text || '').trim();
  return text.length > 0;
}

function isSubstantiveAnswer(response: ResponseLike): boolean {
  const text = String(response.transcription || response.text || '').trim();
  const words = text.split(/\s+/).filter(Boolean);
  return text.length >= 80 || words.length >= 15;
}

function hasTextFallback(responses: unknown[]): boolean {
  return responses.some((response) => {
    if (!response || typeof response !== 'object') return false;
    const row = response as Record<string, unknown>;
    return (
      row.system === 'text_fallback_enabled' ||
      (row.system === 'mic_check_completed' && row.answerType === 'text')
    );
  });
}

function countDeepDiveRequests(responses: unknown[]): number {
  return responses.filter((response) => {
    if (!response || typeof response !== 'object') return false;
    return (response as Record<string, unknown>).system === 'deep_dive_requested';
  }).length;
}

function hasExplicitKnockoutSignal(knockout: CandidateKnockoutSummary | null | undefined): boolean {
  return Boolean(knockout?.status && typeof knockout.reason === 'string' && knockout.reason.trim());
}

function buildAbstentionConcern(code: string): string | null {
  switch (code) {
    case 'human_review_required':
      return 'Governança exige revisão humana antes de qualquer decisão final.';
    case 'analysis_fallback':
      return 'A análise automática entrou em fallback e exige validação humana.';
    case 'low_confidence':
      return 'A confiança da triagem ficou abaixo do limiar para decisão automática.';
    case 'incomplete_answer_coverage':
      return 'Nem todas as perguntas tiveram cobertura suficiente para uma decisão automática.';
    case 'shallow_evidence':
      return 'Parte das respostas trouxe evidência superficial para os requisitos avaliados.';
    case 'missing_question_scores':
      return 'A triagem não consolidou score suficiente para uma decisão automática.';
    case 'low_answer_quality':
      return 'A qualidade média das respostas ficou abaixo do esperado para automação segura.';
    case 'multiple_followups_required':
      return 'A triagem exigiu múltiplos aprofundamentos e precisa de validação humana.';
    case 'auto_recommendation_blocked':
      return 'A recomendação automática foi bloqueada até revisão do recrutador.';
    default:
      return null;
  }
}

export function buildSessionConfidence(input: {
  questions: Array<{ text?: string }>;
  responses: unknown[];
  analysis: {
    questionScores?: number[];
    recommendation?: CandidateAnalysis['recommendation'] | null;
    summary?: string;
    concerns?: string[];
    knockout?: CandidateKnockoutSummary | null;
  };
  fallbackAnalysisUsed: boolean;
}): SessionConfidenceSnapshot {
  const questions = Array.isArray(input.questions) ? input.questions : [];
  const responses = Array.isArray(input.responses) ? input.responses : [];
  const userAnswers = responses.filter(isUserAnswer);
  const substantiveAnswers = userAnswers.filter(isSubstantiveAnswer);
  const totalQuestions = Math.max(questions.length, userAnswers.length, 1);
  const answeredQuestions = Math.min(userAnswers.length, totalQuestions);
  const answerCoverage = answeredQuestions / totalQuestions;
  const substantiveCoverage =
    answeredQuestions > 0 ? substantiveAnswers.length / answeredQuestions : 0;
  const scoreCoverage = clamp(
    (Array.isArray(input.analysis.questionScores) ? input.analysis.questionScores.length : 0) /
      totalQuestions,
    0,
    1
  );
  const avgQuestionScore = average(
    Array.isArray(input.analysis.questionScores) ? input.analysis.questionScores : []
  );
  const averageScoreNormalized = clamp((avgQuestionScore ?? 0) / 100, 0, 1);
  const deepDiveCount = countDeepDiveRequests(responses);
  const textFallbackUsed = hasTextFallback(responses);
  const knockoutEvaluated = hasExplicitKnockoutSignal(input.analysis.knockout);

  let rawScore =
    answerCoverage * 45 +
    substantiveCoverage * 20 +
    scoreCoverage * 15 +
    averageScoreNormalized * 15 +
    (knockoutEvaluated ? 5 : 0);

  if (input.fallbackAnalysisUsed) rawScore -= 20;
  if (deepDiveCount > 0) rawScore -= Math.min(10, deepDiveCount * 3);
  if (answeredQuestions < totalQuestions) rawScore -= 5;

  const score = clamp(Math.round(rawScore), 0, 100);

  const reasons = Array.from(
    new Set(
      [
        input.fallbackAnalysisUsed ? 'analysis_fallback' : null,
        answerCoverage < 1 ? 'incomplete_answer_coverage' : null,
        substantiveCoverage < 0.7 && answeredQuestions > 0 ? 'shallow_evidence' : null,
        scoreCoverage < 1 ? 'missing_question_scores' : null,
        avgQuestionScore !== null && avgQuestionScore < 60 ? 'low_answer_quality' : null,
        deepDiveCount >= 2 ? 'multiple_followups_required' : null,
        score < 55 ? 'low_confidence' : null,
      ].filter((reason): reason is string => !!reason)
    )
  );

  const autoRecommendationAllowed =
    !input.fallbackAnalysisUsed &&
    score >= 72 &&
    answerCoverage >= 0.75 &&
    input.analysis.recommendation !== 'mais_info';

  return {
    score,
    level: score >= 80 ? 'high' : score >= 55 ? 'medium' : 'low',
    autoRecommendationAllowed,
    reasons,
    signals: {
      answeredQuestions,
      totalQuestions,
      substantiveAnswers: substantiveAnswers.length,
      scoreCoveragePct: Math.round(scoreCoverage * 100),
      averageQuestionScore: avgQuestionScore === null ? null : Math.round(avgQuestionScore),
      deepDiveCount,
      textFallbackUsed,
      fallbackAnalysisUsed: input.fallbackAnalysisUsed,
      knockoutEvaluated,
    },
  };
}

export function applyConfidenceAbstention(input: {
  analysis: CandidateAnalysis;
  confidence: SessionConfidenceSnapshot;
  requiresHumanReview: boolean;
}): CandidateAnalysis {
  const reasonCodes = Array.from(
    new Set(
      [
        input.requiresHumanReview ? 'human_review_required' : null,
        !input.confidence.autoRecommendationAllowed ? 'auto_recommendation_blocked' : null,
        ...input.confidence.reasons,
      ].filter((reason): reason is string => !!reason)
    )
  );

  const concerns = Array.from(
    new Set([
      ...input.analysis.concerns,
      ...reasonCodes
        .map((reason) => buildAbstentionConcern(reason))
        .filter((reason): reason is string => Boolean(reason)),
    ])
  );

  if (!input.requiresHumanReview && input.confidence.autoRecommendationAllowed) {
    if (concerns.length === input.analysis.concerns.length) return input.analysis;
    return {
      ...input.analysis,
      concerns,
    };
  }

  return {
    ...input.analysis,
    recommendation: 'mais_info',
    concerns,
  };
}
