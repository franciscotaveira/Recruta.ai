import './env.js';
import { createSession } from './conversation/flow.js';
import { supabase } from './storage/supabase.js';

async function testInvite() {
  const phone = '5549988447562';
  const name = 'Francisco (Teste)';
  
  console.log('🔍 Buscando vaga ativa...');
  const { data: jobs, error: jobError } = await supabase
    .from('public_jobs')
    .select('id, recruiter_id, title, company')
    .eq('is_active', true)
    .limit(1);

  if (jobError || !jobs || jobs.length === 0) {
    console.error('❌ Nenhuma vaga ativa encontrada para o teste.');
    process.exit(1);
  }

  const job = jobs[0];
  console.log(`✅ Usando vaga: ${job.title} (${job.company})`);
  
  try {
    console.log(`🚀 Enviando convite para ${phone}...`);
    const sessionId = await createSession(
      phone,
      name,
      job.id,
      job.title,
      job.company || 'Recruta.AI',
      job.recruiter_id,
      'direct'
    );
    console.log(`✨ Convite enviado com sucesso! Session ID: ${sessionId}`);
  } catch (err: any) {
    console.error(`💥 Falha ao enviar convite: ${err.message}`);
    process.exit(1);
  }
}

testInvite().catch(console.error);
