import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildRecruiterCandidateExportRows,
  encodeRecruiterCandidateExportCsv,
  normalizeRecruiterCandidateExportFormat,
  parseBooleanQueryFlag,
} from '../export/recruiter-candidates.js';

test('normalizeRecruiterCandidateExportFormat defaults to csv and validates json/csv', () => {
  assert.equal(normalizeRecruiterCandidateExportFormat(undefined), 'csv');
  assert.equal(normalizeRecruiterCandidateExportFormat('json'), 'json');
  assert.equal(normalizeRecruiterCandidateExportFormat('CSV'), 'csv');
  assert.equal(normalizeRecruiterCandidateExportFormat('xlsx'), null);
});

test('parseBooleanQueryFlag understands common truthy values', () => {
  assert.equal(parseBooleanQueryFlag('true'), true);
  assert.equal(parseBooleanQueryFlag('1'), true);
  assert.equal(parseBooleanQueryFlag('sim'), true);
  assert.equal(parseBooleanQueryFlag('false'), false);
  assert.equal(parseBooleanQueryFlag(undefined), false);
});

test('buildRecruiterCandidateExportRows maps candidate payload to export rows', () => {
  const rows = buildRecruiterCandidateExportRows([
    {
      id: 'profile-1',
      blind_candidate: { label: 'Perfil ABC123' },
      name: null,
      email: null,
      phone: null,
      location: 'Florianopolis',
      target_role: 'SDR',
      seniority: 'Pleno',
      scp_score: 81,
      diagnosis: 'Bom fit para inside sales',
      attention_points: ['[strength] Comunicacao', '[concern] Validar metricas'],
      history: [
        {
          status: 'shortlisted',
          public_jobs: { title: 'SDR B2B', company: 'ACME' },
        },
      ],
      updated_at: '2026-04-23T17:00:00.000Z',
    },
  ]);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].profile_id, 'profile-1');
  assert.equal(rows[0].blind_label, 'Perfil ABC123');
  assert.equal(rows[0].history_count, 1);
  assert.equal(rows[0].latest_job, 'SDR B2B');
  assert.equal(rows[0].latest_company, 'ACME');
  assert.equal(rows[0].latest_status, 'shortlisted');
});

test('encodeRecruiterCandidateExportCsv escapes commas and quotes', () => {
  const csv = encodeRecruiterCandidateExportCsv([
    {
      profile_id: 'profile-1',
      blind_label: 'Perfil ABC123',
      name: null,
      email: null,
      phone: null,
      location: 'Sao Paulo, SP',
      target_role: 'SDR',
      seniority: 'Pleno',
      scp_score: 75,
      history_count: 2,
      latest_job: 'SDR "Enterprise"',
      latest_company: 'ACME',
      latest_status: 'approved',
      attention_points: 'Comunicacao | Ownership',
      diagnosis: 'Resumo simples',
      updated_at: '2026-04-23T17:00:00.000Z',
    },
  ]);

  assert.match(csv, /^﻿profile_id,/);
  assert.match(csv, /"Sao Paulo, SP"/);
  assert.match(csv, /"SDR ""Enterprise"""/);
});
