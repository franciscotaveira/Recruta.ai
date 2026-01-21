import React from 'react';

export type CandidateStatus = 'new' | 'processing' | 'completed' | 'error';
export type JobStatus = 'active' | 'paused' | 'closed';
export type ApplicationStatus = 'analysis' | 'interview' | 'closed';

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
}

export interface RecruiterStats {
  activeJobs: number;
  candidatesPipeline: number;
  invites: {
    sent: number;
    accepted: number;
    ignored: number;
  }
}

export interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  colorClass?: string;
}