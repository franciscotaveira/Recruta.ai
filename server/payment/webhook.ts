/**
 * Webhook handler for AbacatePay payment events
 * Handles: billing.paid, pix.paid, pix.expired
 */

import type { Request, Response } from 'express';
import crypto from 'crypto';
import { dual } from '../storage/db.js';
import { getBilling } from '../payment/abacate.js';

const WEBHOOK_SECRET = process.env.ABACATE_WEBHOOK_SECRET || '';

function verifyAbacateSignature(req: Request): boolean {
  if (!WEBHOOK_SECRET) return process.env.NODE_ENV !== 'production';

  const signature = req.headers['x-abacate-signature'];
  if (typeof signature !== 'string') return false;

  const rawBody = (req as any).rawBody || JSON.stringify(req.body || {});
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

/**
 * Process payment webhook from AbacatePay.
 * Called when billing.paid or pix.paid events fire.
 */
export async function handlePaymentWebhook(req: Request, res: Response) {
  try {
    if (!verifyAbacateSignature(req)) {
      return res
        .status(401)
        .json({ error: 'Invalid webhook signature', code: 'WEBHOOK_INVALID_SIGNATURE' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;

    // AbacatePay sends event info; for MVP we poll billing status
    const billingId = body.data?.id || body.data?.billing_id || body.billing_id;
    if (!billingId) {
      return res
        .status(400)
        .json({ error: 'billing_id required', code: 'WEBHOOK_BILLING_ID_REQUIRED' });
    }

    // VERIFY WEBHOOK DATA WITH ABACATEPAY
    try {
      const billingData = await getBilling(billingId);
      if (billingData.status !== 'PAID') {
        console.warn(
          `[webhook] Webhook received but billing ${billingId} is not PAID (status: ${billingData.status}). Ignoring.`
        );
        return res
          .status(400)
          .json({ error: 'Billing is not PAID', code: 'WEBHOOK_BILLING_NOT_PAID' });
      }
    } catch (err) {
      console.error(`[webhook] Failed to verify billing ${billingId} with AbacatePay:`, err);
      return res.status(500).json({
        error: 'Could not verify billing signature',
        code: 'WEBHOOK_BILLING_VERIFY_FAILED',
      });
    }

    // Find the payment record
    const payment = (await dual.getPaymentByAbacateId(billingId)) as any;
    if (!payment) {
      console.log(`[webhook] Payment not found for billing: ${billingId}`);
      return res
        .status(404)
        .json({ error: 'Payment not found', code: 'WEBHOOK_PAYMENT_NOT_FOUND' });
    }
    if (payment.status === 'paid') {
      return res.json({ ok: true, message: 'Already processed' });
    }

    // Mark as paid
    await dual.markPaymentPaid('PIX', billingId);

    // Prepare to notify via Evolution API
    const { sendTextMessage } = await import('../whatsapp/client.js');

    // Deliver product
    if (payment.user_type === 'recruiter' && payment.product_type === 'credits') {
      // Add credits to recruiter wallet
      await dual.initWallet(payment.user_id);
      await dual.addCredits(payment.credits_amount, payment.credits_amount, payment.user_id);

      // Record transaction
      const wallet = (await dual.getWallet(payment.user_id)) as any;
      const txId = `tx_${Date.now()}`;
      await dual.addTransaction(
        txId,
        payment.user_id,
        payment.id,
        'purchase',
        payment.credits_amount,
        wallet?.balance || payment.credits_amount,
        `Compra de ${payment.credits_amount} créditos via AbacatePay`
      );

      console.log(
        `[webhook] ✅ ${payment.credits_amount} credits added to recruiter ${payment.user_id}`
      );

      // Notify recruiter
      // Note: A "real" app stores the exact phone. Here, we'll try to find it via metadata or just skip.
      if (payment.metadata && payment.metadata.phone) {
        try {
          await sendTextMessage(
            payment.metadata.phone,
            'Seu pacote de Créditos Recruta.AI foi liberado com sucesso!'
          );
        } catch (notifyError) {
          console.warn('[webhook] Falha ao notificar recrutador por WhatsApp:', notifyError);
        }
      }
    } else if (payment.user_type === 'candidate' && payment.product_type === 'diagnostic') {
      const profileInfo = await dual.getProfileByUser(payment.user_id);
      if (profileInfo && profileInfo.phone) {
        try {
          await sendTextMessage(
            profileInfo.phone,
            'Pagamento confirmado! O seu Diagnóstico Profundo de Carreira já está desbloqueado no Painel Oficial do Recruta.AI. Acesse e confira seu SCPD detalhado.'
          );
        } catch (notifyError) {
          console.warn('[webhook] Falha ao notificar candidato por WhatsApp:', notifyError);
        }
      }
      console.log(`[webhook] ✅ Diagnostic purchased by candidate ${payment.user_id}`);
    }

    res.json({ ok: true });
  } catch (err: any) {
    console.error('[webhook] Error processing webhook:', err);
    res.status(500).json({ error: 'Webhook processing failed', code: 'WEBHOOK_PROCESSING_FAILED' });
  }
}
