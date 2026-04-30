import { useCallback, useEffect, useState } from 'react';
import { createCreditPayment, createSubscriptionPayment, getRecruiterWallet } from '../services/api';
import type { CreditTransaction, PaymentCustomer, RecruiterWallet } from '../contracts/api';

export function useBilling() {
  const [wallet, setWallet] = useState<RecruiterWallet | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await getRecruiterWallet();
      setWallet(payload.wallet);
      setTransactions(payload.transactions || []);
      // Assuming profile comes in the wallet payload or similar
      setProfile((payload as any).profile || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar carteira');
      setWallet({ balance: 0, total_purchased: 0, total_spent: 0 });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const buyCredits = useCallback(
    async (packageId: string, customer?: PaymentCustomer) => {
      return createCreditPayment(packageId, customer);
    },
    []
  );

  const buySubscription = useCallback(
    async (planId: 'monthly' | 'annual', customer?: PaymentCustomer) => {
      return createSubscriptionPayment(planId, customer);
    },
    []
  );

  return { wallet, profile, transactions, loading, error, refresh, buyCredits, buySubscription };
}
