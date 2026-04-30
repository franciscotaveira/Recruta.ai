import { dual, users } from './storage/db.js';
import { randomUUID } from 'crypto';
import './env.js';

async function seedTest() {
  console.log('🚀 Iniciando Seed de Teste Completo...');

  try {
    // 1. Criar Recrutador (RH)
    const recruiterId = randomUUID();
    const recruiterEmail = 'recrutador@recrutaria.com.br';
    const passwordHash = 'salt:hash_simulado'; 
    
    try {
      await users.create(recruiterId, recruiterEmail, passwordHash, 'recruiter', 'Francisco RH');
      await dual.initRecruiterProfile(recruiterId, 'Recrutaria Corp');
      console.log(`✅ Recrutador criado: ${recruiterEmail}`);
    } catch (e: any) {
      if (e.code === '23505') {
        console.log(`ℹ️ Recrutador ${recruiterEmail} já existe. Pulando criação.`);
      } else {
        throw e;
      }
    }

    // Pegar o ID do recrutador existente (ou usar o novo)
    const existingRecruiter = await users.findByEmail(recruiterEmail) as any;
    const finalRecruiterId = existingRecruiter?.id || recruiterId;

    // 2. Criar Vaga
    const jobId = randomUUID();
    await dual.createJob(
      jobId,
      finalRecruiterId,
      'Desenvolvedor Full Stack Sênior',
      'Recrutaria Corp',
      'Remoto (Chapecó/SC)',
      'Estamos em busca de um desenvolvedor experiente em React, Node.js e Supabase.',
      '["React", "Node.js", "Supabase", "TypeScript"]',
      'R$ 12.000 - R$ 18.000',
      'PJ',
      'Remoto'
    );
    console.log('✅ Vaga publicada: Desenvolvedor Full Stack Sênior');

    // 3. Criar Candidato (VOCÊ)
    const candidateId = randomUUID();
    const candidateEmail = 'francisco@recrutaria.com.br';
    const candidatePhone = '49988447562';
    
    try {
      await users.create(candidateId, candidateEmail, passwordHash, 'candidate', 'Francisco Taveira');
      await dual.updateProfile(
        'Francisco Taveira',
        candidateEmail,
        candidatePhone,
        'Chapecó, SC',
        'Software Engineer',
        'Senior',
        candidateId
      );
      await dual.initCandidateWallet(candidateId);
      console.log(`✅ Seu usuário candidato criado: ${candidateEmail}`);
    } catch (e: any) {
      if (e.code === '23505') {
        console.log(`ℹ️ Candidato ${candidateEmail} já existe. Pulando criação.`);
      } else {
        throw e;
      }
    }

    // 4. Criar Candidatos Fantasmas
    const ghosts = [
      { email: 'ana.silva@email.com', name: 'Ana Silva', role: 'Senior' },
      { email: 'joao.souza@email.com', name: 'João Souza', role: 'Pleno' }
    ];

    for (const g of ghosts) {
      try {
        const gId = randomUUID();
        await users.create(gId, g.email, passwordHash, 'candidate', g.name);
        await dual.updateProfile(g.name, g.email, '11999998888', 'Brasil', 'Dev', g.role, gId);
        console.log(`✅ Fantasma criado: ${g.name}`);
      } catch (e: any) {
         if (e.code === '23505') {
            console.log(`ℹ️ Fantasma ${g.name} já existe.`);
         }
      }
    }

    console.log('\n--- 🏁 SEED FINALIZADO ---');
    console.log('RH: recrutador@recrutaria.com.br / senha123');
    console.log('Você: francisco@recrutaria.com.br / senha123');
    console.log('----------------------------------------');

  } catch (err) {
    console.error('❌ Erro crítico no Seed:', err);
  }
}

seedTest();
