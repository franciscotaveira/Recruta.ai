import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.SKIP_SERVER_START = '1';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

const { default: app } = await import('../index.js');

test('GET /api/health returns x-correlation-id header', async () => {
  const res = await request(app).get('/api/health');
  assert.ok(typeof res.headers['x-correlation-id'] === 'string');
  assert.ok(res.headers['x-correlation-id'].length > 10);
});

test('GET /api/health keeps incoming x-correlation-id', async () => {
  const correlationId = 'test-correlation-id-123';
  const res = await request(app).get('/api/health').set('x-correlation-id', correlationId);
  assert.equal(res.headers['x-correlation-id'], correlationId);
});

test('POST /api/auth/register failure includes correlationId in details', async () => {
  const correlationId = 'corr-register-400';
  const res = await request(app)
    .post('/api/auth/register')
    .set('content-type', 'application/json')
    .set('x-correlation-id', correlationId)
    .send({});

  assert.equal(res.status, 400);
  assert.equal(res.body.code, 'AUTH_REQUIRED_FIELDS');
  assert.equal(res.body?.details?.correlationId, correlationId);
});
