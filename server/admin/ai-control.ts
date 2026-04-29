import { supabase } from '../storage/supabase.js';

export interface AIControlSettings {
  aiEnabled: boolean;
  deepDiveEnabled: boolean;
  textFallbackEnabled: boolean;
  maxAudioBytes: number;
  modelPolicy: 'auto' | 'gemini' | 'fallback_only';
  updatedAt: string;
  updatedBy: string | null;
}

const DEFAULT_SETTINGS: AIControlSettings = {
  aiEnabled: true,
  deepDiveEnabled: true,
  textFallbackEnabled: true,
  maxAudioBytes: 8 * 1024 * 1024,
  modelPolicy: 'auto',
  updatedAt: new Date().toISOString(),
  updatedBy: null,
};

function sanitize(input: Partial<AIControlSettings>, base: AIControlSettings): AIControlSettings {
  const bytes = Number(input.maxAudioBytes ?? base.maxAudioBytes);
  const modelPolicyRaw = String(input.modelPolicy ?? base.modelPolicy);
  const modelPolicy: AIControlSettings['modelPolicy'] =
    modelPolicyRaw === 'gemini' || modelPolicyRaw === 'fallback_only' ? modelPolicyRaw : 'auto';

  return {
    aiEnabled: typeof input.aiEnabled === 'boolean' ? input.aiEnabled : base.aiEnabled,
    deepDiveEnabled:
      typeof input.deepDiveEnabled === 'boolean' ? input.deepDiveEnabled : base.deepDiveEnabled,
    textFallbackEnabled:
      typeof input.textFallbackEnabled === 'boolean'
        ? input.textFallbackEnabled
        : base.textFallbackEnabled,
    maxAudioBytes: Number.isFinite(bytes)
      ? Math.max(512_000, Math.min(20 * 1024 * 1024, Math.round(bytes)))
      : base.maxAudioBytes,
    modelPolicy,
    updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : base.updatedAt,
    updatedBy: typeof input.updatedBy === 'string' ? input.updatedBy : base.updatedBy,
  };
}

export async function getAIControl(): Promise<AIControlSettings> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'ai_control')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      throw error;
    }

    const parsed = (data?.value as Partial<AIControlSettings>) || {};
    return sanitize(parsed, DEFAULT_SETTINGS);
  } catch (err) {
    console.error('[ai-control] Failed to fetch settings from Supabase:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateAIControl(
  patch: Partial<AIControlSettings>,
  actorId: string | null
): Promise<AIControlSettings> {
  try {
    const current = await getAIControl();
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
      key: 'ai_control',
      value: merged,
      updated_at: new Date().toISOString(),
      updated_by: actorId,
    });

    if (error) throw error;

    return merged;
  } catch (err) {
    console.error('[ai-control] Failed to update settings in Supabase:', err);
    throw err;
  }
}
