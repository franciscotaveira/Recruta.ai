import React from 'react';

export type CandidateStatus = 'new' | 'processing' | 'completed' | 'error';

export interface Candidate {
  id: string;
  name: string;
  phone: string;
  status: CandidateStatus;
  score: number;
  date: string;
  plan: 'free' | 'starter' | 'pro';
  answers?: Record<string, string>;
  extractedData?: {
    role: string;
    seniority: string;
    topSkills: string[];
  };
  diagnosis?: string;
}

export interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}