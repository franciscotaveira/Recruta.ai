import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, name, jobId, jobTitle, companyName, recruiterId } = await req.json();

    if (!phone) throw new Error('Phone is required');

    const evolutionUrl = Deno.env.get('EVOLUTION_API_URL') || 'http://command-tower-evolution:8080';
    const evolutionKey = Deno.env.get('EVOLUTION_API_KEY') || 'mct_master_key_2026';
    const instanceName = Deno.env.get('EVOLUTION_INSTANCE_NAME') || 'recrutaria';

    // 1. Create WhatsApp Session in DB
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: session, error: sessionError } = await supabase
      .from('whatsapp_sessions')
      .insert({
        id: `sess_${crypto.randomUUID().slice(0, 8)}`,
        candidate_phone: phone,
        candidate_name: name,
        job_id: jobId,
        recruiter_id: recruiterId,
        state: 'invited',
      })
      .select()
      .single();

    if (sessionError) throw new Error(`Failed to create session: ${sessionError.message}`);

    // 2. Prepare message
    const message = `Olá ${name || 'candidato(a)'}! 👋\n\nIdentificamos que seu perfil tem um ótimo potencial para a vaga de *${jobTitle}* na *${companyName}*.\n\nGostaria de participar da triagem inicial agora? (Responda *SIM* para começar)`;

    // 3. Send via Evolution API
    const response = await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        apikey: evolutionKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: phone,
        text: message,
        linkPreview: true,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Evolution API error: ${errBody}`);
    }

    const result = await response.json();

    // Log the message in wa_messages
    await supabase.from('wa_messages').insert({
      id: `msg_${crypto.randomUUID().slice(0, 8)}`,
      session_id: session.id,
      direction: 'outbound',
      type: 'text',
      content: message,
      status: 'sent',
    });

    return new Response(
      JSON.stringify({ ok: true, sessionId: session.id, evolutionResult: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
