/**
 * Auto-Seed — runs on startup if database has no jobs.
 */

import { randomUUID } from 'crypto';
import { dual } from './storage/db.js';

let seeded = false;

export async function shouldAutoSeed(): Promise<boolean> {
  if (seeded) return false;
  const jobs = await dual.getActiveJobs();
  return jobs.length === 0;
}

export async function autoSeed() {
  if (!(await shouldAutoSeed())) return;

  seeded = true;
  const recruiterId = 'demo_recruiter_1';

  console.log('\n🌱 Auto-seeding minimal demo data...');

  const jobs = [
    {
      title: 'Desenvolvedor Front-end Pleno',
      company: 'TechCorp Brasil',
      location: 'São Paulo, SP',
      description: 'React + TypeScript + testes automatizados.',
      requirements: [
        { text: 'React e TypeScript avançados', category: 'skill' },
        { text: '3+ anos com front-end', category: 'experience' },
      ],
      salaryRange: 'R$ 8k - 12k',
      jobType: 'CLT',
      modality: 'Hybrid',
    },
    {
      title: 'Analista de Marketing Digital',
      company: 'GrowthLab',
      location: 'Remoto',
      description: 'Gestão de Ads, SEO e análise de performance.',
      requirements: [
        { text: 'Google Ads e Meta Ads', category: 'skill' },
        { text: 'SEO e conteúdo', category: 'skill' },
      ],
      salaryRange: 'R$ 5k - 7k',
      jobType: 'PJ',
      modality: 'Remote',
    },
  ];

  for (const job of jobs) {
    const id = randomUUID();
    await dual.createJob(
      id,
      recruiterId,
      job.title,
      job.company,
      job.location,
      job.description,
      JSON.stringify(job.requirements),
      job.salaryRange,
      job.jobType,
      job.modality
    );

    for (const req of job.requirements) {
      await dual.upsertInsight(randomUUID(), id, req.text, req.category);
    }
  }

  await dual.initWallet(recruiterId);
  await dual.addCredits(200, 200, recruiterId);

  console.log('✅ Auto-seed complete.');
}
