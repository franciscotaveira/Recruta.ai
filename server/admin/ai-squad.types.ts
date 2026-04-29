export type AISquadModelPolicy = 'auto' | 'gemini' | 'openai' | 'openrouter' | 'fallback_only';

export type AISpecialistArea =
  | 'attraction'
  | 'triage'
  | 'interview'
  | 'compliance'
  | 'candidate_experience'
  | 'quality'
  | 'revenue'
  | 'learning';

export interface AISpecialist {
  id: string;
  name: string;
  area: AISpecialistArea;
  objective: string;
  keyMetric: string;
  enabled: boolean;
  humanReviewRequired: boolean;
  modelPolicy: AISquadModelPolicy;
  slaMinutes: number;
  owner: string;
  updatedAt: string;
}

export interface AISquadGovernance {
  consentRequired: boolean;
  blindScreeningEnabled: boolean;
  humanInTheLoopRequired: boolean;
  biasAuditCadenceDays: number;
  maxParallelSessions: number;
}

export interface AISquadSettings {
  experts: AISpecialist[];
  governance: AISquadGovernance;
  updatedAt: string;
  updatedBy: string | null;
}

export interface AISquadSummary {
  totalExperts: number;
  enabledExperts: number;
  coverage: Record<AISpecialistArea, number>;
  governanceScore: number;
  governance?: AISquadGovernance;
}
