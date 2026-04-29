const ACCEPT_PATTERNS = [
  /\bsim\b/i,
  /\bquero\b/i,
  /\baceito\b/i,
  /\bconcordo\b/i,
  /\bestou de acordo\b/i,
  /\bpode ser\b/i,
  /\bclaro\b/i,
  /\bbora\b/i,
  /\bvamos\b/i,
];

const DECLINE_PATTERNS = [
  /\bnao quero\b/i,
  /\bnão quero\b/i,
  /\bnao tenho interesse\b/i,
  /\bnão tenho interesse\b/i,
  /\bsem interesse\b/i,
  /\bnao me interessa\b/i,
  /\bnão me interessa\b/i,
  /\bnao aceito\b/i,
  /\bnão aceito\b/i,
  /\bnao concordo\b/i,
  /\bnão concordo\b/i,
  /\bdesisto\b/i,
  /\brecuso\b/i,
  /\bcancelar\b/i,
  /\bcancelar mensagens\b/i,
  /\bparar mensagens\b/i,
  /\bnao me chame mais\b/i,
  /\bnão me chame mais\b/i,
  /\bencerrar\b/i,
  /\bsair\b/i,
];

export function normalizeUserText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function isExplicitAcceptIntent(text: string): boolean {
  const normalized = normalizeUserText(text);
  if (isExplicitDeclineIntent(normalized)) return false;
  return ACCEPT_PATTERNS.some((re) => re.test(normalized));
}

export function isExplicitDeclineIntent(text: string): boolean {
  const normalized = normalizeUserText(text);
  return DECLINE_PATTERNS.some((re) => re.test(normalized));
}

const HUMAN_HANDOFF_PATTERNS = [
  /\bfalar com (um )?humano\b/i,
  /\bfalar com (o )?recrutador\b/i,
  /\bfalar com (a )?recrutadora\b/i,
  /\bpassa(r)? para (o )?recrutador\b/i,
  /\bpassa(r)? para (a )?recrutadora\b/i,
  /\batendente\b/i,
  /\bpessoa real\b/i,
  /\bagente humano\b/i,
  /\bsuporte humano\b/i,
];

const ACCESSIBILITY_OR_TECH_FALLBACK_PATTERNS = [
  /\bacessibilidade\b/i,
  /\bsem audio\b/i,
  /\bsem áudio\b/i,
  /\bnao consigo gravar\b/i,
  /\bnão consigo gravar\b/i,
  /\bmicrofone\b/i,
  /\bproblema tecnico\b/i,
  /\bproblema técnico\b/i,
  /\bposso responder por texto\b/i,
];

const CONSENT_GRANT_PATTERNS = [
  /\bconcordo\b/i,
  /\bestou de acordo\b/i,
  /\bautorizo\b/i,
  /\baceito os termos\b/i,
  /\baceito a politica\b/i,
  /\baceito a política\b/i,
];

export function isHumanHandoffIntent(text: string): boolean {
  const normalized = normalizeUserText(text);
  return HUMAN_HANDOFF_PATTERNS.some((re) => re.test(normalized));
}

export function isTextFallbackIntent(text: string): boolean {
  const normalized = normalizeUserText(text);
  return ACCESSIBILITY_OR_TECH_FALLBACK_PATTERNS.some((re) => re.test(normalized));
}

export function isExplicitConsentGrantIntent(text: string): boolean {
  const normalized = normalizeUserText(text);
  if (isExplicitDeclineIntent(normalized)) return false;
  return CONSENT_GRANT_PATTERNS.some((re) => re.test(normalized));
}

const PROMPT_INJECTION_PATTERNS = [
  /ignore (all|previous) instructions/i,
  /desconsidere (as|essas|todas) instrucoes/i,
  /desconsidere (as|essas|todas) instruções/i,
  /\bsystem prompt\b/i,
  /\bact as\b/i,
  /\baja como\b/i,
  /\broleplay\b/i,
  /\bdeveloper message\b/i,
];

export function sanitizeForModelInput(text: string): string {
  const withoutControlChars = Array.from(String(text || ''))
    .map((char) => {
      const code = char.charCodeAt(0);
      return (code >= 0 && code <= 31) || code === 127 ? ' ' : char;
    })
    .join('');

  const cleaned = withoutControlChars.replace(/\s+/g, ' ').trim().slice(0, 1800);

  return PROMPT_INJECTION_PATTERNS.reduce(
    (acc, pattern) => acc.replace(pattern, '[redacted]'),
    cleaned
  );
}

export function looksLikePromptInjection(text: string): boolean {
  const normalized = normalizeUserText(text);
  return PROMPT_INJECTION_PATTERNS.some((re) => re.test(normalized));
}
