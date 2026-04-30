import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Zap,
  Clock,
  ExternalLink,
  Loader2,
  Shield,
  ArrowUpRight,
  DollarSign,
  CheckCircle2,
  Star,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { useBilling } from '../../hooks/useBilling';

const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Pro Mensal',
    price: 397,
    period: '/mês',
    desc: 'Toda a inteligência da plataforma liberada.',
    features: [
      'Triagem IA Ilimitada (Upload)',
      'Cadastro de Vagas ilimitado',
      'Ranking e Match de Candidatos',
      'Dashboard de Recrutamento',
      'Suporte Prioritário',
    ],
  },
  {
    id: 'annual',
    name: 'Pro Anual',
    price: 357.3,
    period: '/mês',
    desc: 'Economize 10% e trave o preço por 1 ano.',
    bestValue: true,
    features: [
      'Tudo do plano Mensal',
      '10% de Desconto Real',
      'Preço travado por 12 meses',
      'Acesso antecipado a novos recursos',
    ],
  },
];

const PACKAGES = [
  {
    id: 'pack10',
    name: 'Pack 10',
    credits: 10,
    price: 100,
    desc: 'R$ 10,00 por disparo',
  },
  {
    id: 'pack20',
    name: 'Pack 20',
    credits: 20,
    price: 180,
    desc: 'R$ 9,00 por disparo',
  },
  {
    id: 'pack50',
    name: 'Pack 50',
    credits: 50,
    price: 400,
    bestValue: true,
    desc: 'R$ 8,00 por disparo',
  },
  {
    id: 'pack100',
    name: 'Pack 100',
    credits: 100,
    price: 700,
    desc: 'R$ 7,00 por disparo',
  },
  {
    id: 'pack200',
    name: 'Pack 200',
    credits: 200,
    price: 1200,
    desc: 'R$ 6,00 por disparo',
  },
  {
    id: 'pack500',
    name: 'Pack 500',
    credits: 500,
    price: 2500,
    desc: 'R$ 5,00 por disparo',
  },
];

const RecruiterBilling = () => {
  const { user } = useAuth();
  const { wallet, profile, transactions, loading, error, refresh, buyCredits, buySubscription } =
    useBilling();
  const [buying, setBuying] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');

  useEffect(() => {
    if (user?.email && !phone) setPhone('5511999999999');
  }, [user?.email, phone]);

  const handleBuyCredits = async (packageId: string) => {
    setBuying(packageId);
    try {
      const customer =
        phone.trim() && taxId.trim()
          ? {
              name: user?.name || '',
              email: user?.email || '',
              phone: phone.trim(),
              taxId: taxId.trim(),
            }
          : undefined;
      const result = await buyCredits(packageId, customer);
      setCheckoutUrl(result.checkoutUrl);
      window.open(result.checkoutUrl, '_blank');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBuying(null);
    }
  };

  const handleBuySubscription = async (planId: 'monthly' | 'annual') => {
    setBuying(planId);
    try {
      const customer =
        phone.trim() && taxId.trim()
          ? {
              name: user?.name || '',
              email: user?.email || '',
              phone: phone.trim(),
              taxId: taxId.trim(),
            }
          : undefined;
      const result = await buySubscription(planId, customer);
      setCheckoutUrl(result.checkoutUrl);
      window.open(result.checkoutUrl, '_blank');
    } catch (err: any) {
      alert(err.message);
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

  const isSubscribed = profile?.subscription_status === 'active';

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Assinatura & Créditos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gerencie sua inteligência de recrutamento e saldo de disparos.
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Loader2 size={16} className={loading ? 'animate-spin' : ''} />
          Sincronizar
        </button>
      </div>

      {/* Low Balance Alert */}
      {wallet && wallet.trigger_balance < 10 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
          <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-black text-amber-600 uppercase tracking-tight">
              Saldo de Disparos Crítico
            </p>
            <p className="text-xs text-amber-600/80 font-medium">
              Seu saldo está abaixo de 10 créditos. Recarregue para evitar que novas entrevistas
              sejam bloqueadas.
            </p>
          </div>
        </div>
      )}

      {/* Subscription Status & Balances */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div
          className={`col-span-1 p-6 rounded-3xl border-2 transition-all ${isSubscribed ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`p-2 rounded-xl ${isSubscribed ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
            >
              <Star size={20} fill={isSubscribed ? 'currentColor' : 'none'} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Plano Atual
              </p>
              <p className="font-bold text-slate-900 dark:text-white">
                {isSubscribed ? profile.subscription_plan?.toUpperCase() : 'FREE (Inativo)'}
              </p>
            </div>
          </div>
          {isSubscribed ? (
            <div className="space-y-1">
              <p className="text-xs text-slate-500">
                Status: <span className="text-emerald-500 font-bold">ATIVO</span>
              </p>
              <p className="text-xs text-slate-500 text-balance">
                Expira em: {new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed">
              Sua conta está no modo limitado. Ative o Plano Pro para liberar a triagem IA
              ilimitada.
            </p>
          )}
        </div>

        {/* Trigger Balance Card */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <Zap className="absolute -right-4 -bottom-4 text-white/5" size={160} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-1">
                Saldo de Disparos WhatsApp
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">{wallet?.trigger_balance || 0}</span>
                <span className="text-xl font-bold text-indigo-300">Créditos</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-indigo-300/60 text-xs mb-1 italic">Operação de Elite</p>
              <p className="text-xs font-medium text-indigo-200 max-w-[200px]">
                Use para convidar candidatos para entrevistas por voz automatizadas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Info (Required for billing) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 size={16} className="text-indigo-500" />
          Dados de Faturamento
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
              WhatsApp para Notificações
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 5511999999999"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
              CPF ou CNPJ
            </label>
            <input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="Para emissão de NF"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Subscription Plans Section */}
      {!isSubscribed && (
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Assinatura de Inteligência
            </h2>
            <p className="text-slate-500 text-sm">
              Libere o cérebro do Recrutaria para sua empresa.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-8 rounded-3xl border-2 bg-white dark:bg-slate-900 transition-all hover:scale-[1.02] ${plan.bestValue ? 'border-indigo-500 shadow-indigo-500/10 shadow-2xl' : 'border-slate-200 dark:border-slate-800'}`}
              >
                {plan.bestValue && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    Recomendado (Trava de Preço)
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-slate-500 text-xs mt-1">{plan.desc}</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-400">R$</span>
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-slate-400 text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                    >
                      <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleBuySubscription(plan.id as any)}
                  disabled={!!buying}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${plan.bestValue ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-500/20'}`}
                >
                  {buying === plan.id ? 'Gerando Checkout...' : 'Assinar Agora'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Credit Packages Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Recarga de Disparos
            </h2>
            <p className="text-slate-500 text-sm">
              Créditos avulsos para convites ativos via WhatsApp.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`group p-6 rounded-3xl border-2 bg-white dark:bg-slate-900 transition-all hover:border-indigo-400 ${pkg.bestValue ? 'border-indigo-100 dark:border-indigo-900/30' : 'border-slate-100 dark:border-slate-800'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                  <Zap size={16} fill="currentColor" />
                </div>
                {pkg.bestValue && (
                  <span className="text-[8px] font-black bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full uppercase">
                    Melhor Oferta
                  </span>
                )}
              </div>
              <h4 className="font-black text-slate-900 dark:text-white mb-1">{pkg.name}</h4>
              <p className="text-[10px] text-slate-400 mb-4">{pkg.desc}</p>
              <div className="mb-6">
                <p className="text-2xl font-black text-slate-900 dark:text-white">R$ {pkg.price}</p>
                <p className="text-[10px] font-bold text-indigo-500">{pkg.credits} DISPAROS</p>
              </div>
              <button
                onClick={() => handleBuyCredits(pkg.id)}
                disabled={!!buying}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all"
              >
                {buying === pkg.id ? '...' : 'Comprar'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Security note */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
        <Shield size={16} className="text-slate-400 shrink-0" />
        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tight">
          Pagamento processado com segurança pela{' '}
          <strong className="text-indigo-600">AbacatePay</strong>. Créditos de disparo não expiram.
        </p>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">
          Histórico Recente
        </h2>
        {(transactions || []).length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <Clock size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Nenhuma movimentação registrada.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(transactions || []).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2.5 rounded-xl ${tx.type === 'purchase' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}
                  >
                    {tx.type === 'purchase' ? <ArrowUpRight size={16} /> : <DollarSign size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {tx.description}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
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
                    className={`text-sm font-black ${tx.type === 'purchase' ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {tx.type === 'purchase' ? '+' : '-'}
                    {tx.amount} CR
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">Total: {tx.balance_after}</p>
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
