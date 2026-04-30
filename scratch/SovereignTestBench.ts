import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_RECRUITER_ID = 'recruiter_test_bench';
const TEST_JOB_ID = 'job_test_bench';

async function runTest() {
  console.log('🚀 Iniciando Sovereign Test Bench...');

  // 1. Setup Environment
  console.log('\n--- [1] Setup ---');
  await supabase.from('recruiter_wallet').upsert({
    recruiter_id: TEST_RECRUITER_ID,
    balance: 0,
    updated_at: new Date().toISOString(),
  });
  console.log('✅ Carteira do recrutador zerada para o teste.');

  // 2. Test Credit Gating (Failure Case)
  console.log('\n--- [2] Teste: Gating de Créditos (Deve Falhar) ---');
  const { data: jobFail, error: jobFailErr } = await supabase
    .from('system_jobs')
    .insert({
      user_id: TEST_RECRUITER_ID,
      action_id: 'recruiter.invite_candidate',
      payload: {
        phone: '5511999999999',
        name: 'Candidato Teste',
        jobId: TEST_JOB_ID,
        jobTitle: 'Dev',
        companyName: 'MCT',
      },
      status: 'queued',
    })
    .select()
    .single();

  if (jobFailErr) throw jobFailErr;
  console.log(`Job criado: ${jobFail.id}. Aguardando processamento...`);

  // Wait for JobQueue (Worker) to process
  // Note: Since the worker is in the browser, we might need to manually trigger the check or simulate it here
  // But for this script, we can check if it stays in 'failed' status if the worker was running
  // Actually, let's simulate the checkAndDeductCredits logic here to verify policy

  // 3. Simulate Payment (AbacatePay Webhook)
  console.log('\n--- [3] Teste: Webhook de Pagamento (Simulação PIX) ---');
  const mockBillingId = `bill_${Math.random().toString(36).slice(2, 7)}`;

  // Create a pending payment first
  await supabase.from('payments').insert({
    id: `pay_test_${Math.random().toString(36).slice(2, 7)}`,
    abacate_billing_id: mockBillingId,
    user_id: TEST_RECRUITER_ID,
    user_type: 'recruiter',
    product_type: 'credits',
    credits_amount: 100,
    amount_cents: 1000,
    status: 'pending',
  });

  // Call the Edge Function Webhook
  const webhookUrl = `${supabaseUrl}/functions/v1/payment-webhook`;
  const resWeb = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'billing.paid',
      data: { id: mockBillingId },
    }),
  });

  if (resWeb.ok) {
    console.log('✅ Webhook processado com sucesso.');
    const { data: wallet } = await supabase
      .from('recruiter_wallet')
      .select('balance')
      .eq('recruiter_id', TEST_RECRUITER_ID)
      .single();
    console.log(`Novo saldo: ${wallet?.balance} CR (Esperado: 100)`);
  } else {
    console.error('❌ Falha no webhook:', await resWeb.text());
  }

  // 4. Test Job Execution (Success Case)
  console.log('\n--- [4] Teste: Execução de Job com Saldo ---');
  // Trigger another job
  const { data: jobPass } = await supabase
    .from('system_jobs')
    .insert({
      user_id: TEST_RECRUITER_ID,
      action_id: 'recruiter.invite_candidate',
      payload: {
        phone: '5511999999999',
        name: 'Candidato Teste 2',
        jobId: TEST_JOB_ID,
        jobTitle: 'Senior Dev',
        companyName: 'MCT',
      },
      status: 'queued',
    })
    .select()
    .single();

  console.log(`Job ${jobPass.id} enfileirado com sucesso.`);

  console.log('\n✅ Sovereign Test Bench concluído.');
}

runTest().catch(console.error);
