import test from 'node:test';
import assert from 'node:assert/strict';

import {
  barsLevelFromScore,
  buildStructuredQuestions,
  computeCompetencyScores,
  evaluateKnockoutReply,
  normalizeJobRequirements,
} from '../conversation/method.js';

test('normalizeJobRequirements applies defaults and keeps scientific fields', () => {
  const reqs = normalizeJobRequirements([
    {
      text: 'Experiência com React',
      category: 'technical',
      importance: 'must_have',
      weight: 5,
      knockout: true,
    },
    { text: 'Comunicação com time de produto', category: 'behavioral', importance: 'preferred' },
  ]);

  assert.equal(reqs.length, 2);
  assert.equal(reqs[0].knockout, true);
  assert.equal(reqs[0].weight, 5);
  assert.equal(reqs[1].importance, 'preferred');
  assert.equal(typeof reqs[1].barsAnchors[4], 'string');
});

test('buildStructuredQuestions prioritizes knockout first then bars', () => {
  const reqs = normalizeJobRequirements([
    {
      text: 'Disponibilidade presencial 2x na semana',
      importance: 'must_have',
      knockout: true,
      weight: 5,
    },
    { text: 'SQL para análise', category: 'technical', importance: 'must_have', weight: 4 },
  ]);
  const questions = buildStructuredQuestions('Analista de Dados', reqs);
  assert.equal(questions.length, 2);
  assert.equal(questions[0].type, 'knockout');
  assert.equal(questions[1].type, 'bars');
});

test('evaluateKnockoutReply supports pass/fail/unclear', () => {
  assert.equal(evaluateKnockoutReply('sim'), 'pass');
  assert.equal(evaluateKnockoutReply('não atendo'), 'fail');
  assert.equal(evaluateKnockoutReply('depende do contexto'), 'unclear');
});

test('barsLevelFromScore converts score bands to BARS levels', () => {
  assert.equal(barsLevelFromScore(10), 1);
  assert.equal(barsLevelFromScore(35), 2);
  assert.equal(barsLevelFromScore(55), 3);
  assert.equal(barsLevelFromScore(75), 4);
  assert.equal(barsLevelFromScore(95), 5);
});

test('computeCompetencyScores maps question scores to competency evidence', () => {
  const scores = computeCompetencyScores(
    [
      {
        requirementId: 'req_sql',
        requirementText: 'SQL avançado',
        category: 'technical',
        weight: 4,
      },
      {
        requirementId: 'req_comm',
        requirementText: 'Comunicação',
        category: 'behavioral',
        weight: 2,
      },
    ],
    [82, 54]
  );

  assert.equal(scores.length, 2);
  assert.equal(scores[0].barsLevel, 5);
  assert.equal(scores[0].evidence, 'forte');
  assert.equal(scores[1].barsLevel, 3);
  assert.equal(scores[1].evidence, 'moderada');
});

test('normalizeJobRequirements maps legacy aliases to canonical values', () => {
  const reqs = normalizeJobRequirements([
    {
      text: 'Portfólio de campanhas B2B',
      importance: 'nice_to_have',
      evidenceType: 'portfolio',
    },
    {
      text: 'Disponibilidade imediata',
      importance: 'must',
      evidenceType: 'audio_answer',
      knockout: true,
    },
  ]);

  assert.equal(reqs.length, 2);
  assert.equal(reqs[0].importance, 'preferred');
  assert.equal(reqs[0].evidenceType, 'technical');
  assert.equal(reqs[1].importance, 'must_have');
  assert.equal(reqs[1].evidenceType, 'behavioral');
});
