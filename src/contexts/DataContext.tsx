import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Candidate, Job } from '../types';
import type { CVAnalysisResult, JobMatchResult } from '../services/geminiService';

export interface Analysis {
  id: string;
  candidateId: string;
  jobId?: string;
  result: CVAnalysisResult | JobMatchResult;
  createdAt: Date;
}

export interface DataContextType {
  candidates: Candidate[];
  jobs: Job[];
  analyses: Analysis[];
  addCandidate: (candidate: Candidate) => void;
  addJob: (job: Job) => void;
  addAnalysis: (analysis: Analysis) => void;
  getCandidateById: (id: string) => Candidate | undefined;
  getJobById: (id: string) => Job | undefined;
  deleteCandidate: (id: string) => void;
  deleteJob: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  const addCandidate = (candidate: Candidate) => {
    setCandidates((prev) => [...prev, candidate]);
  };

  const addJob = (job: Job) => {
    setJobs((prev) => [...prev, job]);
  };

  const addAnalysis = (analysis: Analysis) => {
    setAnalyses((prev) => [...prev, analysis]);
  };

  const getCandidateById = (id: string) => {
    return candidates.find((c) => c.id === id);
  };

  const getJobById = (id: string) => {
    return jobs.find((j) => j.id === id);
  };

  const deleteCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const value: DataContextType = {
    candidates,
    jobs,
    analyses,
    addCandidate,
    addJob,
    addAnalysis,
    getCandidateById,
    getJobById,
    deleteCandidate,
    deleteJob,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
