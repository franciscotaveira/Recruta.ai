import { supabase } from '../storage/supabase.js';

export interface AIRagSettings {
  enabled: boolean;
  topK: number;
  minScore: number;
  maxContextChars: number;
  cacheTtlSeconds: number;
  includeCitations: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

const DEFAULT_SETTINGS: AIRagSettings = {
  enabled: true,
  topK: 4,
  minScore: 1,
  maxContextChars: 1800,
  cacheTtlSeconds: 600,
  includeCitations: true,
  updatedAt: new Date().toISOString(),
  updatedBy: null,
};

function sanitize(
  input: Partial<AIRagSettings> | null | undefined,
  base: AIRagSettings
): AIRagSettings {
  const row = input || {};
  const topK = Number(row.topK ?? base.topK);
  const minScore = Number(row.minScore ?? base.minScore);
  const maxContextChars = Number(row.maxContextChars ?? base.maxContextChars);
  const cacheTtlSeconds = Number(row.cacheTtlSeconds ?? base.cacheTtlSeconds);

  return {
    enabled: typeof row.enabled === 'boolean' ? row.enabled : base.enabled,
    topK: Number.isFinite(topK) ? Math.max(1, Math.min(10, Math.round(topK))) : base.topK,
    minScore: Number.isFinite(minScore)
      ? Math.max(0, Math.min(20, Math.round(minScore)))
      : base.minScore,
    maxContextChars: Number.isFinite(maxContextChars)
      ? Math.max(300, Math.min(5000, Math.round(maxContextChars)))
      : base.maxContextChars,
    cacheTtlSeconds: Number.isFinite(cacheTtlSeconds)
      ? Math.max(30, Math.min(3600, Math.round(cacheTtlSeconds)))
      : base.cacheTtlSeconds,
    includeCitations:
      typeof row.includeCitations === 'boolean' ? row.includeCitations : base.includeCitations,
    updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : base.updatedAt,
    updatedBy: typeof row.updatedBy === 'string' ? row.updatedBy : base.updatedBy,
  };
}

export async function getAIRagSettings(): Promise<AIRagSettings> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'ai_rag')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const parsed = (data?.value as Partial<AIRagSettings>) || {};
    return sanitize(parsed, DEFAULT_SETTINGS);
  } catch (err) {
    console.error('[ai-rag] Failed to fetch RAG settings from Supabase:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateAIRagSettings(
  patch: Partial<AIRagSettings>,
  actorId: string | null
): Promise<AIRagSettings> {
  try {
    const current = await getAIRagSettings();
    const merged = sanitize(
      {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
        updatedBy: actorId,
      },
      current
    );

    const { error } = await supabase.from('system_settings').upsert({
      key: 'ai_rag',
      value: merged,
      updated_at: new Date().toISOString(),
      updated_by: actorId,
    });

    if (error) throw error;

    return merged;
  } catch (err) {
    console.error('[ai-rag] Failed to update RAG settings in Supabase:', err);
    throw err;
  }
}

export async function getRAGDiagnostics() {
  const settings = await getAIRagSettings();
  return {
    ...settings,
    status: settings.enabled ? 'operational' : 'disabled',
    provider: 'supabase-vector',
  };
}
