import React, { useState, useEffect } from 'react';
import { Search, User, MapPin, Loader2 } from 'lucide-react';
import { getRecruiterCandidates } from '../services/api';
import type { CandidateProfile } from '../contracts/api';
import { resolveBlindCandidateDisplay } from '../utils/blindCandidate';

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const data = await getRecruiterCandidates();
      setCandidates(data || []);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = candidates.filter((c) => {
    const candidate = resolveBlindCandidateDisplay({
      candidateName: c.name,
      candidatePhone: c.phone,
      blindCandidate: c.blind_candidate,
    });
    const query = searchTerm.toLowerCase();

    return (
      candidate.label.toLowerCase().includes(query) ||
      c.target_role?.toLowerCase().includes(query) ||
      c.location?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Banco de Talentos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {candidates.length} candidatos analisados
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por perfil, cargo ou localização..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <User size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
            {candidates.length === 0 ? 'Nenhum candidato ainda' : 'Nenhum resultado encontrado'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {candidates.length === 0
              ? 'Use a Triagem Inteligente para analisar currículos e populate o banco.'
              : 'Tente ajustar sua busca.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const candidate = resolveBlindCandidateDisplay({
              candidateName: c.name,
              candidatePhone: c.phone,
              blindCandidate: c.blind_candidate,
              fallbackLabel: 'Perfil',
            });

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors shadow-sm"
              >
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-lg shrink-0">
                    {candidate.initial}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {candidate.label}
                      </p>
                      {c.blind_candidate?.enabled && (
                        <span className="text-[10px] px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full shrink-0 font-bold uppercase tracking-wide">
                          Blind
                        </span>
                      )}
                      {c.target_role && (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full shrink-0">
                          {c.target_role}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {c.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {c.location}
                        </span>
                      )}
                      {c.seniority && <span>{c.seniority}</span>}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-xl font-black ${
                        (c.scp_score || 0) >= 70
                          ? 'text-emerald-500'
                          : (c.scp_score || 0) >= 40
                            ? 'text-amber-500'
                            : 'text-red-500'
                      }`}
                    >
                      {c.scp_score || 0}
                    </p>
                    <p className="text-[10px] text-slate-400">score</p>
                  </div>
                </div>

                {expandedId === c.id && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Diagnóstico
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic min-h-[4rem]">
                          {c.diagnosis || 'Sem diagnóstico disponível.'}
                        </p>
                      </div>

                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Histórico de Vagas
                        </p>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                          {c.history && c.history.length > 0 ? (
                            c.history.map((h) => (
                              <div
                                key={h.id}
                                className="flex justify-between items-center text-xs p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700"
                              >
                                <div className="font-bold text-slate-700 dark:text-slate-200">
                                  {h.public_jobs?.title || 'Vaga desconhecida'}
                                </div>
                                <div className="flex gap-2 items-center">
                                  <span className="text-emerald-600 font-black">
                                    {h.match_score}%
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                      h.status === 'approved'
                                        ? 'bg-green-100 text-green-700'
                                        : h.status === 'rejected'
                                          ? 'bg-rose-100 text-rose-700'
                                          : 'bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    {h.status || 'novo'}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400">
                              Nenhuma candidatura registrada.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Currículo {c.blind_candidate?.enabled ? 'Anonimizado' : 'Completo'}
                        </p>
                        <button className="text-[10px] font-black text-purple-600 uppercase">
                          Copiar Texto
                        </button>
                      </div>
                      <pre className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">
                        {c.cv_master ? c.cv_master.substring(0, 5000) : 'Currículo não disponível.'}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Candidates;
