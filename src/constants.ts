import { Candidate, Job, Application, RecruiterStats, CreditPackage } from './types';

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
  isActivated: true,
  currentCycle: {
    id: 'c1',
    status: 'active',
    startDate: '12/03/2026',
    targetRole: 'Analista de Marketing',
  },
  diagnosis:
    'Seu perfil técnico é robusto, mas sua comunicação escrita subestima seus resultados de 2024. A IA detectou padrões de liderança que não constam no seu PDF original.',
  scpdBreakdown: {
    clarity: true,
    evidence: false, // Warning
    focus: true,
    freshness: false, // Warning
  },
  attentionPoints: [
    'Adicionar métricas de ROI no projeto da TechSol.',
    'Sua experiência de 2023 precisa de palavras-chave mais atuais.',
    'Otimize seu resumo para passar em filtros ATS externos.',
  ],
  pastCycles: [
    {
      id: 'c0',
      status: 'closed',
      startDate: '10/01/2025',
      targetRole: 'Assistente Administrativo',
      result: 'closed_without_hire',
    },
  ],
  interviews: [
    { id: 'i1', company: 'TechSol', date: '20/03/2026', type: 'active_invite', status: 'pending' },
    { id: 'i2', company: 'LogiFast', date: '15/03/2026', type: 'application', status: 'completed' },
  ],
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'pkg_starter', name: 'Pack Decisão Rápida', credits: 50, price: 199, bestValue: false },
  { id: 'pkg_growth', name: 'Pack Processo Full', credits: 200, price: 699, bestValue: true },
  { id: 'pkg_scale', name: 'Pack Enterprise', credits: 1000, price: 2990, bestValue: false },
];

export const MOCK_RECRUITER_STATS: RecruiterStats = {
  activeJobs: 3,
  candidatesPipeline: 47,
  invites: {
    sent: 150,
    accepted: 45,
    ignored: 105,
  },
  wallet: {
    balance: 124,
    autoRecharge: true,
    autoRechargeThreshold: 20,
    autoRechargeAmount: 200,
    savedCard: {
      last4: '4242',
      brand: 'Mastercard',
    },
    transactions: [
      {
        id: 'tx_1',
        date: '15/03/2026',
        description: 'Compra de Créditos (200 cr)',
        amount: 200,
        type: 'credit',
        status: 'completed',
      },
      {
        id: 'tx_2',
        date: '16/03/2026',
        description: 'Diagnóstico Concluído - Vaga Mkt',
        amount: -15,
        type: 'debit',
        status: 'completed',
      },
      {
        id: 'tx_3',
        date: '17/03/2026',
        description: 'Reativação Base Legada (50 cvs)',
        amount: -50,
        type: 'debit',
        status: 'completed',
      },
      {
        id: 'tx_4',
        date: '18/03/2026',
        description: 'Triagem WhatsApp - João Silva',
        amount: -1,
        type: 'debit',
        status: 'completed',
      },
    ],
  },
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
    isActivated: false,
    extractedData: {
      role: 'Gerente de Vendas',
      seniority: 'Sênior',
      topSkills: ['Liderança', 'CRM', 'Negociação B2B'],
    },
    scpdBreakdown: { clarity: true, evidence: true, focus: true, freshness: true },
  },
  {
    id: '2',
    name: 'Carlos Mendes',
    phone: '+55 21 98888-5678',
    status: 'processing',
    score: 0,
    date: '2026-01-21',
    plan: 'free',
    isActivated: false,
  },
  {
    id: '3',
    name: 'Mariana Costa',
    phone: '+55 31 97777-4321',
    status: 'completed',
    score: 92,
    date: '2026-01-20',
    plan: 'pro',
    isActivated: true,
    extractedData: {
      role: 'Desenvolvedora Fullstack',
      seniority: 'Pleno',
      topSkills: ['React', 'Node.js', 'PostgreSQL'],
    },
    scpdBreakdown: { clarity: true, evidence: true, focus: true, freshness: true },
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
    recommendationReason: 'Compatível com seu diagnóstico. Cliente usa Recruta.AI para triagem.',
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
    recommendationReason: 'Match comportamental alto para liderança ágil.',
  },
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: '1',
    jobId: '1',
    candidateId: 'user-1',
    candidateName: 'Francisco Taveira',
    matchScore: 95,
    jobTitle: 'Analista de Marketing Pleno',
    company: 'TechCorp Brasil',
    status: 'interview',
    appliedDate: '2026-03-15',
    lastUpdate: '2026-03-17',
    lastAction: 'Entrevista com Gestor agendada',
  },
  {
    id: '2',
    jobId: '2',
    candidateId: 'user-1',
    candidateName: 'Francisco Taveira',
    matchScore: 88,
    jobTitle: 'Coordenador de Projetos',
    company: 'Startup XYZ',
    status: 'screening',
    appliedDate: '2026-03-18',
    lastUpdate: '2026-03-21',
    lastAction: 'Aguardando revisão de IA',
  },
];

export const CHART_DATA = [];
