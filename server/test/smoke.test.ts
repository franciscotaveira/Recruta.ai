import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.SKIP_SERVER_START = '1';
process.env.WHATSAPP_APP_SECRET = 'test_whatsapp_secret';
process.env.ABACATE_WEBHOOK_SECRET = 'test_abacate_secret';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

const { default: app } = await import('../index.js');

test('GET /api/health returns health payload', async () => {
  const res = await request(app).get('/api/health');
  assert.ok(res.status === 200 || res.status === 503);
  assert.ok(typeof res.body.status === 'string');
});

test('POST /api/whatsapp/webhook rejects invalid signature', async () => {
  const res = await request(app)
    .post('/api/whatsapp/webhook')
    .set('x-hub-signature-256', 'sha256=invalid')
    .send({ entry: [] });

  assert.equal(res.status, 401);
  assert.equal(res.body.error, 'Invalid webhook signature');
  assert.equal(res.body.code, 'WEBHOOK_INVALID_SIGNATURE');
});

test('POST /api/payment/webhook rejects invalid signature', async () => {
  const res = await request(app)
    .post('/api/payment/webhook')
    .set('x-abacate-signature', 'invalid')
    .send({ data: { id: 'bill_test' } });

  assert.equal(res.status, 401);
  assert.equal(res.body.error, 'Invalid webhook signature');
  assert.equal(res.body.code, 'WEBHOOK_INVALID_SIGNATURE');
});
