import type { BlindCandidateSnapshot } from '../conversation/summary.js';
import { sanitizeForBlindScreening } from '../conversation/governance.js';

function maskCandidateName(name: string | null | undefined): string | null {
  const trimmed = String(name || '').trim();
  if (!trimmed) return null;

  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((part, idx) => {
      if (part.length <= 1) return '*';
      const visible = idx === 0 ? 1 : 0;
      return `${part.slice(0, visible)}${'*'.repeat(Math.max(1, part.length - visible))}`;
    })
    .join(' ');
}

function maskCandidatePhone(phone: string | null | undefined): string | null {
  const digits = String(phone || '').replace(/\D+/g, '');
  if (!digits) return null;
  const last4 = digits.slice(-4).padStart(4, '*');
  return `***${last4}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildBlindCandidateSnapshot(input: {
  referenceId: string;
  candidateName?: string | null;
  candidatePhone?: string | null;
  enabled: boolean;
}): BlindCandidateSnapshot {
  const suffix =
    String(input.referenceId || '')
      .replace(/[^a-z0-9]/gi, '')
      .slice(-6)
      .toUpperCase() || 'SESSION';

  if (!input.enabled) {
    return {
      enabled: false,
      label: String(input.candidateName || '').trim() || `Candidato ${suffix}`,
      maskedName: String(input.candidateName || '').trim() || null,
      maskedPhone: String(input.candidatePhone || '').trim() || null,
    };
  }

  return {
    enabled: true,
    label: `Perfil ${suffix}`,
    maskedName: maskCandidateName(input.candidateName),
    maskedPhone: maskCandidatePhone(input.candidatePhone),
  };
}

export function projectBlindCandidateIdentity(input: {
  referenceId: string;
  candidateName?: string | null;
  candidatePhone?: string | null;
  enabled: boolean;
}): {
  blindCandidate: BlindCandidateSnapshot;
  candidateName: string | null;
  candidatePhone: string | null;
} {
  const blindCandidate = buildBlindCandidateSnapshot(input);

  return {
    blindCandidate,
    candidateName: blindCandidate.enabled ? null : blindCandidate.maskedName,
    candidatePhone: blindCandidate.enabled ? null : blindCandidate.maskedPhone,
  };
}

export function sanitizeCandidateDocumentText(input: {
  text?: string | null;
  candidateName?: string | null;
  enabled: boolean;
}): string | null {
  const raw = String(input.text || '');
  if (!raw) return null;
  if (!input.enabled) return raw;

  let sanitized = sanitizeForBlindScreening(raw, true);
  const candidateName = String(input.candidateName || '').trim();
  if (candidateName) {
    sanitized = sanitized.replace(new RegExp(escapeRegExp(candidateName), 'gi'), '[nome_redigido]');
  }

  return sanitized;
}
