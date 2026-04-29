import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { cv_id, target_role, cv_text: provided_cv_text } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    let cv_text = provided_cv_text;

    // If no text provided, fetch from database
    if (!cv_text && cv_id) {
      console.log(`Fetching CV for profile: ${cv_id}`);
      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('cv_master')
        .eq('id', cv_id)
        .single();

      if (error) throw new Error(`Failed to fetch CV: ${error.message}`);
      cv_text = data.cv_master;
    }

    if (!cv_text) {
      throw new Error("CV text is empty or not found");
    }

    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Você é um Especialista Sênior em Recrutamento Técnico da Recrutaria.AI.
      Analise o currículo abaixo para o cargo de "${target_role}".

      CURRÍCULO:
      ${cv_text}

      SAÍDA OBRIGATÓRIA (JSON APENAS):
      {
        "score": number (0-100),
        "reasoning": "Resumo executivo do perfil",
        "suggestions": ["Lista de 3 melhorias"],
        "red_flags": ["Alertas se houver"],
        "top_skills": ["Principais competências identificadas"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonStr = text.replace(/`{3}json/g, '').replace(/`{3}/g, '').trim();
    const analysis = JSON.parse(jsonStr);

    // Optional: Update the profile with the results
    if (cv_id) {
      await supabase
        .from('candidate_profiles')
        .update({ 
          scp_score: analysis.score,
          diagnosis: analysis.reasoning,
          attention_points: [...(analysis.red_flags || []), ...(analysis.suggestions || [])],
          updated_at: new Date().toISOString()
        })
        .eq('id', cv_id);
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
