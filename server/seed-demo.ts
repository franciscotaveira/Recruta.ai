/**
 * Demo Seed Script — populates the database with realistic demo data
 * Run: npx tsx seed-demo.ts
 *
 * Creates:
 *   - 5 realistic job postings from real Brazilian companies
 *   - 8 candidate applications with varied profiles
 *   - CV analysis data
 */

import { dual } from './storage/db.js';
import { randomUUID } from 'crypto';

console.log('🌱 Seeding demo data...\n');

// ── Demo Recruiter ──────────────────────────────────────────────
const RECRUITER_ID = 'demo_recruiter_1';

// ── Demo Jobs ───────────────────────────────────────────────────
const JOBS = [
  {
    title: 'Desenvolvedor Front-end Pleno',
    company: 'TechCorp Brasil',
    location: 'São Paulo, SP',
    description:
      'Buscamos um desenvolvedor front-end com experiência em React e TypeScript para atuar no time de produto. Você será responsável por desenvolver e manter interfaces de alta performance que impactam milhões de usuários.',
    requirements: [
      { text: 'React e TypeScript avançados', category: 'skill' },
      { text: '3+ anos de experiência com front-end', category: 'experience' },
      { text: 'Experiência com testes automatizados (Jest, Cypress)', category: 'skill' },
      { text: 'Conhecimento em CI/CD e Git', category: 'skill' },
      { text: 'Inglês para leitura de documentação', category: 'soft_skill' },
    ],
    salaryRange: 'R$ 8k - 12k',
    jobType: 'CLT',
    modality: 'Hybrid',
  },
  {
    title: 'Analista de Marketing Digital',
    company: 'GrowthLab',
    location: 'Remoto',
    description:
      'Procuramos um analista de marketing digital para gerenciar campanhas de performance, SEO e conteúdo. Você trabalhará diretamente com o time de growth e reportará ao CMO.',
    requirements: [
      { text: 'Google Ads e Meta Ads', category: 'skill' },
      { text: 'SEO e Marketing de Conteúdo', category: 'skill' },
      { text: 'Google Analytics e Data Studio', category: 'skill' },
      { text: '2+ anos em marketing digital', category: 'experience' },
    ],
    salaryRange: 'R$ 5k - 7k',
    jobType: 'PJ',
    modality: 'Remote',
  },
  {
    title: 'Gerente de Projetos — TI',
    company: 'InnovaTech Solutions',
    location: 'Curitiba, PR',
    description:
      'Gerenciamento de projetos de transformação digital para clientes enterprise. Necessária experiência com metodologias ágeis e liderança de squads multifuncionais.',
    requirements: [
      { text: 'Scrum e Kanban avançados', category: 'skill' },
      { text: 'Certificação PMP ou CSPO (diferencial)', category: 'education' },
      { text: '5+ anos gerenciando projetos de TI', category: 'experience' },
      { text: 'Experiência com clientes enterprise', category: 'experience' },
      { text: 'Liderança e comunicação excelente', category: 'soft_skill' },
    ],
    salaryRange: 'R$ 12k - 16k',
    jobType: 'CLT',
    modality: 'Hybrid',
  },
  {
    title: 'Designer UX/UI Sênior',
    company: 'Nubank',
    location: 'São Paulo, SP',
    description:
      'Estamos em busca de um designer UX/UI sênior para nosso time de experiência do cliente. Você será responsável por criar jornadas digitais intuitivas e acessíveis para milhões de usuários.',
    requirements: [
      { text: 'Figma avançado', category: 'skill' },
      { text: 'Pesquisa com usuários e testes de usabilidade', category: 'skill' },
      { text: 'Design System e component libraries', category: 'skill' },
      { text: '5+ anos em UX/UI', category: 'experience' },
      { text: 'Portfólio com casos reais', category: 'education' },
    ],
    salaryRange: 'R$ 15k - 20k',
    jobType: 'CLT',
    modality: 'Hybrid',
  },
  {
    title: 'Analista de Dados Jr.',
    company: 'LogiFast',
    location: 'Remoto',
    description:
      'Oportunidade para quem está começando em dados! Você vai trabalhar com SQL, Python e visualização de dados para apoiar decisões de negócio na área de logística.',
    requirements: [
      { text: 'SQL intermediário', category: 'skill' },
      { text: 'Python (pandas, numpy)', category: 'skill' },
      { text: 'Power BI ou Tableau', category: 'skill' },
      { text: 'Vontade de aprender e crescer', category: 'soft_skill' },
    ],
    salaryRange: 'R$ 3k - 5k',
    jobType: 'CLT',
    modality: 'Remote',
  },
];

const createdJobIds: string[] = [];

for (const job of JOBS) {
  const id = randomUUID();
  try {
    dual.createJob.run(
      id,
      RECRUITER_ID,
      job.title,
      job.company,
      job.location,
      job.description,
      JSON.stringify(job.requirements),
      job.salaryRange,
      job.jobType,
      job.modality
    );

    // Insert insights (data moat)
    for (let i = 0; i < job.requirements.length; i++) {
      try {
        dual.upsertInsight.run(
          randomUUID(),
          id,
          job.requirements[i].text,
          job.requirements[i].category
        );
      } catch {
        /* duplicate */
      }
    }

    createdJobIds.push(id);
    console.log(`  ✅ Job: ${job.title} @ ${job.company}`);
  } catch {
    console.log(`  ⚠️  Job already exists: ${job.title}`);
    createdJobIds.push(id);
  }
}

// ── Demo Candidates ─────────────────────────────────────────────
const CANDIDATES = [
  {
    name: 'Francisco Taveira',
    email: 'francisco@email.com',
    phone: '+55 49 99999-0001',
    location: 'São Paulo, SP',
    targetRole: 'Analista de Marketing',
    seniority: 'Pleno',
    cvText:
      'Francisco Taveira — Analista de Marketing com 4 anos de experiência em campanhas digitais, SEO e Google Ads. Trabalhou na TechSol e LogiFast. Graduado em Marketing pela USP. Conhecimentos em Data Studio, Meta Ads e copywriting.',
    score: 72,
  },
  {
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '+55 11 99999-0002',
    location: 'São Paulo, SP',
    targetRole: 'Desenvolvedora Front-end',
    seniority: 'Pleno',
    cvText:
      'Ana Silva — Desenvolvedora Front-end com 5 anos de experiência em React, TypeScript e Next.js. Atuou na StartupXYZ como tech lead de squad. Graduanda em Ciência da Computação. Experiência com Jest, Cypress, CI/CD, e design systems.',
    score: 88,
  },
  {
    name: 'Carlos Mendes',
    email: 'carlos.m@email.com',
    phone: '+55 21 99999-0003',
    location: 'Rio de Janeiro, RJ',
    targetRole: 'Gerente de Projetos',
    seniority: 'Sênior',
    cvText:
      'Carlos Mendes — Gerente de Projetos de TI com 8 anos de experiência. PMP e CSPO certificado. Liderou squads de até 15 pessoas em projetos de transformação digital para Itaú e Bradesco. Scrum, Kanban, Jira avançados.',
    score: 92,
  },
  {
    name: 'Mariana Costa',
    email: 'mariana.c@email.com',
    phone: '+55 31 99999-0004',
    location: 'Belo Horizonte, MG',
    targetRole: 'Designer UX/UI',
    seniority: 'Sênior',
    cvText:
      'Mariana Costa — Designer UX/UI com 6 anos de experiência. Figma, pesquisa com usuários, testes de usabilidade, design systems. Trabalhou no Nubank e iFood. Portfólio com +30 casos reais. Mestrado em Design Interação.',
    score: 95,
  },
  {
    name: 'Pedro Santos',
    email: 'pedro.s@email.com',
    phone: '+55 41 99999-0005',
    location: 'Curitiba, PR',
    targetRole: 'Analista de Dados',
    seniority: 'Júnior',
    cvText:
      'Pedro Santos — Analista de Dados Jr. com 1 ano de experiência. SQL, Python (pandas), Power BI. Estagiário na LogiFast onde criou dashboards de logística. Graduando em Estatística na UFPR. Certificado Google Data Analytics.',
    score: 55,
  },
  {
    name: 'Julia Oliveira',
    email: 'julia.o@email.com',
    phone: '+55 11 99999-0006',
    location: 'São Paulo, SP',
    targetRole: 'Desenvolvedora Front-end',
    seniority: 'Júnior',
    cvText:
      'Julia Oliveira — Desenvolvedora Front-end Jr. com 2 anos. React, JavaScript, HTML, CSS. Bootcamp pela Trybe. Freelancer em 5 projetos. Portfólio no GitHub com 20+ repositórios.',
    score: 48,
  },
  {
    name: 'Roberto Almeida',
    email: 'roberto.a@email.com',
    phone: '+55 61 99999-0007',
    location: 'Brasília, DF',
    targetRole: 'Gerente de Projetos',
    seniority: 'Pleno',
    cvText:
      'Roberto Almeida — Gerente de Projetos com 4 anos. CSPO, Scrum Master. Gerenciou projetos de e-commerce para Magazine Luiza. Experiência com Jira, Confluence, stakeholders management.',
    score: 78,
  },
  {
    name: 'Camila Ferreira',
    email: 'camila.f@email.com',
    phone: '+55 51 99999-0008',
    location: 'Porto Alegre, RS',
    targetRole: 'Analista de Marketing',
    seniority: 'Júnior',
    cvText:
      'Camila Ferreira — Analista de Marketing Jr. com 1 ano. Google Ads certificado, Meta Ads, criação de conteúdo. Estagiária na AgênciaBoom. Graduanda em Publicidade e Propaganda.',
    score: 42,
  },
];

// Create candidate profiles
for (const c of CANDIDATES) {
  const profileId = `demo_${randomUUID()}`;
  try {
    dual.createProfile.run(
      profileId,
      profileId, // user_id (same as profile for demo)
      c.name,
      c.email,
      c.phone,
      c.location,
      c.targetRole,
      c.seniority
    );
    dual.setCV.run(
      c.cvText,
      c.score,
      JSON.stringify({
        clarity: c.score > 60,
        evidence: c.score > 70,
        focus: c.score > 50,
        freshness: c.score > 40,
      }),
      c.score > 70
        ? 'Perfil técnico consistente com resultados mensuráveis.'
        : 'Perfil em desenvolvimento. Recomenda-se adicionar mais métricas e projetos.',
      JSON.stringify([]),
      profileId
    );
    console.log(`  👤 Candidate: ${c.name} (score: ${c.score})`);
  } catch {
    console.log(`  ⚠️  Candidate already exists: ${c.name}`);
  }
}

// Create applications (candidates applying to relevant jobs)
const APPLICATIONS = [
  { candidateIdx: 1, jobIdx: 0, score: 85 }, // Ana → Front-end Dev
  { candidateIdx: 5, jobIdx: 0, score: 45 }, // Julia → Front-end Dev
  { candidateIdx: 0, jobIdx: 1, score: 78 }, // Francisco → Marketing
  { candidateIdx: 7, jobIdx: 1, score: 52 }, // Camila → Marketing
  { candidateIdx: 2, jobIdx: 2, score: 90 }, // Carlos → Gerente de Projetos
  { candidateIdx: 6, jobIdx: 2, score: 72 }, // Roberto → Gerente de Projetos
  { candidateIdx: 3, jobIdx: 3, score: 95 }, // Mariana → UX/UI
  { candidateIdx: 4, jobIdx: 4, score: 60 }, // Pedro → Analista de Dados
];

for (const app of APPLICATIONS) {
  try {
    const candidateProfileId = `demo_profile_${app.candidateIdx}`;
    const jobId = createdJobIds[app.jobIdx];
    if (!jobId) continue;

    const appId = randomUUID();
    dual.createApplication.run(
      appId,
      candidateProfileId,
      jobId,
      null, // cv_version_id
      app.score
    );
    dual.incrementApplications.run(jobId);
  } catch {
    // already applied
  }
}

console.log(`\n🎉 Demo data seeded!`);
console.log(`   Jobs: ${JOBS.length}`);
console.log(`   Candidates: ${CANDIDATES.length}`);
console.log(`   Applications: ${APPLICATIONS.length}`);
console.log(`\n🔑 Demo credentials:`);
console.log(`   Recruiter → userId: demo_recruiter_1, role: recruiter`);
console.log(`   Candidate → userId: any, role: candidate`);
