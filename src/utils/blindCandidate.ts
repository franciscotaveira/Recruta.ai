import type { WhatsAppBlindCandidate } from '../contracts/api';

export function resolveBlindCandidateDisplay(input: {
  candidateName?: string | null;
  candidatePhone?: string | null;
  blindCandidate?: WhatsAppBlindCandidate | null;
  fallbackLabel?: string;
}) {
  const fallbackLabel = String(input.fallbackLabel || 'Candidato');
  const label = input.blindCandidate?.enabled
    ? input.blindCandidate.label
    : String(input.candidateName || '').trim() || fallbackLabel;
  const phone = input.blindCandidate?.enabled
    ? input.blindCandidate.maskedPhone || 'telefone oculto'
    : String(input.candidatePhone || '').trim() || null;

  return {
    label,
    phone,
    initial: label.charAt(0).toUpperCase() || fallbackLabel.charAt(0).toUpperCase(),
    blindEnabled: Boolean(input.blindCandidate?.enabled),
  };
}
