import { Candidate } from './types';

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Ana Silva',
    phone: '+55 11 99999-1234',
    status: 'completed',
    score: 85,
    date: '2026-01-21',
    plan: 'starter',
    extractedData: {
      role: 'Gerente de Vendas',
      seniority: 'Sênior',
      topSkills: ['Liderança', 'CRM', 'Negociação B2B']
    },
    diagnosis: "Perfil forte para liderança comercial. Comunicação clara, mas currículo original estava muito extenso."
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
    diagnosis: "Excelente perfil técnico. Otimização focou em quantificar resultados de performance."
  },
  {
    id: '4',
    name: 'João Pereira',
    phone: '+55 41 96666-8765',
    status: 'error',
    score: 45,
    date: '2026-01-20',
    plan: 'free',
  },
  {
    id: '5',
    name: 'Fernanda Oliveira',
    phone: '+55 51 95555-0987',
    status: 'completed',
    score: 78,
    date: '2026-01-19',
    plan: 'starter',
    extractedData: {
      role: 'Analista de RH',
      seniority: 'Júnior',
      topSkills: ['Recrutamento', 'Triagem', 'LinkedIn Recruiter']
    },
    diagnosis: "Boas experiências iniciais. Faltava destacar projetos acadêmicos relevantes."
  },
];

export const CHART_DATA = [
  { name: '15/01', diagnoses: 12 },
  { name: '16/01', diagnoses: 19 },
  { name: '17/01', diagnoses: 15 },
  { name: '18/01', diagnoses: 25 },
  { name: '19/01', diagnoses: 32 },
  { name: '20/01', diagnoses: 45 },
  { name: '21/01', diagnoses: 58 },
];
