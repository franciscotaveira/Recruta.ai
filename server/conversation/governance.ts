import type {
  AISpecialist,
  AISpecialistArea,
  AISquadModelPolicy,
  AISquadSettings,
} from '../admin/ai-squad.js';
import type { AIControlSettings } from '../admin/ai-control.js';

export interface AreaGovernancePolicy {
  area: AISpecialistArea;
  enabled: boolean;
  requiresHumanReview: boolean;
  modelPolicy: AISquadModelPolicy;
}

const DEFAULT_AREA_POLICY: AreaGovernancePolicy = {
  area: 'triage',
  enabled: true,
  requiresHumanReview: true,
  modelPolicy: 'auto',
};

function normalizeModelPolicy(value: unknown): AISquadModelPolicy {
  return value === 'gemini' ||
    value === 'openai' ||
    value === 'openrouter' ||
    value === 'fallback_only'
    ? value
    : 'auto';
}

function findSpecialistByArea(squad: AISquadSettings, area: AISpecialistArea): AISpecialist | null {
  return squad.experts.find((expert) => expert.area === area) || null;
}

export function resolveAreaPolicy(
  squad: AISquadSettings,
  area: AISpecialistArea
): AreaGovernancePolicy {
  const specialist = findSpecialistByArea(squad, area);
  if (!specialist) {
    return {
      ...DEFAULT_AREA_POLICY,
      area,
    };
  }

  return {
    area,
    enabled: specialist.enabled,
    requiresHumanReview: specialist.humanReviewRequired,
    modelPolicy: normalizeModelPolicy(specialist.modelPolicy),
  };
}

function isModelAllowedByGlobalControl(
  controlPolicy: AIControlSettings['modelPolicy'],
  areaPolicy: AISquadModelPolicy
): boolean {
  if (controlPolicy === 'fallback_only') return false;
  if (areaPolicy === 'fallback_only') return false;

  if (controlPolicy === 'gemini') {
    return areaPolicy === 'auto' || areaPolicy === 'gemini';
  }

  return true;
}

export function canUseAutomatedAnalysis(
  control: AIControlSettings,
  areaPolicy: AreaGovernancePolicy
): boolean {
  if (!control.aiEnabled) return false;
  if (!areaPolicy.enabled) return false;
  return isModelAllowedByGlobalControl(control.modelPolicy, areaPolicy.modelPolicy);
}

export function shouldRequireHumanReview(
  squad: AISquadSettings,
  areaPolicy: AreaGovernancePolicy
): boolean {
  return squad.governance.humanInTheLoopRequired || areaPolicy.requiresHumanReview;
}

export function shouldThrottleForCapacity(
  squad: AISquadSettings,
  activeSessionsCount: number
): boolean {
  return activeSessionsCount >= squad.governance.maxParallelSessions;
}

export function canUseRagByGovernance(squad: AISquadSettings): boolean {
  const learningPolicy = resolveAreaPolicy(squad, 'learning');
  const compliancePolicy = resolveAreaPolicy(squad, 'compliance');
  return learningPolicy.enabled && compliancePolicy.enabled;
}

export function sanitizeForBlindScreening(text: string, enabled: boolean): string {
  const raw = String(text || '');
  if (!enabled) return raw;

  return raw
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email_redigido]')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '[telefone_redigido]')
    .replace(/https?:\/\/\S+/gi, '[url_redigida]');
}
