import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, Clock, ExternalLink, Loader2, Shield, ArrowUpRight, DollarSign } from 'lucide-react';
import { useBilling } from '../../hooks/useBilling';

type CreditPackageId = 'starter' | 'growth' | 'scale';

const PACKAGES = [
  {
    id: 'starter',
    name: 'Decisão Rápida',
    credits: 50,
    price: 199,
    bestValue: false,
    desc: 'Ideal para testar a plataforma',
  },
  {
    id: 'growth',
    name: 'Processo Full',
    credits: 200,
    price: 699,
    bestValue: true,
    desc: 'Mais vendido — R$3,50/crédito',
  },
  {
    id: 'scale',
    name: 'Enterprise',
    credits: 1000,
    price: 2990,
    bestValue: false,
    desc: 'Para volume alto — R$2,99/crédito',
  },
];

const RecruiterBilling = () => {
  const { user } = useAuth();
  const { wallet, transactions, loading, error, refresh, buyCredits } = useBilling();
  const [buying, setBuying] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');

  useEffect(() => {
    if (user?.email && !phone) setPhone('5511999999999');
  }, [user?.email, phone]);

  const handleBuy = async (packageId: CreditPackageId) => {
    setBuying(packageId);
    try {
      const customer =
        phone.trim() && taxId.trim()
          ? {
              name: user?.name || 'Recruiter',
              email: user?.email || '',
              phone: phone.trim(),
              taxId: taxId.trim(),
            }
          : undefined;
      const result = await buyCredits(packageId, customer);
      setCheckoutUrl(result.checkoutUrl);
      // Open in new tab
      window.open(result.checkoutUrl, '_blank');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao criar pagamento');
    } finally {
      setBuying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Carteira de Créditos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Compre créditos para ativar candidatos e enviar convites via WhatsApp
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
        >
          <Loader2 size={16} className={loading ? 'animate-spin' : ''} />
          Sincronizar Pagamentos
        </button>
      </div>

      {/* Wallet Balance */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-200 text-sm font-bold uppercase tracking-wider mb-1">
              Saldo Disponível
            </p>
            <p className="text-5xl font-black">
              {wallet?.balance || 0}{' '}
              <span className="text-2xl font-medium text-emerald-200">CR</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 text-right">
            <div>
              <p className="text-emerald-200 text-xs font-bold uppercase">Comprados</p>
              <p className="text-xl font-bold">{wallet?.total_purchased || 0}</p>
            </div>
            <div>
              <p className="text-emerald-200 text-xs font-bold">Utilizados</p>
              <p className="text-xl font-bold">{wallet?.total_spent || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={refresh}
            className="text-xs font-bold underline text-red-700 dark:text-red-300"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefone com DDI (ex: 5511999999999)"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        />
        <input
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          placeholder="CPF ou CNPJ (obrigatório em produção)"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        />
      </div>

      {/* Checkout URL prompt (if redirect failed) */}
      {checkoutUrl && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <ExternalLink size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                Checkout aberto em nova aba
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Se não abriu automaticamente,{' '}
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-bold"
                >
                  clique aqui
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Packages */}
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">
          Pacotes de Créditos
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PACKAGES.map((pkg) => {
            const pricePerCredit = (pkg.price / pkg.credits).toFixed(2);
            return (
              <div
                key={pkg.id}
                className={`relative bg-white dark:bg-slate-900 border-2 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md ${
                  pkg.bestValue
                    ? 'border-emerald-500 dark:border-emerald-600'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {pkg.bestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                    Mais Vendido
                  </div>
                )}
                <div className="text-center mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pkg.desc}</p>
                </div>
                <div className="text-center mb-4">
                  <p className="text-4xl font-black text-slate-900 dark:text-white">
                    R$ {pkg.price.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {pkg.credits} créditos →{' '}
                    <span className="font-bold">R$ {pricePerCredit}/cr</span>
                  </p>
                </div>
                <button
                  onClick={() => handleBuy(pkg.id)}
                  disabled={buying === pkg.id}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    pkg.bestValue
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  } disabled:opacity-50`}
                >
                  {buying === pkg.id ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Gerando checkout...
                    </>
                  ) : (
                    <>
                      <Zap size={14} fill="currentColor" /> Comprar {pkg.credits} Créditos
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <Shield size={16} className="text-slate-400 shrink-0" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Pagamento processado com segurança pela <strong>AbacatePay</strong> (PIX ou Cartão). Seus
          créditos não expiram.
        </p>
      </div>

      {/* Transaction History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Histórico</h2>
          {transactions.length > 0 && (
            <span className="text-xs text-slate-400">{(transactions || []).length} transações</span>
          )}
        </div>

        {(transactions || []).length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Clock size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma transação ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(transactions || []).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      tx.type === 'purchase'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}
                  >
                    {tx.type === 'purchase' ? (
                      <ArrowUpRight size={14} className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <DollarSign size={14} className="text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {tx.description}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(tx.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-black ${
                      tx.type === 'purchase'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {tx.type === 'purchase' ? '+' : '-'}
                    {tx.amount} CR
                  </p>
                  <p className="text-[10px] text-slate-400">Saldo: {tx.balance_after}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterBilling;
