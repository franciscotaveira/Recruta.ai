import React from 'react';
import {
  X,
  Sparkles,
  Target,
  Zap,
  Brain,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  MessageSquare,
} from 'lucide-react';
import type { WhatsAppSession } from '../../contracts/api';

interface Props {
  sessions: WhatsAppSession[];
  onClose: () => void;
}

const CandidateComparison: React.FC<Props> = ({ sessions, onClose }) => {
  // Get unique questions across all sessions to align them
  const allQuestions = Array.from(
    new Set(sessions.flatMap((s) => (s.questions || []).map((q) => q.text)))
  );

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Comparativo Inteligente
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Análise lado a lado de {sessions.length} candidatos
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="min-w-max">
          <table className="w-full border-separate border-spacing-x-4">
            <thead>
              <tr>
                <th className="w-64 sticky left-0 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 p-4 rounded-2xl text-left font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Critério de Avaliação
                </th>
                {sessions.map((s) => (
                  <th
                    key={s.id}
                    className="w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl text-left shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-600 dark:text-slate-300">
                        {s.candidate_name?.[0] || 'C'}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-sm truncate">
                          {s.candidate_name || 'Candidato Oculto'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                          {s.candidate_phone || 'Telefone não disponível'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-3 border border-slate-200/50 dark:border-slate-800/50">
                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">
                          Match Score
                        </p>
                        <div className="flex items-center gap-2">
                          <Target size={14} className="text-emerald-500" />
                          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                            {s.match_score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="before:block before:h-6">
              {/* Communication Stats Section */}
              <tr>
                <td className="sticky left-0 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 p-4 rounded-2xl align-top">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                    <Brain size={16} />
                    <span className="font-black text-xs uppercase">Iris Index</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Performance comunicativa analisada via áudio
                  </p>
                </td>
                {sessions.map((s) => (
                  <td key={s.id} className="p-4 align-top">
                    {s.communication_performance ? (
                      <div className="space-y-3">
                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-500">Clareza</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((v) => (
                                  <div
                                    key={v}
                                    className={`w-3 h-1.5 rounded-full ${v <= s.communication_performance!.clarity ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-500">
                                Vocabulário
                              </span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((v) => (
                                  <div
                                    key={v}
                                    className={`w-3 h-1.5 rounded-full ${v <= s.communication_performance!.vocabulary ? 'bg-purple-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-500">
                                Objetividade
                              </span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((v) => (
                                  <div
                                    key={v}
                                    className={`w-3 h-1.5 rounded-full ${v <= s.communication_performance!.objectivity ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] text-slate-400 font-bold uppercase">
                        Não analisado
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Strengths & Concerns */}
              <tr>
                <td className="sticky left-0 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 p-4 rounded-2xl align-top">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <CheckCircle2 size={16} />
                    <span className="font-black text-xs uppercase">Pontos Fortes</span>
                  </div>
                </td>
                {sessions.map((s) => (
                  <td key={s.id} className="p-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      {(s.strengths || []).map((st, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-100 dark:border-emerald-800"
                        >
                          {st}
                        </span>
                      ))}
                      {(!s.strengths || s.strengths.length === 0) && (
                        <span className="text-slate-300 text-[10px]">—</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="sticky left-0 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 p-4 rounded-2xl align-top">
                  <div className="flex items-center gap-2 text-rose-600 mb-1">
                    <AlertCircle size={16} />
                    <span className="font-black text-xs uppercase">Atenção</span>
                  </div>
                </td>
                {sessions.map((s) => (
                  <td key={s.id} className="p-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      {(s.concerns || []).map((cn, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-lg text-[10px] font-bold border border-rose-100 dark:border-rose-800"
                        >
                          {cn}
                        </span>
                      ))}
                      {(!s.concerns || s.concerns.length === 0) && (
                        <span className="text-slate-300 text-[10px]">—</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Questions Rows */}
              {allQuestions.map((qText, idx) => (
                <tr key={idx} className="group">
                  <td className="sticky left-0 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 p-4 rounded-2xl align-top border-t border-slate-100 dark:border-slate-800/50 mt-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                      <MessageSquare size={14} />
                      <span className="font-black text-[10px] uppercase">Pergunta {idx + 1}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {qText}
                    </p>
                  </td>
                  {sessions.map((s) => {
                    const question = (s.questions || []).find((q) => q.text === qText);
                    const qIdx = (s.questions || []).findIndex((q) => q.text === qText);
                    const response = s.responses?.[qIdx];
                    const score = s.question_scores?.[qIdx];

                    return (
                      <td
                        key={s.id}
                        className="p-4 align-top border-t border-slate-100 dark:border-slate-800/50"
                      >
                        {response ? (
                          <div className="space-y-2">
                            <div className="bg-white dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                              <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                "{response.transcription || response.text || 'Sem transcrição'}"
                              </p>
                            </div>
                            {score !== undefined && (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-full w-fit">
                                <BarChart3 size={12} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">
                                  SCORE: {score}/100
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full min-h-[100px] flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] text-slate-300 font-bold uppercase">
                            Não respondida
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Recrutaria • Inteligência de Áudio • Iris Index v2.0
        </p>
      </div>
    </div>
  );
};

export default CandidateComparison;
