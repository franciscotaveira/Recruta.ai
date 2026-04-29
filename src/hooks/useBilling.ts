import { useCallback, useEffect, useState } from 'react';
import { createCreditPayment, getRecruiterWallet } from '../services/api';
import type { CreditTransaction, PaymentCustomer, RecruiterWallet } from '../contracts/api';

export function useBilling() {
  const [wallet, setWallet] = useState<RecruiterWallet | null>(null);
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
    async (packageId: 'starter' | 'growth' | 'scale', customer?: PaymentCustomer) => {
      return createCreditPayment(packageId, customer);
    },
    []
  );

  return { wallet, transactions, loading, error, refresh, buyCredits };
}
