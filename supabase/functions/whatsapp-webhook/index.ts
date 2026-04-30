import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const eventType = body.event;

    if (eventType !== 'messages.upsert') {
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    const data = body.data;
    const message = data.message;
    const remoteJid = data.key.remoteJid;
    const fromMe = data.key.fromMe;
    const pushName = data.pushName;
    const phone = remoteJid.split('@')[0];

    if (fromMe) return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });

    const text = message.conversation || message.extendedTextMessage?.text || '';

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Find active session using correct column name
    const { data: session, error: sessionError } = await supabase
      .from('whatsapp_sessions')
      .select('*, public_jobs(*)')
      .eq('candidate_phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ ok: true, skipped: 'no_session' }), {
        headers: corsHeaders,
      });
    }

    // 2. Fetch recent history from wa_messages
    const { data: history } = await supabase
      .from('wa_messages')
      .select('direction, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(10);

    // 3. AI Processing
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const contextPrompt = `
      Você é a Especialista em Recrutamento da Recrutaria.AI. 
      Vaga: "${session.public_jobs?.title}".
      Candidato: ${session.candidate_name || pushName}.
      
      ESTADO ATUAL: ${session.state}
      HISTÓRICO RECENTE: ${JSON.stringify(history)}
      MENSAGEM DO CANDIDATO: "${text}"

      DIRETRIZES:
      - Se o candidato aceitou (SIM), mude para 'interviewing' e inicie as perguntas.
      - Se for o fim, mude para 'completed'.
      - Responda apenas em JSON.

      JSON:
      {
        "reply": "string",
        "newState": "invited | interviewing | completed | rejected"
      }
    `;

    const result = await model.generateContent(contextPrompt);
    const aiResponse = JSON.parse(
      result.response
        .text()
        .replace(/`{3}json/g, '')
        .replace(/`{3}/g, '')
        .trim()
    );

    // 4. Log interaction
    await supabase.from('wa_messages').insert([
      {
        id: `msg_${crypto.randomUUID().slice(0, 8)}`,
        session_id: session.id,
        direction: 'inbound',
        content: text,
      },
      {
        id: `msg_${crypto.randomUUID().slice(0, 8)}`,
        session_id: session.id,
        direction: 'outbound',
        content: aiResponse.reply,
      },
    ]);

    // 5. Update session
    await supabase
      .from('whatsapp_sessions')
      .update({
        state: aiResponse.newState,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    // 6. Send reply
    const evolutionUrl = Deno.env.get('EVOLUTION_API_URL') || 'http://command-tower-evolution:8080';
    const evolutionKey = Deno.env.get('EVOLUTION_API_KEY') || 'mct_master_key_2026';
    const instanceName = Deno.env.get('EVOLUTION_INSTANCE_NAME') || 'recrutaria';

    await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: { apikey: evolutionKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: remoteJid, text: aiResponse.reply }),
    });

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
