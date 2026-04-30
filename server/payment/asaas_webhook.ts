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

      // --- CASE 1: B2C Candidate Credits ---
      if (externalReference.startsWith('b2c_credits_')) {
        const userId = externalReference.replace('b2c_credits_', '');
        await dual.initCandidateWallet(userId);
        await dual.addCandidateCredit(userId, 10);
        
        console.log(`[asaas-webhook] ✅ 10 credits added to candidate ${userId}`);

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

      // --- CASE 2: B2B Recruiter Subscription ---
      else if (externalReference.startsWith('sub_')) {
        const [_, userId, planId] = externalReference.split('_');
        
        const expiresAt = new Date();
        if (planId === 'annual') {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        await dual.initRecruiterProfile(userId, 'Empresa');
        await dual.updateSubscription(userId, planId, 'active', expiresAt.toISOString());
        
        console.log(`[asaas-webhook] ✅ Subscription ${planId} activated for recruiter ${userId}`);

        const profile = await dual.getRecruiterProfile(userId);
        if (profile?.phone) {
          try {
            await sendTextMessage(
              profile.phone,
              `Sua assinatura Recrutaria (Plano ${planId.toUpperCase()}) foi ativada com sucesso! Aproveite os recursos ilimitados.`
            );
          } catch (notifyErr) {
            console.error('[asaas-webhook] Error notifying recruiter:', notifyErr);
          }
        }
      }

      // --- CASE 3: B2B Recruiter Extra Credits ---
      else if (externalReference.startsWith('pay_credits_')) {
        const [_, __, userId, creditsAmount] = externalReference.split('_');
        const amount = parseInt(creditsAmount);

        await dual.initWallet(userId);
        await dual.addTriggerCredits(amount, userId);
        
        console.log(`[asaas-webhook] ✅ ${amount} trigger credits added to recruiter ${userId}`);

        const profile = await dual.getRecruiterProfile(userId);
        if (profile?.phone) {
          try {
            await sendTextMessage(
              profile.phone,
              `Seu pacote de ${amount} créditos de disparo foi liberado com sucesso!`
            );
          } catch (notifyErr) {
            console.error('[asaas-webhook] Error notifying recruiter:', notifyErr);
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
