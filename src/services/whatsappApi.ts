import type { RecruiterReviewQueueItem, WhatsAppSession } from '../contracts/api';
import {
  fetchWhatsAppAudioBlob,
  bulkWhatsAppInvite,
  getRecruiterReviewQueue as fetchRecruiterReviewQueue,
  getRecruiterWhatsAppSessions,
  getSessionAudioFiles,
  getWhatsAppSessions,
  sendWhatsAppInvite,
  updateWhatsAppSession,
} from './api';

export type { WhatsAppSession };

export async function inviteCandidate(params: {
  candidatePhone?: string;
  candidateName?: string;
  profileId?: string;
  jobId: string;
  jobTitle?: string;
  companyName?: string;
  recruiterId?: string;
}): Promise<{ sessionId: string; status: string }> {
  return sendWhatsAppInvite({
    candidatePhone: params.candidatePhone,
    candidateName: params.candidateName,
    profileId: params.profileId,
    jobId: params.jobId,
    jobTitle: params.jobTitle,
    companyName: params.companyName,
  });
}

export async function bulkInvite(params: {
  candidates: Array<{ profileId?: string; phone?: string; name?: string }>;
  jobId: string;
  jobTitle?: string;
  companyName?: string;
  recruiterId?: string;
}): Promise<{
  total: number;
  results: Array<{
    profile_id: string | null;
    name: string | null;
    phone: string | null;
    sessionId?: string;
    error?: string;
    blind_candidate?: {
      enabled: boolean;
      label: string;
      maskedName: string | null;
      maskedPhone: string | null;
    };
  }>;
}> {
  return bulkWhatsAppInvite({
    candidates: params.candidates,
    jobId: params.jobId,
    jobTitle: params.jobTitle,
    companyName: params.companyName,
  });
}

export async function getSessionsByJob(jobId: string): Promise<WhatsAppSession[]> {
  const result = await getWhatsAppSessions(jobId);
  return result.data;
}

export async function getSessionDetail(sessionId: string): Promise<WhatsAppSession> {
  // Current backend does not provide detail endpoint; keep compatibility by selecting from recruiter sessions.
  const result = await getRecruiterWhatsAppSessions();
  const found = result.data.find((s) => s.id === sessionId);
  if (!found) throw new Error('Sessão não encontrada');
  return found;
}

export async function getRecruiterSessions(): Promise<WhatsAppSession[]> {
  const result = await getRecruiterWhatsAppSessions();
  return result.data;
}

export async function getReviewQueue(): Promise<RecruiterReviewQueueItem[]> {
  const result = await fetchRecruiterReviewQueue();
  return result.data;
}

export async function getSessionAudios(sessionId: string) {
  return getSessionAudioFiles(sessionId);
}

export async function getAudioBlob(audioId: string) {
  return fetchWhatsAppAudioBlob(audioId);
}

export async function updateSessionStatus(
  sessionId: string,
  data: {
    recommendation?: 'entrevista' | 'rejeitar' | 'mais_info';
    state?: string;
  }
) {
  return updateWhatsAppSession(sessionId, data);
}
