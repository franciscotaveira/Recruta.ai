import test from 'node:test';
import assert from 'node:assert/strict';

import {
  decodeSessionAnalysis,
  encodeSessionAnalysis,
  encodeSessionAnalysisWithMetadata,
  updateSessionAnalysisMetadata,
} from '../conversation/summary.js';

test('encode/decode session analysis roundtrip', () => {
  const raw = encodeSessionAnalysis({
    matchScore: 82,
    summary: 'Bom alinhamento para próxima etapa.',
    strengths: ['Comunicação clara'],
    concerns: ['Pouca profundidade técnica em X'],
    recommendation: 'entrevista',
    questionScores: [80, 78, 88, 82],
  });

  const parsed = decodeSessionAnalysis(raw);
  assert.equal(parsed.summary, 'Bom alinhamento para próxima etapa.');
  assert.deepEqual(parsed.strengths, ['Comunicação clara']);
  assert.deepEqual(parsed.concerns, ['Pouca profundidade técnica em X']);
  assert.equal(parsed.recommendation, 'entrevista');
  assert.deepEqual(parsed.questionScores, [80, 78, 88, 82]);
});

test('decodeSessionAnalysis supports legacy free-text summary', () => {
  const parsed = decodeSessionAnalysis('Resumo antigo em texto puro');
  assert.equal(parsed.summary, 'Resumo antigo em texto puro');
  assert.deepEqual(parsed.strengths, []);
  assert.deepEqual(parsed.concerns, []);
  assert.equal(parsed.recommendation, null);
});

test('encode/decode triage_v2 keeps competency scores and knockout details', () => {
  const raw = encodeSessionAnalysis({
    matchScore: 0,
    summary: 'Encerrado por critério eliminatório.',
    strengths: [],
    concerns: ['Requisito eliminatório não atendido'],
    recommendation: 'rejeitar',
    questionScores: [],
    competencyScores: [
      {
        requirementId: 'req_sql',
        requirementText: 'SQL avançado',
        category: 'technical',
        weight: 4,
        score: 81,
        barsLevel: 5,
        evidence: 'forte',
        rationale: 'Caso concreto com métricas.',
      },
    ],
    knockout: {
      status: 'fail',
      reason: 'Não atende requisito eliminatório',
      requirementId: 'req_cert',
      requirementText: 'Certificação obrigatória',
      answer: 'não',
      questionType: 'knockout',
    },
  });

  const parsed = decodeSessionAnalysis(raw);
  assert.equal(parsed.summary, 'Encerrado por critério eliminatório.');
  assert.equal(parsed.competencyScores.length, 1);
  assert.equal(parsed.competencyScores[0].barsLevel, 5);
  assert.equal(parsed.knockout?.status, 'fail');
  assert.equal(parsed.knockout?.reason, 'Não atende requisito eliminatório');
});

test('encode/decode triage_v3 keeps confidence, recruiter review and blind candidate metadata', () => {
  const raw = encodeSessionAnalysisWithMetadata(
    {
      matchScore: 78,
      summary: 'Boa aderência com necessidade de revisão humana.',
      strengths: ['Experiência relevante'],
      concerns: ['Aprofundar caso de liderança'],
      recommendation: 'entrevista',
      questionScores: [76, 80, 78, 74],
      competencyScores: [],
    },
    {
      confidence: {
        score: 81,
        level: 'high',
        autoRecommendationAllowed: true,
        reasons: [],
        signals: {
          answeredQuestions: 4,
          totalQuestions: 4,
          substantiveAnswers: 4,
          scoreCoveragePct: 100,
          averageQuestionScore: 77,
          deepDiveCount: 0,
          textFallbackUsed: false,
          fallbackAnalysisUsed: false,
          knockoutEvaluated: false,
        },
      },
      recruiterReview: {
        status: 'pending',
        requiresHumanReview: true,
        priority: 'medium',
        reasons: ['human_review_required'],
        reviewedAt: null,
        reviewedBy: null,
        finalRecommendation: null,
        notes: null,
      },
      blindCandidate: {
        enabled: true,
        label: 'Perfil ABC123',
        maskedName: 'F********',
        maskedPhone: '***1234',
      },
    }
  );

  const parsed = decodeSessionAnalysis(raw);
  assert.equal(parsed.confidence?.score, 81);
  assert.equal(parsed.recruiterReview?.status, 'pending');
  assert.equal(parsed.blindCandidate?.label, 'Perfil ABC123');
});

test('updateSessionAnalysisMetadata updates recruiter review without losing prior analysis', () => {
  const raw = encodeSessionAnalysis({
    matchScore: 82,
    summary: 'Candidato com sinais fortes.',
    strengths: ['Boa comunicação'],
    concerns: ['Validar profundidade'],
    recommendation: 'entrevista',
    questionScores: [80, 84, 82, 82],
  });

  const updated = updateSessionAnalysisMetadata(raw, {
    recruiterReview: {
      status: 'reviewed',
      reviewedAt: '2026-04-23T10:00:00.000Z',
      reviewedBy: 'recruiter-1',
      finalRecommendation: 'entrevista',
    },
  });

  const parsed = decodeSessionAnalysis(updated);
  assert.equal(parsed.summary, 'Candidato com sinais fortes.');
  assert.equal(parsed.recruiterReview?.status, 'reviewed');
  assert.equal(parsed.recruiterReview?.reviewedBy, 'recruiter-1');
  assert.equal(parsed.recruiterReview?.finalRecommendation, 'entrevista');
});
