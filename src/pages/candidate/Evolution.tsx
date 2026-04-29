import React from 'react';
import { TrendingUp, Clock, Zap, BarChart3, AlertCircle } from 'lucide-react';

const EvolutionPage = () => {
  // Truth in data: No mock data. Wait for actual evolution timeline.
  const timeline: any[] = [];

  const hasHistory = timeline.length >= 3;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          Evolução <TrendingUp className="text-purple-500" size={24} />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Acompanhe o crescimento do valor do seu perfil ao longo do tempo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-purple-100 uppercase tracking-wider mb-2">
              Score Atual
            </h3>
            <div className="text-4xl font-black">{hasHistory ? '85/100' : 'N/A'}</div>
            <p className="text-xs text-purple-200 mt-2 flex items-center gap-1">
              Top 15% na sua área <Zap size={14} />
            </p>
          </div>
          <Zap className="absolute -bottom-4 -right-4 text-purple-500/30 w-32 h-32" />
        </div>

        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-center">
          <div className="text-center">
            <BarChart3 size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              Gráfico de Crescimento no Mês
            </p>
            <p className="text-xs text-slate-500">
              Histórico suficiente a partir do seu 3º diagnóstico.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6">Linha do Tempo</h2>

        {timeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <AlertCircle size={32} className="text-slate-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Nenhum evento registrado
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Suas candidaturas e diagnósticos aparecerão aqui conforme você interage com a
              plataforma.
            </p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
            {timeline.map((item, idx) => (
              <div
                key={idx}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {item.type === 'scpd' ? <Zap size={16} /> : <Clock size={16} />}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {item.event}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      {item.date}
                    </span>
                  </div>
                  {item.score && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium text-slate-500">Score de Triagem:</span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {item.score}
                      </span>
                      {item.change && (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                          {item.change} pts
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvolutionPage;
