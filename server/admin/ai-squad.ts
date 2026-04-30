import { supabase } from '../storage/supabase.js';
import {
  AISpecialist,
  AISpecialistArea,
  AISquadGovernance,
  AISquadModelPolicy,
  AISquadSettings,
  AISquadSummary,
} from './ai-squad.types.js';

const DEFAULT_GOVERNANCE: AISquadGovernance = {
  consentRequired: true,
  blindScreeningEnabled: true,
  humanInTheLoopRequired: true,
  biasAuditCadenceDays: 30,
  maxParallelSessions: 200,
};

const AREA_VALUES: AISpecialistArea[] = [
  'attraction',
  'triage',
  'interview',
  'compliance',
  'candidate_experience',
  'quality',
  'revenue',
  'learning',
];

export function summarizeAISquad(settings: AISquadSettings): AISquadSummary {
  const enabledExperts = settings.experts.filter((expert) => expert.enabled);
  const coverage = AREA_VALUES.reduce<Record<AISpecialistArea, number>>(
    (acc, area) => {
      acc[area] = enabledExperts.filter((expert) => expert.area === area).length;
      return acc;
    },
    {
      attraction: 0,
      triage: 0,
      interview: 0,
      compliance: 0,
      candidate_experience: 0,
      quality: 0,
      revenue: 0,
      learning: 0,
    }
  );

  const governanceSignals = [
    settings.governance.consentRequired,
    settings.governance.blindScreeningEnabled,
    settings.governance.humanInTheLoopRequired,
    settings.governance.biasAuditCadenceDays <= 90,
  ];

  return {
    totalExperts: settings.experts.length,
    enabledExperts: enabledExperts.length,
    coverage,
    governanceScore: Math.round(
      (governanceSignals.filter(Boolean).length / governanceSignals.length) * 100
    ),
    governance: settings.governance,
  };
}

export async function getAISquad(): Promise<AISquadSettings> {
  try {
    // 1. Fetch Specialists
    const { data: specialists, error: specError } = await supabase
      .from('ai_specialists')
      .select('*')
      .order('area');

    if (specError) throw specError;

    // 2. Fetch Governance from system_settings
    const { data: govData, error: govError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'ai_governance')
      .single();

    const governance = (govData?.value as AISquadGovernance) || DEFAULT_GOVERNANCE;

    return {
      experts: (specialists || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        area: row.area as AISpecialistArea,
        objective: row.objective,
        keyMetric: row.key_metric,
        enabled: row.enabled,
        humanReviewRequired: row.human_review_required,
        modelPolicy: row.model_policy as AISquadModelPolicy,
        slaMinutes: row.sla_minutes,
        owner: row.owner,
        updatedAt: row.updated_at,
      })),
      governance,
      updatedAt: new Date().toISOString(),
      updatedBy: null,
    };
  } catch (err) {
    console.error('[ai-squad] Failed to fetch squad from Supabase:', err);
    throw err;
  }
}

export async function updateAISquad(
  patch: Partial<AISquadSettings>,
  actorId: string | null
): Promise<AISquadSettings> {
  try {
    // 1. Update Specialists if present
    if (patch.experts) {
      for (const expert of patch.experts) {
        const { error } = await supabase.from('ai_specialists').upsert({
          id: expert.id,
          name: expert.name,
          area: expert.area,
          objective: expert.objective,
          key_metric: expert.keyMetric,
          enabled: expert.enabled,
          human_review_required: expert.humanReviewRequired,
          model_policy: expert.modelPolicy,
          sla_minutes: expert.slaMinutes,
          owner: expert.owner,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
    }

    // 2. Update Governance if present
    if (patch.governance) {
      const { error } = await supabase.from('system_settings').upsert({
        key: 'ai_governance',
        value: patch.governance,
        updated_at: new Date().toISOString(),
        updated_by: actorId,
      });
      if (error) throw error;
    }

    return await getAISquad();
  } catch (err) {
    console.error('[ai-squad] Failed to update squad in Supabase:', err);
    throw err;
  }
}
