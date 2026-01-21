import { Candidate, Job, Application, RecruiterStats } from './types';

// MOCK FOR LOGGED IN CANDIDATE (Francisco)
export const CURRENT_USER_CANDIDATE: Candidate = {
  id: 'user-1',
  name: 'Francisco Taveira',
  phone: '+55 49 99999-9999',
  email: 'francisco@email.com',
  status: 'completed',
  score: 72, // SCPD
  date: '2026-03-12',
  plan: 'starter',
  currentCycle: {
    id: 'c1',
    status: 'active',
    startDate: '12/03/2026',
    targetRole: 'Analista de Marketing'
  },
  diagnosis: "Seu perfil é mais forte em Gestão de Projetos, com experiência prática em metodologias ágeis. Há sinais claros de atuação em liderança de times pequenos, porém falta evidência numérica de resultados em projetos anteriores a 2024.",
  scpdBreakdown: {
    clarity: true,
    evidence: false, // Warning
    focus: true,
    freshness: false // Warning
  },
  attentionPoints: [
    "Falta detalhamento de resultados em projetos recentes.",
    "Atualize suas certificações de 2023 para cá."
  ],
  pastCycles: [
    { id: 'c0', status: 'closed', startDate: '10/01/2025', targetRole: 'Assistente Administrativo', result: 'closed_without_hire' }
  ],
  interviews: [
    { id: 'i1', company: 'TechSol', date: '20/03/2026', type: 'active_invite', status: 'pending' },
    { id: 'i2', company: 'LogiFast', date: '15/03/2026', type: 'application', status: 'completed' }
  ]
};

export const MOCK_RECRUITER_STATS: RecruiterStats = {
  activeJobs: 3,
  candidatesPipeline: 47,
  invites: {
    sent: 150,
    accepted: 45,
    ignored: 105
  }
};

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Ana Silva',
    phone: '+55 11 99999-1234',
    email: 'ana.silva@email.com',
    location: 'São Paulo, SP',
    status: 'completed',
    score: 85,
    date: '2026-01-21',
    plan: 'starter',
    extractedData: {
      role: 'Gerente de Vendas',
      seniority: 'Sênior',
      topSkills: ['Liderança', 'CRM', 'Negociação B2B']
    },
    scpdBreakdown: { clarity: true, evidence: true, focus: true, freshness: true }
  },
  {
    id: '2',
    name: 'Carlos Mendes',
    phone: '+55 21 98888-5678',
    status: 'processing',
    score: 0,
    date: '2026-01-21',
    plan: 'free',
  },
  {
    id: '3',
    name: 'Mariana Costa',
    phone: '+55 31 97777-4321',
    status: 'completed',
    score: 92,
    date: '2026-01-20',
    plan: 'pro',
    extractedData: {
      role: 'Desenvolvedora Fullstack',
      seniority: 'Pleno',
      topSkills: ['React', 'Node.js', 'PostgreSQL']
    },
    scpdBreakdown: { clarity: true, evidence: true, focus: true, freshness: true }
  },
];

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Analista de Marketing Pleno',
    company: 'TechCorp Brasil',
    location: 'São Paulo, SP',
    salaryRange: 'R$ 5k - 7k',
    type: 'CLT',
    modality: 'Hybrid',
    matchScore: 98,
    status: 'active',
    applicantsCount: 23,
    postedDate: '2026-03-15',
    skills: ['Marketing Digital', 'Growth', 'Analytics'],
    recommendationReason: "Compatível com seu perfil atual de Analista."
  },
  {
    id: '2',
    title: 'Coordenador de Projetos',
    company: 'Startup XYZ',
    location: 'Remoto',
    salaryRange: 'R$ 8k - 10k',
    type: 'PJ',
    modality: 'Remote',
    matchScore: 85,
    status: 'active',
    applicantsCount: 18,
    postedDate: '2026-03-18',
    skills: ['Scrum', 'Leadership', 'Jira'],
    recommendationReason: "Boa oportunidade para transição de carreira."
  }
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: '1',
    jobId: '1',
    jobTitle: 'Analista de Marketing Pleno',
    company: 'TechCorp Brasil',
    status: 'interview',
    appliedDate: '2026-03-15',
    lastUpdate: '2026-03-17',
  },
  {
    id: '2',
    jobId: '2',
    jobTitle: 'Coordenador de Projetos',
    company: 'Startup XYZ',
    status: 'analysis',
    appliedDate: '2026-03-18',
    lastUpdate: '2026-03-21',
  }
];

export const CHART_DATA = [];