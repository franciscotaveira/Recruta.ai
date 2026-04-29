import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildBulkCandidateProfileId,
  decodeBulkAttentionPoints,
  encodeBulkAttentionPoints,
  shapeBulkAnalysisCandidateForApi,
  shapeStoredBulkAnalysisResult,
} from '../skills/bulk-analysis.js';

test('buildBulkCandidateProfileId normalizes candidate phone digits', () => {
  assert.equal(
    buildBulkCandidateProfileId('job-123', '+55 (11) 99999-1234'),
    'bulk_job-123_5511999991234'
  );
});

test('encodeBulkAttentionPoints preserves strength and concern tags for storage', () => {
  assert.deepEqual(encodeBulkAttentionPoints(['Experiencia forte'], ['Validar lideranca']), [
    '[strength] Experiencia forte',
    '[concern] Validar lideranca',
  ]);
});

test('decodeBulkAttentionPoints recovers strengths and concerns from stored tags', () => {
  const points = decodeBulkAttentionPoints([
    '[strength] Dominio de CRM',
    '[concern] Validar profundidade tecnica',
  ]);

  assert.deepEqual(points.strengths, ['Dominio de CRM']);
  assert.deepEqual(points.concerns, ['Validar profundidade tecnica']);
});

test('shapeBulkAnalysisCandidateForApi hides raw identity when blind screening is enabled', () => {
  const shaped = shapeBulkAnalysisCandidateForApi(
    {
      name: 'Francisco Taveira',
      phone: '+55 11 99999-1234',
      email: 'francisco@example.com',
      cvText: 'Francisco Taveira\nEmail: francisco@example.com',
      matchScore: 82,
      strengths: ['Boa comunicacao'],
      concerns: ['Validar lideranca'],
      summary: 'Francisco Taveira tem aderencia alta.',
      recommendation: 'entrevistar',
    },
    { jobId: 'job-123', blindScreeningEnabled: true }
  );

  assert.equal(shaped.profile_id, 'bulk_job-123_5511999991234');
  assert.equal(shaped.name, null);
  assert.equal(shaped.phone, null);
  assert.equal(shaped.email, null);
  assert.equal(shaped.blind_candidate.enabled, true);
  assert.match(shaped.cvText, /\[nome_redigido\]/);
});

test('shapeStoredBulkAnalysisResult restores tagged insights for recruiter payloads', () => {
  const shaped = shapeStoredBulkAnalysisResult(
    {
      id: 'bulk_job-123_5511999991234',
      name: 'Francisco Taveira',
      phone: '+55 11 99999-1234',
      cv_master: 'Francisco Taveira\nTelefone: +55 11 99999-1234',
      diagnosis: 'Experiencia comercial consistente',
      attention_points: [
        '[strength] Boa tracao comercial',
        '[concern] Validar profundidade em outbound',
      ],
      scp_score: 76,
    },
    { blindScreeningEnabled: false }
  );

  assert.deepEqual(shaped.strengths, ['Boa tracao comercial']);
  assert.deepEqual(shaped.concerns, ['Validar profundidade em outbound']);
  assert.equal(shaped.recommendation, 'entrevistar');
});
