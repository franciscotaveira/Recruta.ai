import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildRecruiterReviewQueueItem,
  compareReviewQueueItems,
  shouldIncludeInReviewQueue,
} from '../review/queue.js';

test('buildRecruiterReviewQueueItem masks candidate identity when blind screening is enabled', () => {
  const item = buildRecruiterReviewQueueItem(
    {
      id: 'session-abc123',
      job_id: 'job-1',
      recruiter_id: 'recruiter-1',
      candidate_name: 'Francisco Taveira',
      candidate_phone: '+55 11 99999-1234',
      state: 'completed',
      questions: [{ text: 'Q1' }, { text: 'Q2' }],
      responses: [
        {
          transcription:
            'Tenho experiência liderando operação comercial com indicadores, revisão de pipeline e expansão de receita.',
        },
        {
          transcription:
            'Atuei também na implementação de CRM, rotina de forecast e melhoria da conversão entre etapas do funil.',
        },
      ],
      summary: JSON.stringify({
        version: 'triage_v3',
        summary: 'Boa aderência geral.',
        strengths: ['Execução forte'],
        concerns: ['Revisão humana obrigatória'],
        recommendation: 'entrevista',
        questionScores: [82, 80],
        competencyScores: [],
        knockout: null,
      }),
      match_score: 81,
      created_at: '2026-04-23T09:00:00.000Z',
      updated_at: '2026-04-23T09:05:00.000Z',
      completed_at: '2026-04-23T09:05:00.000Z',
    },
    {
      blindScreeningEnabled: true,
      requiresHumanReview: true,
    }
  );

  assert.equal(item.candidate.enabled, true);
  assert.equal(item.candidate.label, 'Perfil ABC123');
  assert.equal(item.review.status, 'pending');
  assert.equal(shouldIncludeInReviewQueue(item), true);
});

test('compareReviewQueueItems prioritizes urgent handoff before regular pending review', () => {
  const pending = buildRecruiterReviewQueueItem(
    {
      id: 'session-pending',
      job_id: 'job-1',
      recruiter_id: 'recruiter-1',
      candidate_name: 'Candidato A',
      candidate_phone: '+55 11 98888-0001',
      state: 'completed',
      questions: [{ text: 'Q1' }],
      responses: [{ transcription: 'Resposta completa com contexto e resultado mensurável.' }],
      summary: null,
      match_score: 70,
      created_at: '2026-04-23T09:00:00.000Z',
      updated_at: '2026-04-23T09:00:00.000Z',
      completed_at: '2026-04-23T09:00:00.000Z',
    },
    {
      blindScreeningEnabled: false,
      requiresHumanReview: true,
    }
  );

  const handoff = buildRecruiterReviewQueueItem(
    {
      id: 'session-handoff',
      job_id: 'job-1',
      recruiter_id: 'recruiter-1',
      candidate_name: 'Candidato B',
      candidate_phone: '+55 11 98888-0002',
      state: 'handoff_requested',
      questions: [{ text: 'Q1' }],
      responses: [{ transcription: 'Preciso falar com uma pessoa humana.' }],
      summary: null,
      match_score: null,
      created_at: '2026-04-23T09:01:00.000Z',
      updated_at: '2026-04-23T09:02:00.000Z',
      completed_at: null,
    },
    {
      blindScreeningEnabled: false,
      requiresHumanReview: true,
    }
  );

  const sorted = [pending, handoff].sort(compareReviewQueueItems);
  assert.equal(sorted[0].session_id, 'session-handoff');
  assert.equal(sorted[0].review.priority, 'urgent');
});

test('buildRecruiterReviewQueueItem reapplies blind screening when current governance is enabled', () => {
  const item = buildRecruiterReviewQueueItem(
    {
      id: 'session-legacy-open',
      job_id: 'job-1',
      recruiter_id: 'recruiter-1',
      candidate_name: 'Maria Silva',
      candidate_phone: '+55 11 97777-0003',
      state: 'completed',
      questions: [{ text: 'Q1' }],
      responses: [{ transcription: 'Resposta sólida com contexto e resultado.' }],
      summary: JSON.stringify({
        version: 'triage_v3',
        summary: 'Boa aderência geral.',
        strengths: ['Execução forte'],
        concerns: [],
        recommendation: 'entrevista',
        questionScores: [84],
        competencyScores: [],
        knockout: null,
        blindCandidate: {
          enabled: false,
          label: 'Maria Silva',
          maskedName: 'Maria Silva',
          maskedPhone: '+55 11 97777-0003',
        },
      }),
      match_score: 84,
      created_at: '2026-04-23T09:00:00.000Z',
      updated_at: '2026-04-23T09:05:00.000Z',
      completed_at: '2026-04-23T09:05:00.000Z',
    },
    {
      blindScreeningEnabled: true,
      requiresHumanReview: false,
    }
  );

  assert.equal(item.candidate.enabled, true);
  assert.equal(item.candidate.label, 'Perfil CYOPEN');
  assert.equal(item.candidate.maskedPhone, '***0003');
});
