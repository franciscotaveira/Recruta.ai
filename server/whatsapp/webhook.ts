/**
 * WhatsApp Webhook Handler
 * Receives events from Meta's WhatsApp Cloud API webhook.
 *
 * Setup:
 * 1. In Meta App Dashboard → WhatsApp → Configuration → Webhook
 * 2. Set callback URL to: https://your-domain.com/api/whatsapp/webhook
 * 3. Set Verify Token (any secret string)
 * 4. Subscribe to messages
 */

import type { Request, Response } from 'express';
import crypto from 'crypto';
import { processInboundMessage } from '../conversation/flow.js';
import { wa } from '../storage/db.js';
import { toCanonicalDigits } from './phone.js';

const PROVIDER = String(process.env.WHATSAPP_PROVIDER || 'meta').trim().toLowerCase();
const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'recruta-ai-verify';
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || '';
const GATEWAY_WEBHOOK_SECRET = process.env.WHATSAPP_GATEWAY_WEBHOOK_SECRET || '';

function validateSignature(req: Request): { ok: boolean; reason: string } {
  if (PROVIDER === 'automatik') {
    if (!GATEWAY_WEBHOOK_SECRET) {
      return process.env.NODE_ENV !== 'production'
        ? { ok: true, reason: 'automatik.no_secret.dev_mode' }
        : { ok: false, reason: 'automatik.missing_gateway_secret' };
    }
    const h1 = String(req.header('x-webhook-secret') || '').trim();
    const h2 = String(req.header('x-api-key') || '').trim();
    const q = String((req.query.token as string) || '').trim();
    const ok = [h1, h2, q].includes(GATEWAY_WEBHOOK_SECRET);
    return {
      ok,
      reason: ok ? 'automatik.ok' : 'automatik.secret_mismatch',
    };
  }

  if (!APP_SECRET) {
    return process.env.NODE_ENV !== 'production'
      ? { ok: true, reason: 'meta.no_app_secret.dev_mode' }
      : { ok: false, reason: 'meta.missing_app_secret' };
  }

  const signatureRaw = req.headers['x-hub-signature-256'];
  const signature = typeof signatureRaw === 'string' ? signatureRaw.trim() : '';
  const signatureMatch = signature.match(/^sha256=([a-f0-9]{64})$/i);
  if (!signatureMatch) {
    return { ok: false, reason: 'meta.missing_or_invalid_signature_header' };
  }

  const rawBody = (req as any).rawBody || JSON.stringify(req.body || {});
  const expectedHash = crypto.createHmac('sha256', APP_SECRET).update(rawBody).digest('hex');
  const incomingHash = signatureMatch[1].toLowerCase();
  const ok = crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(expectedHash));
  return {
    ok,
    reason: ok ? 'meta.ok' : 'meta.signature_mismatch',
  };
}

/**
 * GET — Webhook verification (challenge from Meta)
 */
export function handleVerification(req: Request, res: Response) {
  if (PROVIDER === 'automatik') {
    const token = String((req.query.token as string) || '').trim();
    if (!GATEWAY_WEBHOOK_SECRET || token === GATEWAY_WEBHOOK_SECRET) {
      return res.status(200).json({ ok: true, provider: 'automatik' });
    }
    return res.sendStatus(403);
  }

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[webhook] Verified successfully');
    res.status(200).send(String(challenge));
  } else {
    res.sendStatus(403);
  }
}

type ParsedInboundEvent = {
  from: string;
  messageType: 'text' | 'audio';
  content: string;
  isAudio: boolean;
};

function normalizePhone(input: unknown): string {
  return toCanonicalDigits(String(input || ''));
}

function parseAutomatikInbound(body: any): ParsedInboundEvent[] {
  const events = Array.isArray(body?.events)
    ? body.events
    : Array.isArray(body?.data)
      ? body.data
      : [body];

  const parsed: ParsedInboundEvent[] = [];
  for (const ev of events) {
    const source = ev?.message || ev?.payload || ev;
    const eventType = String(ev?.event || ev?.type || source?.type || '').toLowerCase();
    const direction = String(ev?.direction || source?.direction || 'inbound').toLowerCase();
    if (
      eventType.includes('status') ||
      direction === 'outbound' ||
      direction === 'sent' ||
      direction === 'delivery'
    ) {
      continue;
    }

    const from = normalizePhone(
      source?.from || source?.phone || source?.contact?.phone || source?.conversation?.phone
    );
    if (!from) continue;

    const messageTypeRaw = String(source?.message_type || source?.type || '').toLowerCase();
    const text =
      typeof source?.text === 'string'
        ? source.text
        : typeof source?.message?.text === 'string'
          ? source.message.text
          : typeof source?.body === 'string'
            ? source.body
            : '';
    const mediaUrl =
      String(source?.media_url || source?.audio_url || source?.message?.media_url || '').trim();

    if ((messageTypeRaw === 'audio' || mediaUrl) && mediaUrl) {
      parsed.push({ from, messageType: 'audio', content: mediaUrl, isAudio: true });
      continue;
    }
    if (text) {
      parsed.push({ from, messageType: 'text', content: text, isAudio: false });
    }
  }
  return parsed;
}

/**
 * POST — Webhook events (incoming messages, delivery receipts, etc.)
 */
export async function handleEvent(req: Request, res: Response) {
  const signature = validateSignature(req);
  if (!signature.ok) {
    console.warn('[webhook] signature rejected', {
      provider: PROVIDER,
      reason: signature.reason,
      hasHubSignature256: Boolean(req.header('x-hub-signature-256')),
      hasGatewaySecret: Boolean(req.header('x-webhook-secret')),
      hasApiKey: Boolean(req.header('x-api-key')),
    });
    return res
      .status(401)
      .json({ error: 'Invalid webhook signature', code: 'WEBHOOK_INVALID_SIGNATURE' });
  }

  let body: any = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload', code: 'WEBHOOK_INVALID_JSON' });
  }

  // Acknowledge receipt immediately (Meta requires < 5s response)
  res.sendStatus(200);

  try {
    // WhatsApp sends messages in an object.Entry array
    if (PROVIDER === 'automatik') {
      const inboundEvents = parseAutomatikInbound(body);
      for (const ev of inboundEvents) {
        await processInboundMessage(ev.from, ev.messageType, ev.content, ev.isAudio);
      }
      return;
    }

    const entries = body.entry;
    if (!entries || entries.length === 0) return;

    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const messages = change.value?.messages || [];
        const statuses = change.value?.statuses || [];

        // Handle incoming messages
        for (const msg of messages) {
          if (msg.type === 'unsupported') continue; // Ignore unsupported types
          const messageId = String(msg.id || '').trim();
          if (messageId && (await wa.hasMessageId(messageId))) {
            continue;
          }

          const from = msg.from; // Phone number (e.g., "5549999999999")
          const msgType = msg.type; // "text" | "audio" | "image" | etc.
          if (messageId) {
            await wa.logMessage(
              `inbound_${messageId}`,
              null as any,
              'inbound',
              msgType || 'unknown',
              '',
              messageId,
              'received'
            );
          }

          if (msgType === 'text' && msg.text) {
            await processInboundMessage(from, 'text', msg.text.body);
          } else if (msgType === 'interactive' && msg.interactive) {
            const interactiveType = String(msg.interactive.type || '').toLowerCase();
            if (interactiveType === 'list_reply' && msg.interactive.list_reply) {
              const payload =
                msg.interactive.list_reply.id || msg.interactive.list_reply.title || '';
              if (payload) {
                await processInboundMessage(from, 'text', payload);
              }
            } else if (interactiveType === 'button_reply' && msg.interactive.button_reply) {
              const payload =
                msg.interactive.button_reply.id || msg.interactive.button_reply.title || '';
              if (payload) {
                await processInboundMessage(from, 'text', payload);
              }
            }
          } else if (msgType === 'button' && msg.button) {
            const payload = msg.button.payload || msg.button.text || '';
            if (payload) {
              await processInboundMessage(from, 'text', payload);
            }
          } else if (msgType === 'audio' && msg.audio) {
            const mediaId = msg.audio.id;
            await processInboundMessage(from, 'audio', mediaId, true);
          }
        }

        // Handle status updates (delivered, read, failed)
        for (const status of statuses) {
          if (status.id) {
            await wa.logMessage(
              `status_${status.id}`,
              null as any,
              'outbound',
              'text',
              `Status: ${status.status}`,
              status.id,
              status.status
            );
          }
        }
      }
    }
  } catch (err: any) {
    console.error('[webhook] Error processing event:', err);
  }
}
