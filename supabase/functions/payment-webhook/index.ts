import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Função para verificar a assinatura HMAC-SHA256 da AbacatePay
 */
async function verifyAbacateSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(rawBody)
  );

  const calculatedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return calculatedSignature === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("X-Webhook-Signature");
    const webhookToken = Deno.env.get("ABACATE_PAY_TOKEN");

    if (!signature || !webhookToken) {
      console.error("Missing signature or webhook token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const rawBody = await req.text();
    const isValid = await verifyAbacateSignature(rawBody, signature, webhookToken);

    if (!isValid) {
      console.error("Invalid signature detected. Possible spoofing attempt.");
      return new Response(JSON.stringify({ error: "Invalid Signature" }), { status: 401, headers: corsHeaders });
    }

    const body = JSON.parse(rawBody);
    console.log("Verified AbacatePay Webhook:", body.event);

    if (body.event !== 'billing.paid') {
      return new Response(JSON.stringify({ ok: true, ignored: true }), { headers: corsHeaders });
    }

    const billingId = body.data.id;
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // CALL ATOMIC RPC
    const { data, error: rpcError } = await supabase.rpc('process_successful_payment', {
      p_billing_id: billingId,
      p_paid_at: new Date().toISOString()
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      throw new Error(`Failed to process payment: ${rpcError.message}`);
    }

    console.log("Payment Processed Successfully:", data);
    return new Response(JSON.stringify({ ok: true, result: data }), { headers: corsHeaders });

  } catch (error) {
    console.error("Webhook Internal Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
