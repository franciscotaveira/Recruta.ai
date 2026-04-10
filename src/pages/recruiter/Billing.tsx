import React, { useState } from 'react';
import { CreditCard, Zap, AlertCircle, CheckCircle, TrendingUp, History } from 'lucide-react';
import { MOCK_RECRUITER_STATS, CREDIT_PACKAGES } from '../../constants';

const Billing = () => {
  const [wallet] = useState(MOCK_RECRUITER_STATS.wallet);
  const [autoRecharge, setAutoRecharge] = useState(wallet.autoRecharge);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Financeiro
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Gerencie seus créditos e configurações de pagamento.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* MAIN WALLET CARD */}
        <div className="lg:col-span-2 space-y-8">
          {/* CURRENT BALANCE */}
          <div className="bg-slate-900 dark:bg-purple-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20"></div>

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Saldo Disponível
                </p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-6xl font-black">{wallet.balance}</h2>
                  <span className="text-xl font-medium text-slate-300">créditos</span>
                </div>
                <p className="text-xs text-slate-400 mt-4 flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-400" />
                  Você tem créditos suficientes para aprox.{' '}
                  <strong>{Math.floor(wallet.balance)} triagens</strong>.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Auto-Recarga</span>
                  <div
                    onClick={() => setAutoRecharge(!autoRecharge)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${autoRecharge ? 'bg-green-500' : 'bg-slate-600'}`}
                  >
                    <div
                      className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${autoRecharge ? 'right-1' : 'left-1'}`}
                    ></div>
                  </div>
                </div>
                {autoRecharge ? (
                  <p className="text-[10px] text-slate-300 leading-snug">
                    Recarregar <strong>{wallet.autoRechargeAmount} créditos</strong> quando saldo
                    for menor que <strong>{wallet.autoRechargeThreshold}</strong>.
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Sua operação pode parar se o saldo acabar. Ative para segurança.
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-300">
                  <CreditCard size={12} />
                  Cartão final {wallet.savedCard?.last4}
                </div>
              </div>
            </div>
          </div>

          {/* CREDIT PACKAGES */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Adicionar Créditos
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative bg-white dark:bg-slate-800 border-2 rounded-xl p-6 cursor-pointer hover:border-purple-500 transition-all group ${pkg.bestValue ? 'border-purple-500 shadow-lg' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  {pkg.bestValue && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      Mais Popular
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">
                      {pkg.name}
                    </p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                      {pkg.credits} <span className="text-sm font-medium text-slate-400">cr</span>
                    </p>
                  </div>
                  <button className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg text-sm group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    R$ {pkg.price}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 mt-4">
              1 Crédito = 1 Candidato Triado via WhatsApp. Créditos não expiram.
            </p>
          </div>

          {/* TRANSACTION HISTORY */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <History size={18} className="text-slate-400" />
              <h3 className="font-bold text-slate-900 dark:text-white">Histórico de Transações</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3 text-right">Valor</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {wallet.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{tx.date}</td>
                      <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">
                        {tx.description}
                      </td>
                      <td
                        className={`px-6 py-3 text-right font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-slate-600 dark:text-slate-400'}`}
                      >
                        {tx.type === 'credit' ? '+' : ''}
                        {tx.amount} cr
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 bg-green-100 dark:bg-green-500/10 px-2 py-1 rounded">
                          <CheckCircle size={10} /> {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SIDEBAR INFO */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600">
                <AlertCircle size={20} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Regras de Uso</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                <span>
                  Créditos são descontados apenas quando o candidato <strong>inicia</strong> a
                  triagem.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                <span>Importação de base consome 1 crédito por contato validado.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                <span>Convites recusados não são reembolsados (custo de processamento).</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-dashed border-slate-300 dark:border-slate-700 text-center">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Precisa de Recibos?
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Todas as faturas são enviadas automaticamente para o e-mail cadastrado
              (financeiro@techcorp.com).
            </p>
            <button className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline">
              Editar dados de faturamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
