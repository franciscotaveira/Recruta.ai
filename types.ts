import React from 'react';

export type CandidateStatus = 'new' | 'processing' | 'completed' | 'error';
export type JobStatus = 'active' | 'paused' | 'closed';
export type ApplicationStatus = 'analysis' | 'interview' | 'closed';

// --- CANDIDATE TYPES ---
export interface Cycle {
  id: string;
  status: 'active' | 'closed';
  startDate: string;
  targetRole: string;
  goal?: string;
  result?: 'hired' | 'closed_without_hire';
}

export interface Interview {
  id: string;
  company: string;
  date: string;
  type: 'active_invite' | 'application'; // Convocação ativa vs Candidatura própria
  status: 'completed' | 'pending';
}

export interface Candidate {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  status: CandidateStatus;
  score: number; // SCPD
  date: string;
  plan: 'free' | 'starter' | 'pro';
  currentCycle?: Cycle;
  pastCycles?: Cycle[];
  interviews?: Interview[];
  answers?: Record<string, string>;
  extractedData?: {
    role: string;
    seniority: string;
    topSkills: string[];
  };
  diagnosis?: string;
  scpdBreakdown?: {
    clarity: boolean; // Clareza de trajetória
    evidence: boolean; // Evidência de resultados
    focus: boolean; // Foco em cargo-alvo
    freshness: boolean; // Atualização recente
  };
  attentionPoints?: string[];
}

// --- RECRUITER TYPES ---
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  type: 'CLT' | 'PJ' | 'Hybrid';
  modality: 'Remote' | 'Hybrid' | 'On-site';
  matchScore: number;
  status: JobStatus;
  applicantsCount: number;
  postedDate: string;
  skills: string[];
  recommendationReason?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  appliedDate: string;
  lastUpdate: string;
  lastAction?: string;
}

// --- BILLING & CREDITS ---
export interface CreditTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit'; // credit = compra, debit = uso
  status: 'completed' | 'failed' | 'pending';
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bestValue?: boolean;
}

export interface RecruiterWallet {
  balance: number;
  autoRecharge: boolean;
  autoRechargeThreshold: number; // Recarregar quando chegar em X
  autoRechargeAmount: number; // Recarregar pacote ID X
  savedCard?: {
    last4: string;
    brand: string;
  };
  transactions: CreditTransaction[];
}

export interface RecruiterStats {
  activeJobs: number;
  candidatesPipeline: number;
  invites: {
    sent: number;
    accepted: number;
    ignored: number;
  };
  wallet: RecruiterWallet; // Linked wallet info
}

export interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  colorClass?: string;
}