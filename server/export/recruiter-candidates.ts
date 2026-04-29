export type RecruiterCandidateExportFormat = 'csv' | 'json';

export interface RecruiterCandidateExportRow {
  profile_id: string;
  blind_label: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  target_role: string | null;
  seniority: string | null;
  scp_score: number;
  history_count: number;
  latest_job: string | null;
  latest_company: string | null;
  latest_status: string | null;
  attention_points: string;
  diagnosis: string | null;
  updated_at: string | null;
}

const EXPORT_COLUMNS: Array<{ key: keyof RecruiterCandidateExportRow; header: string }> = [
  { key: 'profile_id', header: 'profile_id' },
  { key: 'blind_label', header: 'blind_label' },
  { key: 'name', header: 'name' },
  { key: 'email', header: 'email' },
  { key: 'phone', header: 'phone' },
  { key: 'location', header: 'location' },
  { key: 'target_role', header: 'target_role' },
  { key: 'seniority', header: 'seniority' },
  { key: 'scp_score', header: 'scp_score' },
  { key: 'history_count', header: 'history_count' },
  { key: 'latest_job', header: 'latest_job' },
  { key: 'latest_company', header: 'latest_company' },
  { key: 'latest_status', header: 'latest_status' },
  { key: 'attention_points', header: 'attention_points' },
  { key: 'diagnosis', header: 'diagnosis' },
  { key: 'updated_at', header: 'updated_at' },
];

function asText(value: unknown): string {
  return String(value ?? '');
}

function normalizeText(value: unknown): string | null {
  const text = asText(value).trim();
  return text.length > 0 ? text : null;
}

function truncateText(value: unknown, maxLength: number): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function parseBooleanQueryFlag(value: unknown): boolean {
  const normalized = asText(value).trim().toLowerCase();
  if (!normalized) return false;
  return ['1', 'true', 'yes', 'sim', 'on'].includes(normalized);
}

export function normalizeRecruiterCandidateExportFormat(
  value: unknown
): RecruiterCandidateExportFormat | null {
  const normalized = asText(value || 'csv').trim().toLowerCase();
  if (normalized === 'csv' || normalized === 'json') return normalized;
  return null;
}

function escapeCsv(value: unknown): string {
  const text = asText(value).replace(/\r?\n/g, ' ').trim();
  if (!text) return '';
  if (/[",]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildRecruiterCandidateExportRows(candidates: any[]): RecruiterCandidateExportRow[] {
  return (candidates || []).map((candidate: any) => {
    const history = Array.isArray(candidate?.history) ? candidate.history : [];
    const latest = history.length > 0 ? history[0] : null;
    const attention = Array.isArray(candidate?.attention_points)
      ? candidate.attention_points
      : [];

    return {
      profile_id: String(candidate?.id || ''),
      blind_label: String(candidate?.blind_candidate?.label || ''),
      name: normalizeText(candidate?.name),
      email: normalizeText(candidate?.email),
      phone: normalizeText(candidate?.phone),
      location: normalizeText(candidate?.location),
      target_role: normalizeText(candidate?.target_role),
      seniority: normalizeText(candidate?.seniority),
      scp_score: Number(candidate?.scp_score || 0),
      history_count: history.length,
      latest_job: normalizeText(latest?.public_jobs?.title),
      latest_company: normalizeText(latest?.public_jobs?.company),
      latest_status: normalizeText(latest?.status),
      attention_points: attention
        .map((entry: unknown) => asText(entry).trim())
        .filter(Boolean)
        .join(' | '),
      diagnosis: truncateText(candidate?.diagnosis, 600),
      updated_at: normalizeText(candidate?.updated_at),
    };
  });
}

export function encodeRecruiterCandidateExportCsv(rows: RecruiterCandidateExportRow[]): string {
  const headerLine = EXPORT_COLUMNS.map((column) => escapeCsv(column.header)).join(',');
  const lines = rows.map((row) =>
    EXPORT_COLUMNS.map((column) => escapeCsv(row[column.key])).join(',')
  );
  return `\uFEFF${[headerLine, ...lines].join('\n')}\n`;
}
