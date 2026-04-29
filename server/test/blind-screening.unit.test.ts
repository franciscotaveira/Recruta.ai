import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildBlindCandidateSnapshot,
  projectBlindCandidateIdentity,
  sanitizeCandidateDocumentText,
} from '../skills/blind-screening.js';

test('buildBlindCandidateSnapshot returns masked identity when enabled', () => {
  const snapshot = buildBlindCandidateSnapshot({
    referenceId: 'session-abc123',
    candidateName: 'Francisco Taveira',
    candidatePhone: '+55 11 99999-1234',
    enabled: true,
  });

  assert.equal(snapshot.enabled, true);
  assert.equal(snapshot.label, 'Perfil ABC123');
  assert.ok(snapshot.maskedName?.includes('*'));
  assert.equal(snapshot.maskedPhone, '***1234');
});

test('buildBlindCandidateSnapshot keeps raw identity when disabled', () => {
  const snapshot = buildBlindCandidateSnapshot({
    referenceId: 'session-abc123',
    candidateName: 'Francisco Taveira',
    candidatePhone: '+55 11 99999-1234',
    enabled: false,
  });

  assert.equal(snapshot.enabled, false);
  assert.equal(snapshot.label, 'Francisco Taveira');
  assert.equal(snapshot.maskedName, 'Francisco Taveira');
  assert.equal(snapshot.maskedPhone, '+55 11 99999-1234');
});

test('projectBlindCandidateIdentity removes raw fields when blind screening is enabled', () => {
  const projection = projectBlindCandidateIdentity({
    referenceId: 'application-abc123',
    candidateName: 'Francisco Taveira',
    candidatePhone: '+55 11 99999-1234',
    enabled: true,
  });

  assert.equal(projection.blindCandidate.enabled, true);
  assert.equal(projection.candidateName, null);
  assert.equal(projection.candidatePhone, null);
  assert.equal(projection.blindCandidate.label, 'Perfil ABC123');
});

test('sanitizeCandidateDocumentText redacts name and contact data when blind screening is enabled', () => {
  const text = sanitizeCandidateDocumentText({
    text: 'Francisco Taveira\nEmail: francisco@example.com\nTelefone: +55 11 99999-1234',
    candidateName: 'Francisco Taveira',
    enabled: true,
  });

  assert.equal(
    text,
    '[nome_redigido]\nEmail: [email_redigido]\nTelefone: [telefone_redigido]'
  );
});
