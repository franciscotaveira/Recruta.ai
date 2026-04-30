import type { Request, Response } from 'express';
import { dual } from '../storage/db.js';
import { sendTextMessage } from '../whatsapp/client.js';

/**
 * Handle Asaas Webhook events
 * Events: PAYMENT_CONFIRMED, PAYMENT_RECEIVED
 */
export async function handleAsaasWebhook(req: Request, res: Response) {
  try {
    const body = req.body;
    const event = body.event;
    const payment = body.payment;

    console.log(`[asaas-webhook] Received event: ${event} for payment: ${payment?.id}`);

    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      const externalReference = payment.externalReference;
      
      if (!externalReference) {
        console.warn('[asaas-webhook] No externalReference found in payment');
        return res.json({ ok: true });
      }

      // Check if it's a B2C Credit Purchase
      if (externalReference.startsWith('b2c_credits_')) {
        const userId = externalReference.replace('b2c_credits_', '');
        
        // Add 10 credits (fixed package for now)
        await dual.initCandidateWallet(userId);
        await dual.addCandidateCredit(userId, 10);
        
        console.log(`[asaas-webhook] ✅ 10 credits added to candidate ${userId}`);

        // Notify via WhatsApp
        const profile = await dual.getProfileByUser(userId);
        if (profile?.phone) {
          try {
            await sendTextMessage(
              profile.phone,
              'Seu pagamento foi confirmado! 10 créditos foram adicionados à sua conta. Já pode refatorar seu currículo agora!'
            );
          } catch (notifyErr) {
            console.error('[asaas-webhook] Error notifying candidate:', notifyErr);
          }
        }
      }
    }

    res.json({ ok: true });
  } catch (err: any) {
    console.error('[asaas-webhook] Error processing webhook:', err.message);
    res.status(500).json({ error: 'Webhook failed' });
  }
}
