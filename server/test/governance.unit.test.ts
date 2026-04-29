import test from 'node:test';
import assert from 'node:assert/strict';
import type { AISquadSettings } from '../admin/ai-squad.js';
import type { AIControlSettings } from '../admin/ai-control.js';
import {
  canUseAutomatedAnalysis,
  canUseRagByGovernance,
  resolveAreaPolicy,
  sanitizeForBlindScreening,
  shouldThrottleForCapacity,
} from '../conversation/governance.js';

function baseSquad(): AISquadSettings {
  const now = new Date().toISOString();
  return {
    experts: [
      {
        id: 'triage-1',
        name: 'triage',
        area: 'triage',
        objective: 'triar',
        keyMetric: 'precision',
        enabled: true,
        humanReviewRequired: true,
        modelPolicy: 'gemini',
        slaMinutes: 10,
        owner: 'ops',
        updatedAt: now,
      },
      {
        id: 'interview-1',
        name: 'interview',
        area: 'interview',
        objective: 'entrevista',
        keyMetric: 'completion',
        enabled: true,
        humanReviewRequired: true,
        modelPolicy: 'auto',
        slaMinutes: 10,
        owner: 'ops',
        updatedAt: now,
      },
      {
        id: 'learning-1',
        name: 'learning',
        area: 'learning',
        objective: 'learn',
        keyMetric: 'lift',
        enabled: true,
        humanReviewRequired: false,
        modelPolicy: 'auto',
        slaMinutes: 60,
        owner: 'ops',
        updatedAt: now,
      },
      {
        id: 'compliance-1',
        name: 'compliance',
        area: 'compliance',
        objective: 'comply',
        keyMetric: 'incidents',
        enabled: true,
        humanReviewRequired: true,
        modelPolicy: 'fallback_only',
        slaMinutes: 60,
        owner: 'legal',
        updatedAt: now,
      },
    ],
    governance: {
      consentRequired: true,
      blindScreeningEnabled: true,
      humanInTheLoopRequired: true,
      biasAuditCadenceDays: 30,
      maxParallelSessions: 2,
    },
    updatedAt: now,
    updatedBy: 'test',
  };
}

function baseControl(): AIControlSettings {
  return {
    aiEnabled: true,
    deepDiveEnabled: true,
    textFallbackEnabled: true,
    maxAudioBytes: 1024 * 1024,
    modelPolicy: 'auto',
    updatedAt: new Date().toISOString(),
    updatedBy: 'test',
  };
}

test('canUseAutomatedAnalysis respects global fallback policy', () => {
  const squad = baseSquad();
  const triagePolicy = resolveAreaPolicy(squad, 'triage');

  const control = baseControl();
  control.modelPolicy = 'fallback_only';

  assert.equal(canUseAutomatedAnalysis(control, triagePolicy), false);
});

test('canUseRagByGovernance requires learning and compliance enabled', () => {
  const squad = baseSquad();
  assert.equal(canUseRagByGovernance(squad), true);

  squad.experts = squad.experts.map((expert) =>
    expert.area === 'learning' ? { ...expert, enabled: false } : expert
  );
  assert.equal(canUseRagByGovernance(squad), false);
});

test('shouldThrottleForCapacity enforces max parallel sessions', () => {
  const squad = baseSquad();
  assert.equal(shouldThrottleForCapacity(squad, 1), false);
  assert.equal(shouldThrottleForCapacity(squad, 2), true);
  assert.equal(shouldThrottleForCapacity(squad, 3), true);
});

test('sanitizeForBlindScreening masks direct personal identifiers', () => {
  const text = 'Meu email joao.silva@empresa.com e meu telefone +55 (11) 99999-9999.';
  const masked = sanitizeForBlindScreening(text, true);

  assert.equal(masked.includes('joao.silva@empresa.com'), false);
  assert.equal(masked.includes('99999-9999'), false);
  assert.equal(masked.includes('[email_redigido]'), true);
  assert.equal(masked.includes('[telefone_redigido]'), true);
});
