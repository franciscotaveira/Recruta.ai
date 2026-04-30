import { createClient } from '@supabase/supabase-js';
import '../env';

const supabaseUrl = process.env.SUPABASE_URL || 'https://csuxlpodmqmycxfkmuxv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.warn(
    '[WARNING] SUPABASE_SERVICE_ROLE_KEY not set. Backend database operations will fail.'
  );
}
// We use the Service Role Key because this backend bypasses RLS and acts entirely as the root authority.
export const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : (null as any);
