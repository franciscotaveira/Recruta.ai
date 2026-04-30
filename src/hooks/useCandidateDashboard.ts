import { useCallback, useEffect, useState } from 'react';
import {
  analyzeCV,
  applyToJob,
  createDiagnosticPayment,
  getCandidateProfile,
  getPublicJobs,
} from '../services/api';
import type {
  CVAnalysisResult,
  CandidateProfile,
  PaymentCustomer,
  PublicJob,
} from '../contracts/api';

export function useCandidateDashboard() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [analysis, setAnalysis] = useState<CVAnalysisResult | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, jobsRes] = await Promise.all([getCandidateProfile(), getPublicJobs()]);
      setProfile(profileRes);
      setJobs(jobsRes.data);
      if (profileRes?.scp_score > 0) {
        setAnalysis({
          score: profileRes.scp_score,
          breakdown: profileRes.scp_breakdown || { clarity: 50, evidence: 50, focus: 50, freshness: 50 },
          reasoning: profileRes.diagnosis,
          suggestions: profileRes.ai_suggestions || [],
          attention_points: profileRes.attention_points || [],
          fallback: true,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar painel do candidato');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const runAnalyzeCV = useCallback(
    async (cvText: string) => {
      const result = await analyzeCV(cvText);
      setAnalysis(result.data || result.fallback);
      await refresh();
      return result;
    },
    [refresh]
  );

  const runApply = useCallback(async (jobId: string) => {
    await applyToJob({ jobId });
    setAppliedJobs((prev) => new Set(prev).add(jobId));
  }, []);

  const runDiagnosticCheckout = useCallback(async (customer?: PaymentCustomer) => {
    return createDiagnosticPayment(customer);
  }, []);

  return {
    profile,
    jobs,
    analysis,
    appliedJobs,
    loading,
    error,
    refresh,
    runAnalyzeCV,
    runApply,
    runDiagnosticCheckout,
  };
}
