import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.SKIP_SERVER_START = '1';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.ALLOWED_ORIGINS =
  'https://app.recrutaria.com.br,https://recrutaria.com.br,http://localhost:4050';

const { default: app } = await import('../index.js');

test('CORS allows production app origin', async () => {
  const res = await request(app).get('/api/health').set('Origin', 'https://app.recrutaria.com.br');
  assert.ok(res.status === 200 || res.status === 503);
  assert.equal(res.headers['access-control-allow-origin'], 'https://app.recrutaria.com.br');
});

test('CORS blocks unknown origin', async () => {
  const res = await request(app).get('/api/health').set('Origin', 'https://evil.example.com');
  assert.equal(res.status, 403);
  assert.equal(res.body.code, 'CORS_ORIGIN_NOT_ALLOWED');
  assert.equal(res.headers['access-control-allow-origin'], undefined);
});
