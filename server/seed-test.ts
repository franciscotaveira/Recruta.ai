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
    
    await users.create(recruiterId, recruiterEmail, passwordHash, 'recruiter', 'Francisco RH');
    await dual.initRecruiterProfile(recruiterId, 'Recrutaria Corp');
    console.log(`✅ Recrutador criado: ${recruiterEmail}`);

    // 2. Criar Vaga (Corrigido com todos os argumentos)
    const jobId = randomUUID();
    await dual.createJob(
      jobId,
      recruiterId,
      'Desenvolvedor Full Stack Sênior', // title
      'Recrutaria Corp',                 // company
      'Remoto (Chapecó/SC)',            // location
      'Estamos em busca de um desenvolvedor experiente em React, Node.js e Supabase.', // description
      '["React", "Node.js", "Supabase", "TypeScript"]', // requirements (JSON string)
      'R$ 12.000 - R$ 18.000',          // salary_range
      'PJ',                             // job_type
      'Remoto'                          // modality
    );
    console.log('✅ Vaga publicada: Desenvolvedor Full Stack Sênior');

    // 3. Criar Candidato (VOCÊ - O Protagonista)
    const candidateId = randomUUID();
    const candidateEmail = 'francisco@recrutaria.com.br';
    const candidatePhone = '49988447562';
    
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

    // 4. Criar Candidato Fantasma 1 (O Concorrente Forte)
    const ghost1Id = randomUUID();
    await users.create(ghost1Id, 'ana.silva@email.com', passwordHash, 'candidate', 'Ana Silva');
    await dual.updateProfile(
      'Ana Silva',
      'ana.silva@email.com',
      '11988887777',
      'São Paulo, SP',
      'Full Stack Developer',
      'Senior',
      ghost1Id
    );
    await dual.setCV(
      'Experiência de 10 anos com arquitetura de software e times ágeis.',
      85,
      '{"tech": 90, "soft": 80}',
      'Candidata extremamente qualificada para liderança técnica.',
      '["Focar em casos de escala", "Destacar gestão de custos"]',
      '["Nenhum ponto crítico"]',
      ghost1Id
    );
    console.log('✅ Candidata fantasma 1 (Ana Silva) criada');

    // 5. Criar Candidato Fantasma 2 (O Concorrente Médio)
    const ghost2Id = randomUUID();
    await users.create(ghost2Id, 'joao.souza@email.com', passwordHash, 'candidate', 'João Souza');
    await dual.updateProfile(
      'João Souza',
      'joao.souza@email.com',
      '21977776666',
      'Rio de Janeiro, RJ',
      'Backend Developer',
      'Pleno',
      ghost2Id
    );
    await dual.setCV(
      'Desenvolvedor com foco em Node.js e bancos de dados SQL.',
      65,
      '{"tech": 70, "soft": 60}',
      'Candidato bom tecnicamente, mas falta senioridade em frontend.',
      '["Estudar React", "Aprender CI/CD"]',
      '["Falta experiência com liderança"]',
      ghost2Id
    );
    console.log('✅ Candidata fantasma 2 (João Souza) criado');

    console.log('\n--- 🏁 SEED FINALIZADO COM SUCESSO ---');
    console.log('RH: recrutador@recrutaria.com.br / senha123');
    console.log('Você: francisco@recrutaria.com.br / senha123');
    console.log('----------------------------------------');

  } catch (err) {
    console.error('❌ Erro no Seed:', err);
  }
}

seedTest();
