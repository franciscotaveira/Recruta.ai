import { Candidate, RecruiterWallet, Job, Application, CreditTransaction } from '../types';
import { MOCK_CANDIDATES, MOCK_JOBS, MOCK_RECRUITER_STATS, MOCK_APPLICATIONS } from '../constants';

// Keys for LocalStorage
const STORAGE_KEYS = {
  CANDIDATES: 'recruta_candidates',
  JOBS: 'recruta_jobs',
  WALLET: 'recruta_wallet',
  APPLICATIONS: 'recruta_applications'
};

// --- HELPER: Initialize Data if empty ---
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.CANDIDATES)) {
    // Mock candidates already have isActivated in constants.ts
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(MOCK_CANDIDATES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(MOCK_JOBS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WALLET)) {
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(MOCK_RECRUITER_STATS.wallet));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(MOCK_APPLICATIONS));
  }
};

// Call init immediately
initializeData();

// --- SERVICES ---

export const CandidateService = {
  getAll: (): Candidate[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CANDIDATES) || '[]');
  },
  
  getById: (id: string): Candidate | undefined => {
    const candidates = CandidateService.getAll();
    return candidates.find(c => c.id === id);
  },

  // ACTIVATE CANDIDATE (Consumes Credit Logic is in CreditService, this just updates the flag)
  activateCandidate: (id: string): boolean => {
    const candidates = CandidateService.getAll();
    const index = candidates.findIndex(c => c.id === id);
    if (index === -1) return false;

    candidates[index].isActivated = true;
    candidates[index].activationDate = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
    return true;
  },

  // MOCK: Add Batch Candidates from Upload
  addBatchCandidates: (count: number, jobTitle: string): void => {
    const candidates = CandidateService.getAll();
    const newCandidates: Candidate[] = Array.from({ length: count }).map((_, i) => ({
      id: `batch_${Date.now()}_${i}`,
      name: `Candidato Importado ${i + 1}`,
      phone: '+55 11 99999-9999',
      email: `candidato${i}@exemplo.com`,
      status: 'processing', // Starts processing immediately upon payment
      score: 0,
      date: new Date().toLocaleDateString('pt-BR'),
      plan: 'pro',
      isActivated: true, // Auto-activated because user paid
      activationDate: new Date().toISOString(),
      extractedData: {
        role: jobTitle,
        seniority: 'Pleno',
        topSkills: ['Skill A', 'Skill B']
      }
    }));
    
    const updated = [...newCandidates, ...candidates];
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(updated));
  }
};

export const JobService = {
  getAll: (): Job[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
  },
  getById: (id: string): Job | undefined => {
    const jobs = JobService.getAll();
    return jobs.find(j => j.id === id);
  }
};

export const CreditService = {
  getWallet: (): RecruiterWallet => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WALLET) || '{}');
  },

  // CORE LOGIC: Consume Credit Single
  consumeCredit: (description: string, relatedCandidateId?: string): boolean => {
    const wallet = CreditService.getWallet();
    
    if (wallet.balance < 1) return false;

    // Deduct
    wallet.balance -= 1;
    
    // Log Transaction
    const newTx: CreditTransaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      description,
      amount: -1,
      type: 'debit',
      status: 'completed',
      relatedCandidateId
    };
    
    wallet.transactions.unshift(newTx);
    
    // Persist
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
    return true;
  },

  // CORE LOGIC: Consume Batch Credits
  consumeBatchCredits: (amount: number, description: string): boolean => {
    const wallet = CreditService.getWallet();
    
    if (wallet.balance < amount) return false;

    // Deduct
    wallet.balance -= amount;
    
    // Log Transaction
    const newTx: CreditTransaction = {
      id: `tx_batch_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      description,
      amount: -amount,
      type: 'debit',
      status: 'completed'
    };
    
    wallet.transactions.unshift(newTx);
    
    // Persist
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
    return true;
  },

  addCredits: (amount: number, description: string) => {
    const wallet = CreditService.getWallet();
    wallet.balance += amount;
    
    const newTx: CreditTransaction = {
        id: `tx_${Date.now()}`,
        date: new Date().toLocaleDateString('pt-BR'),
        description,
        amount: amount,
        type: 'credit',
        status: 'completed',
      };
      
    wallet.transactions.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
    return wallet;
  }
};