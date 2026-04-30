
import '../server/env.js';
import { createSession } from '../server/conversation/flow.js';
import { supabase } from '../server/storage/supabase.js';

async function triggerLiveInvite() {
  const phone = '5549988447562';
  const name = 'Francisco Rios';

  console.log('🔍 Buscando vaga para o convite de teste...');
  const { data: jobs } = await supabase
    .from('public_jobs')
    .select('id, recruiter_id, title, company')
    .eq('is_active', true)
    .limit(1);

  if (!jobs || jobs.length === 0) {
    console.error('❌ Nenhuma vaga ativa encontrada.');
    return;
  }

  const job = jobs[0];
  console.log(`✅ Disparando convite: ${job.title} em ${job.company}`);

  try {
    const sessionId = await createSession(
      phone,
      name,
      job.id,
      job.title,
      job.company || 'Recrutaria',
      job.recruiter_id,
      'direct'
    );
    console.log(`\n🚀 CONVITE ENVIADO!`);
    console.log(`Verifique seu WhatsApp no número ${phone}.`);
    console.log(`Session ID: ${sessionId}`);
  } catch (err: any) {
    console.error(`💥 Erro ao disparar: ${err.message}`);
  }
}

triggerLiveInvite();
