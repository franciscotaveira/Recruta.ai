import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = '12345678901234567890123456789012';

const { generateToken, hashPassword, requireAuth, verifyPassword } =
  await import('../middleware/auth.js');

test('hashPassword + verifyPassword roundtrip', async () => {
  const hash = await hashPassword('StrongPass#123');
  assert.equal(await verifyPassword('StrongPass#123', hash), true);
  assert.equal(await verifyPassword('wrong', hash), false);
});

test('requireAuth rejects missing token and accepts valid token', async () => {
  const app = express();
  app.get('/protected', requireAuth('recruiter'), (_req, res) => res.json({ ok: true }));

  const noTokenRes = await request(app).get('/protected');
  assert.equal(noTokenRes.status, 401);
  assert.equal(noTokenRes.body.code, 'AUTH_TOKEN_REQUIRED');

  const token = generateToken('u1', 'recruiter');
  const okRes = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
  assert.equal(okRes.status, 200);
  assert.equal(okRes.body.ok, true);
});

test('requireAuth allows admin bypass for protected role routes', async () => {
  const app = express();
  app.get('/candidate-only', requireAuth('candidate'), (_req, res) => res.json({ ok: true }));

  const adminToken = generateToken('admin-1', 'admin');
  const okRes = await request(app)
    .get('/candidate-only')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(okRes.status, 200);
  assert.equal(okRes.body.ok, true);
});
