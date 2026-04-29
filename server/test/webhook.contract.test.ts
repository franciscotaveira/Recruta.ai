import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import request from 'supertest';
import { wa } from '../storage/db.js';

process.env.NODE_ENV = 'test';
process.env.SKIP_SERVER_START = '1';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.WHATSAPP_APP_SECRET = 'test_whatsapp_secret';
process.env.ABACATE_WEBHOOK_SECRET = 'test_abacate_secret';

const { default: app } = await import('../index.js');

test('POST /api/whatsapp/webhook accepts valid signature contract', async () => {
  const body = JSON.stringify({ entry: [] });
  const sig = `sha256=${crypto.createHmac('sha256', process.env.WHATSAPP_APP_SECRET!).update(body).digest('hex')}`;

  const res = await request(app)
    .post('/api/whatsapp/webhook')
    .set('content-type', 'application/json')
    .set('x-hub-signature-256', sig)
    .send(body);

  assert.equal(res.status, 200);
});

test('POST /api/payment/webhook with valid signature and missing billing_id returns 400', async () => {
  const body = JSON.stringify({});
  const sig = crypto
    .createHmac('sha256', process.env.ABACATE_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  const res = await request(app)
    .post('/api/payment/webhook')
    .set('content-type', 'application/json')
    .set('x-abacate-signature', sig)
    .send(body);

  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'billing_id required');
  assert.equal(res.body.code, 'WEBHOOK_BILLING_ID_REQUIRED');
});

test('POST /api/whatsapp/webhook ignores duplicated inbound message id', async () => {
  const originalHasMessageId = wa.hasMessageId;
  const originalLogMessage = wa.logMessage;
  let logMessageCalls = 0;

  wa.hasMessageId = (async () => true) as typeof wa.hasMessageId;
  wa.logMessage = (async (...args: Parameters<typeof wa.logMessage>) => {
    logMessageCalls += 1;
    return originalLogMessage(...args);
  }) as typeof wa.logMessage;

  try {
    const payload = {
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    id: 'wamid.duplicate-1',
                    from: '5549999999999',
                    type: 'text',
                    text: { body: 'SIM' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const body = JSON.stringify(payload);
    const sig = `sha256=${crypto
      .createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
      .update(body)
      .digest('hex')}`;

    const res = await request(app)
      .post('/api/whatsapp/webhook')
      .set('content-type', 'application/json')
      .set('x-hub-signature-256', sig)
      .send(body);

    assert.equal(res.status, 200);
    assert.equal(logMessageCalls, 0);
  } finally {
    wa.hasMessageId = originalHasMessageId;
    wa.logMessage = originalLogMessage;
  }
});
