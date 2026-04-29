import { describe, expect, it } from 'vitest';
import {
  buildAppUrl,
  isAppSubdomain,
  isLocalHost,
  resolveApiBase,
  resolveApiFallbackBase,
  resolveRegistrableDomain,
} from './runtimeHost';

describe('runtimeHost', () => {
  it('detects local hosts', () => {
    expect(isLocalHost('localhost')).toBe(true);
    expect(isLocalHost('127.0.0.1')).toBe(true);
    expect(isLocalHost('dev-machine.local')).toBe(true);
    expect(isLocalHost('app.recrutaria.com.br')).toBe(false);
  });

  it('resolves registrable domain for .com.br', () => {
    expect(resolveRegistrableDomain('app.recrutaria.com.br')).toBe('recrutaria.com.br');
    expect(resolveRegistrableDomain('api.recrutaria.com.br')).toBe('recrutaria.com.br');
    expect(resolveRegistrableDomain('recrutaria.com.br')).toBe('recrutaria.com.br');
  });

  it('resolves registrable domain for generic tld', () => {
    expect(resolveRegistrableDomain('app.example.com')).toBe('example.com');
    expect(resolveRegistrableDomain('example.com')).toBe('example.com');
  });

  it('resolves api base from explicit env URL', () => {
    expect(
      resolveApiBase({
        configuredApiUrl: 'https://api.recrutaria.com.br/api/',
        hostname: 'app.recrutaria.com.br',
        protocol: 'https:',
      })
    ).toBe('https://api.recrutaria.com.br/api');
  });

  it('resolves api base to same-origin in local dev', () => {
    expect(
      resolveApiBase({
        hostname: 'localhost',
        protocol: 'http:',
      })
    ).toBe('/api');
  });

  it('resolves api base to same-origin /api by default in production host', () => {
    expect(
      resolveApiBase({
        hostname: 'app.recrutaria.com.br',
        protocol: 'https:',
      })
    ).toBe('/api');
  });

  it('keeps api base as /api when already on api host', () => {
    expect(
      resolveApiBase({
        hostname: 'api.recrutaria.com.br',
        protocol: 'https:',
      })
    ).toBe('/api');
  });

  it('resolves api fallback base to api subdomain', () => {
    expect(
      resolveApiFallbackBase({
        hostname: 'app.recrutaria.com.br',
        protocol: 'https:',
      })
    ).toBe('https://api.recrutaria.com.br/api');
  });

  it('builds app URL from root domain', () => {
    expect(
      buildAppUrl('/candidate', {
        hostname: 'recrutaria.com.br',
        protocol: 'https:',
        origin: 'https://recrutaria.com.br',
      })
    ).toBe('https://app.recrutaria.com.br/candidate');
  });

  it('builds app URL in local as relative path fallback', () => {
    expect(
      buildAppUrl('/candidate', {
        hostname: 'localhost',
        protocol: 'http:',
        origin: 'http://localhost:4050',
      })
    ).toBe('http://localhost:4050/candidate');
  });

  it('detects app subdomain accurately', () => {
    expect(isAppSubdomain('app.recrutaria.com.br')).toBe(true);
    expect(isAppSubdomain('recrutaria.com.br')).toBe(false);
  });
});
