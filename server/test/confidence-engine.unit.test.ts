import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyConfidenceAbstention,
  buildSessionConfidence,
} from '../skills/confidence-engine.js';

test('buildSessionConfidence returns high confidence for complete substantive answers', () => {
  const confidence = buildSessionConfidence({
    questions: [{ text: 'Q1' }, { text: 'Q2' }, { text: 'Q3' }, { text: 'Q4' }],
    responses: [
      {
        transcription:
          'Atuei por quatro anos liderando um time comercial com metas mensais, revisão semanal do funil e expansão da carteira em 18 por cento.',
      },
      {
        transcription:
          'Implementei playbooks, cadências de CRM e rotina de forecast para melhorar previsibilidade e acelerar fechamento de contratos complexos.',
      },
      {
        transcription:
          'Conduzi negociações enterprise, alinhei stakeholders técnicos e financeiros e reduzi churn ao redesenhar o onboarding de contas.',
      },
      {
        transcription:
          'Meu foco foi sempre conectar diagnóstico, execução e resultado, com métricas claras e acompanhamento por etapa do processo.',
      },
    ],
    analysis: {
      questionScores: [82, 80, 78, 84],
      recommendation: 'entrevista',
      summary: 'Bom alinhamento geral.',
      concerns: [],
      knockout: undefined,
    },
    fallbackAnalysisUsed: false,
  });

  assert.equal(confidence.level, 'high');
  assert.equal(confidence.autoRecommendationAllowed, true);
  assert.ok(confidence.score >= 72);
});

test('buildSessionConfidence blocks auto recommendation when analysis falls back', () => {
  const confidence = buildSessionConfidence({
    questions: [{ text: 'Q1' }, { text: 'Q2' }, { text: 'Q3' }, { text: 'Q4' }],
    responses: [{ transcription: 'Resposta curta.' }],
    analysis: {
      questionScores: [60],
      recommendation: 'mais_info',
      summary: 'Triagem concluída com análise parcial por fallback.',
      concerns: ['Análise automática indisponível no momento'],
      knockout: undefined,
    },
    fallbackAnalysisUsed: true,
  });

  assert.equal(confidence.autoRecommendationAllowed, false);
  assert.ok(confidence.reasons.includes('analysis_fallback'));
  assert.ok(confidence.score < 72);
});

test('applyConfidenceAbstention downgrades automatic interview recommendation when confidence is blocked', () => {
  const confidence = buildSessionConfidence({
    questions: [{ text: 'Q1' }, { text: 'Q2' }, { text: 'Q3' }, { text: 'Q4' }],
    responses: [{ transcription: 'Resposta curta.' }],
    analysis: {
      questionScores: [55],
      recommendation: 'entrevista',
      summary: 'Há sinais positivos, mas a evidência ainda é fraca.',
      concerns: [],
      knockout: undefined,
    },
    fallbackAnalysisUsed: false,
  });

  const analysis = applyConfidenceAbstention({
    analysis: {
      matchScore: 67,
      summary: 'Há sinais positivos, mas a evidência ainda é fraca.',
      strengths: ['Boa disposição'],
      concerns: [],
      recommendation: 'entrevista',
      questionScores: [55],
      competencyScores: [],
    },
    confidence,
    requiresHumanReview: false,
  });

  assert.equal(analysis.recommendation, 'mais_info');
  assert.ok(
    analysis.concerns.includes('A recomendação automática foi bloqueada até revisão do recrutador.')
  );
});

test('applyConfidenceAbstention blocks final recommendation when policy requires human review', () => {
  const confidence = buildSessionConfidence({
    questions: [{ text: 'Q1' }, { text: 'Q2' }, { text: 'Q3' }, { text: 'Q4' }],
    responses: [
      {
        transcription:
          'Atuei por quatro anos com metas claras, melhoria de processo e resultado comprovado em indicadores de receita.',
      },
      {
        transcription:
          'Conduzi time comercial, corrigi gargalos de funil e implementei rotinas de forecast com ganho de previsibilidade.',
      },
      {
        transcription:
          'Aproximei operação e liderança, melhorei cadência do CRM e reduzi perda entre etapas com ajuste de playbook.',
      },
      {
        transcription:
          'Também trouxe exemplos concretos de negociação, retenção e expansão com acompanhamento semanal dos KPIs.',
      },
    ],
    analysis: {
      questionScores: [82, 81, 79, 83],
      recommendation: 'entrevista',
      summary: 'Boa aderência geral.',
      concerns: [],
      knockout: undefined,
    },
    fallbackAnalysisUsed: false,
  });

  const analysis = applyConfidenceAbstention({
    analysis: {
      matchScore: 84,
      summary: 'Boa aderência geral.',
      strengths: ['Experiência consistente'],
      concerns: [],
      recommendation: 'entrevista',
      questionScores: [82, 81, 79, 83],
      competencyScores: [],
    },
    confidence,
    requiresHumanReview: true,
  });

  assert.equal(confidence.autoRecommendationAllowed, true);
  assert.equal(analysis.recommendation, 'mais_info');
  assert.ok(
    analysis.concerns.includes('Governança exige revisão humana antes de qualquer decisão final.')
  );
});
