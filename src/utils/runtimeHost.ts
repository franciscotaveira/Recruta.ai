const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

function stripPort(hostname: string): string {
  return String(hostname || '')
    .trim()
    .toLowerCase()
    .split(':')[0];
}

function isIpAddress(hostname: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

export function isLocalHost(hostname: string): boolean {
  const host = stripPort(hostname);
  return LOCAL_HOSTS.has(host) || host.endsWith('.local') || isIpAddress(host);
}

export function resolveRegistrableDomain(hostname: string): string | null {
  const host = stripPort(hostname);
  if (!host || isLocalHost(host)) return null;

  const parts = host.split('.').filter(Boolean);
  if (parts.length < 2) return null;

  // Handle common Brazilian public suffix pattern (e.g. app.recrutaria.com.br).
  if (
    parts.length >= 3 &&
    parts[parts.length - 1] === 'br' &&
    ['com', 'net', 'org', 'gov', 'edu', 'co', 'blog', 'wiki', 'dev', 'app'].includes(
      parts[parts.length - 2]
    )
  ) {
    return parts.slice(-3).join('.');
  }

  return parts.slice(-2).join('.');
}

export function isAppSubdomain(hostname: string): boolean {
  const host = stripPort(hostname);
  return host.startsWith('app.');
}

export function normalizeApiBase(configuredApiUrl?: string): string {
  const configured = String(configuredApiUrl || '').trim();
  return configured.replace(/\/+$/, '');
}

export function resolveApiBase(options: {
  configuredApiUrl?: string;
  hostname?: string;
  protocol?: string;
}): string {
  const normalizedConfigured = normalizeApiBase(options.configuredApiUrl);
  if (normalizedConfigured) return normalizedConfigured;

  const hostname = stripPort(options.hostname || '');
  if (!hostname || isLocalHost(hostname)) return '/api';
  return '/api';
}

export function resolveApiFallbackBase(options: {
  hostname?: string;
  protocol?: string;
}): string | null {
  const hostname = stripPort(options.hostname || '');
  const protocol = options.protocol || 'https:';

  if (!hostname || isLocalHost(hostname)) return null;

  const domain = resolveRegistrableDomain(hostname);
  if (!domain) return null;
  if (hostname === `api.${domain}`) return null;

  return `${protocol}//api.${domain}/api`;
}

export function resolveAppOrigin(options: {
  hostname?: string;
  protocol?: string;
  origin?: string;
}): string {
  const hostname = stripPort(options.hostname || '');

  if (!hostname || isLocalHost(hostname)) {
    return options.origin || '';
  }

  const domain = resolveRegistrableDomain(hostname);
  if (!domain) return options.origin || '';

  return `${options.protocol || 'https:'}//app.${domain}`;
}

export function buildAppUrl(
  path: string,
  options: {
    hostname?: string;
    protocol?: string;
    origin?: string;
  }
): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const appOrigin = resolveAppOrigin(options);

  if (!appOrigin) return normalizedPath;
  return `${appOrigin}${normalizedPath}`;
}
