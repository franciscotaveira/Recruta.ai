import { processInboundMessage } from '../server/conversation/flow';
import { wa, dual } from '../server/storage/db';
import { supabase } from '../server/storage/supabase';
import { randomUUID } from 'crypto';

// We override the global fetch to catch WhatsApp calls
const originalFetch = global.fetch;
global.fetch = async (url: any, options: any) => {
  if (url.toString().includes('facebook.com') || url.toString().includes('automatiklabs')) {
    console.log(`\n[MOCK WHATSAPP] Calling: ${url}`);
    if (options?.body) {
      const body = JSON.parse(options.body);
      if (body.template) {
        console.log(`   Template: ${body.template.name}`);
      } else if (body.text) {
        console.log(`   Text: ${body.text.body}`);
      } else if (body.interactive) {
        console.log(`   List: ${body.interactive.body.text}`);
      }
    }
    return {
      ok: true,
      json: async () => ({ messages: [{ id: 'wa_mock_' + Math.random().toString(36).slice(2) }] }),
      text: async () => '{"ok": true}'
    } as any;
  }
  return originalFetch(url, options);
};

async function runTest() {
  const TEST_PHONE = "554999999" + Math.floor(Math.random() * 1000);
  const jobId = randomUUID();
  const recruiterId = randomUUID();

  console.log("--- STARTING E2E TEST: CONSENT FLOW ---");

  try {
    // 1. Create Job
    await dual.createJob(jobId, recruiterId, "Desenvolvedor Backend Teste", "MCT LTDA", "Remoto", "Vaga para testar o fluxo de consentimento.", "[]", "R$ 10k", "CLT", "Remoto");
    console.log(`[DB] Job created: ${jobId}`);

    // 2. Create Session (simulating invite)
    const sessionId = randomUUID();
    await wa.createSession(sessionId, TEST_PHONE, "Candidato Teste", jobId, recruiterId, JSON.stringify([]));
    await wa.updateSessionState('invited', sessionId);
    console.log(`[DB] Session created: ${sessionId} (State: invited)`);

    // STEP 1: Candidate says SIM
    console.log("\n>>> STEP 1: Candidate says 'SIM'");
    const r1 = await processInboundMessage(TEST_PHONE, 'text', 'SIM');
    const s1 = await wa.getSession(sessionId);
    console.log(`[RESULT] Next State in DB: ${s1.state}`);
    if (s1.state !== 'consent_pending') throw new Error("Expected state to be consent_pending");

    // STEP 2: Candidate asks something else (should get reminder)
    console.log("\n>>> STEP 2: Candidate says 'Como funciona?'");
    await processInboundMessage(TEST_PHONE, 'text', 'Como funciona?');
    const s2 = await wa.getSession(sessionId);
    console.log(`[RESULT] State in DB: ${s2.state} (Remains pending)`);

    // STEP 3: Candidate says CONCORDO
    console.log("\n>>> STEP 3: Candidate says 'CONCORDO'");
    await processInboundMessage(TEST_PHONE, 'text', 'CONCORDO');
    const s3 = await wa.getSession(sessionId);
    console.log(`[RESULT] Next State in DB: ${s3.state}`);
    if (s3.state !== 'mic_check') throw new Error("Expected state to be mic_check");

    console.log("\n--- TEST COMPLETED SUCCESSFULLY ---");
  } catch (err) {
    console.error("\n--- TEST FAILED ---");
    console.error(err);
  } finally {
    // Cleanup
    await supabase.from('whatsapp_sessions').delete().eq('candidate_phone', TEST_PHONE);
    await supabase.from('public_jobs').delete().eq('id', jobId);
    console.log("\n[CLEANUP] Test data removed.");
  }
}

runTest().catch(console.error);
