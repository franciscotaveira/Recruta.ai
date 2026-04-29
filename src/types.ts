export type CandidateStatus = 'new' | 'processing' | 'completed' | 'error';
export type JobStatus = 'active' | 'paused' | 'closed';
export type ApplicationStatus =
  | 'new'
  | 'screening'
  | 'interview'
  | 'shortlist'
  | 'offer'
  | 'rejected';

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
  type: 'active_invite' | 'application';
  status: 'completed' | 'pending';
}

export interface Candidate {
  id: string;
  name: string;
  // Private fields (hidden until activation)
  phone?: string;
  email?: string;
  linkedin?: string;

  location?: string;
  status: CandidateStatus;
  score: number; // SCPD
  date: string;
  plan: 'free' | 'starter' | 'pro';

  // Recruiter specific fields
  isActivated: boolean; // TRUE if recruiter paid 1 credit to view contact/invite
  activationDate?: string;

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
    clarity: boolean;
    evidence: boolean;
    focus: boolean;
    freshness: boolean;
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
  pipeline?: {
    new: number;
    screening: number;
    interview: number;
    shortlist: number;
    offer: number;
    rejected: number;
  };
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  appliedDate: string;
  lastUpdate: string;
  lastAction?: string;
  candidateName: string; // Denormalized for easy access
  matchScore: number;
}

// --- BILLING & CREDITS ---
export interface CreditTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit'; // credit = recharge, debit = usage
  status: 'completed' | 'failed' | 'pending';
  relatedCandidateId?: string;
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
  autoRechargeThreshold: number;
  autoRechargeAmount: number;
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
  wallet: RecruiterWallet;
}
