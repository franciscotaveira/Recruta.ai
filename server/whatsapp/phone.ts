const DEFAULT_COUNTRY_CODE = String(process.env.DEFAULT_PHONE_COUNTRY_CODE || '55').replace(
  /\D+/g,
  ''
);

function stripToDigits(value: string): string {
  return String(value || '').replace(/\D+/g, '');
}

export function toCanonicalDigits(phone: string): string {
  const digits = stripToDigits(phone);
  if (!digits) return '';
  if (digits.startsWith(DEFAULT_COUNTRY_CODE) && digits.length >= 12) return digits;
  if (digits.length >= 10 && digits.length <= 11) return `${DEFAULT_COUNTRY_CODE}${digits}`;
  return digits;
}

export function toE164(phone: string): string {
  const digits = toCanonicalDigits(phone);
  return digits ? `+${digits}` : '';
}
