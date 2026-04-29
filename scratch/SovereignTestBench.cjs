const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_RECRUITER_ID = 'recruiter_test_bench';
const TEST_JOB_ID = 'job_test_bench';

async function runTest() {
  console.log('🚀 Iniciando Sovereign Test Bench (JS)...');

  // 1. Setup Environment
  console.log('\n--- [1] Setup ---');
  await supabase.from('recruiter_wallet').upsert({
    recruiter_id: TEST_RECRUITER_ID,
    balance: 0,
    updated_at: new Date().toISOString()
  });
  console.log('✅ Carteira do recrutador zerada.');

  // 2. Simulate Payment Webhook
  console.log('\n--- [2] Teste: Webhook de Pagamento ---');
  const mockBillingId = `bill_${Math.random().toString(36).slice(2, 7)}`;
  
  await supabase.from('payments').insert({
    id: `pay_test_${Math.random().toString(36).slice(2, 7)}`,
    abacate_billing_id: mockBillingId,
    user_id: TEST_RECRUITER_ID,
    user_type: 'recruiter',
    product_type: 'credits',
    credits_amount: 100,
    amount_cents: 1000,
    status: 'pending'
  });

  const webhookUrl = `${supabaseUrl}/functions/v1/payment-webhook`;
  const resWeb = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'billing.paid',
      data: { id: mockBillingId }
    })
  });

  if (resWeb.ok) {
    console.log('✅ Webhook processado.');
    const { data: wallet } = await supabase.from('recruiter_wallet').select('balance').eq('recruiter_id', TEST_RECRUITER_ID).single();
    console.log(`Saldo atual: ${wallet?.balance} CR`);
  } else {
    console.error('❌ Erro no webhook:', await resWeb.text());
  }

  // 3. Create Job
  console.log('\n--- [3] Criando Job de Convite ---');
  const { data: job } = await supabase.from('system_jobs').insert({
    user_id: TEST_RECRUITER_ID,
    action_id: 'recruiter.invite_candidate',
    payload: { phone: '5511999999999', name: 'Teste Bench', jobId: TEST_JOB_ID, jobTitle: 'Dev', companyName: 'MCT' },
    status: 'queued'
  }).select().single();

  console.log(`Job enfileirado: ${job.id}`);
  
  console.log('\n✅ Teste concluído.');
}

runTest();
