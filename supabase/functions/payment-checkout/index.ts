import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PACKAGES = {
  starter: { credits: 50, price: 199.00 },
  growth: { credits: 200, price: 699.00 },
  scale: { credits: 1000, price: 2990.00 }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { packageId, customer } = await req.json();
    const pkg = PACKAGES[packageId];
    
    if (!pkg) throw new Error("Invalid packageId");

    const abacateKey = Deno.env.get("ABACATE_PAY_TOKEN");
    if (!abacateKey) throw new Error("ABACATE_PAY_TOKEN not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get User from Auth Header (optional, but good for security)
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id;
    }

    // 2. Create Checkout on AbacatePay
    // Docs: https://abacatepay.readme.io/reference/create-billing
    const response = await fetch("https://api.abacatepay.com/v1/billing/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${abacateKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        frequency: "ONE_TIME",
        methods: ["PIX"],
        products: [
          {
            externalId: `credits_${packageId}`,
            name: `Pacote de Créditos: ${pkg.credits} CR`,
            quantity: 1,
            price: pkg.price * 100 // em centavos
          }
        ],
        returnUrl: Deno.env.get("FRONTEND_URL") || "http://localhost:4050/recruiter/billing",
        completionUrl: Deno.env.get("FRONTEND_URL") || "http://localhost:4050/recruiter/billing?success=true",
        customerId: customer?.taxId, // Usando taxId como ID se disponível
        customer: customer ? {
          name: customer.name,
          email: customer.email,
          taxId: customer.taxId
        } : undefined
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AbacatePay error: ${errText}`);
    }

    const abacateResult = await response.json();
    const billing = abacateResult.data;

    // 3. Save pending payment in DB
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        id: `pay_${crypto.randomUUID().slice(0,8)}`,
        abacate_billing_id: billing.id,
        user_id: userId,
        user_type: 'recruiter',
        product_type: 'credits',
        credits_amount: pkg.credits,
        amount_cents: pkg.price * 100,
        status: 'pending',
        checkout_url: billing.url,
        metadata: { packageId, customer }
      });

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    return new Response(
      JSON.stringify({ ok: true, checkoutUrl: billing.url }),
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
