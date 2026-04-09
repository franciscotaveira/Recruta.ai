import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  X,
  CheckCircle,
  XCircle,
  User,
  FileText,
  Zap,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';
import { MOCK_CANDIDATES } from '../constants';
import { Candidate } from '../types';

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const filteredCandidates = MOCK_CANDIDATES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.extractedData?.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simulação de Feedback (Spec 2.5)
  const handleDecision = (decision: 'hire' | 'reject') => {
    alert(
      decision === 'hire'
        ? "Candidato Contratado! Feedback enviado: 'Diagnóstico ajudou na decisão.'"
        : 'Candidato dispensado.'
    );
    setSelectedCandidate(null);
  };

  return (
    <div className="space-y-6 relative h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Banco de Talentos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Visualize diagnósticos e tome decisões rápidas.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* 2.2 PIPELINE LIST */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white dark:placeholder-slate-400"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-600">
            <Filter size={16} /> Filtros
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Nome / Contato</th>
                <th className="px-6 py-4">SCPD</th>
                <th className="px-6 py-4">Perfil Indicado</th>
                <th className="px-6 py-4">Origem</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredCandidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`cursor-pointer transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/10 ${selectedCandidate?.id === candidate.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{candidate.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {candidate.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {candidate.score > 0 ? (
                      <span
                        className={`font-bold ${candidate.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}
                      >
                        {candidate.score}/100
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    {candidate.extractedData?.role || 'Em análise'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {candidate.plan === 'pro' ? (
                        <Zap size={12} className="text-purple-500" />
                      ) : (
                        <User size={12} />
                      )}
                      {candidate.plan === 'pro' ? 'Base Ativa' : 'Candidatura'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        candidate.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : candidate.status === 'processing'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {candidate.status === 'completed' ? 'Pronto' : 'Processando'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline">
                    Ver Análise
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2.3 VISÃO DO CANDIDATO (Drawer) */}
      {selectedCandidate && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700 transform transition-transform duration-300 overflow-y-auto z-50">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedCandidate.name}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2 mt-1">
                  <User size={14} /> {selectedCandidate.extractedData?.role || 'Perfil em análise'}
                </p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* 2.3.1 Resumo do Diagnóstico */}
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 p-4 rounded-xl mb-6">
              <h3 className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase mb-2 flex items-center gap-2">
                <Zap size={14} /> Diagnóstico da IA
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedCandidate.diagnosis ||
                  'Análise comportamental pendente. O candidato mostra fortes indícios técnicos no currículo, mas a avaliação de soft skills via áudio ainda não foi concluída.'}
              </p>
            </div>

            {/* 2.3.2 SCPD Breakdown */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Score de Clareza (SCPD)
                </h3>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedCandidate.score}/100
                </span>
              </div>
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Clareza de trajetória</span>
                  {selectedCandidate.scpdBreakdown?.clarity ? (
                    <CheckCircle size={18} className="text-emerald-500" />
                  ) : (
                    <AlertTriangle size={18} className="text-amber-500" />
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Evidência de resultados
                  </span>
                  {selectedCandidate.scpdBreakdown?.evidence ? (
                    <CheckCircle size={18} className="text-emerald-500" />
                  ) : (
                    <AlertTriangle size={18} className="text-amber-500" />
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Foco em cargo-alvo</span>
                  {selectedCandidate.scpdBreakdown?.focus ? (
                    <CheckCircle size={18} className="text-emerald-500" />
                  ) : (
                    <AlertTriangle size={18} className="text-amber-500" />
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Atualização recente</span>
                  {selectedCandidate.scpdBreakdown?.freshness ? (
                    <CheckCircle size={18} className="text-emerald-500" />
                  ) : (
                    <XCircle size={18} className="text-red-500" />
                  )}
                </div>
              </div>
            </div>

            {/* 2.3.3 Currículo & Ações */}
            <div className="flex gap-3 mb-8">
              <button className="flex-1 py-3 border border-slate-300 dark:border-slate-600 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors">
                <FileText size={18} /> Ver CV Original
              </button>
              <button className="flex-1 py-3 border border-whatsapp border-opacity-50 text-whatsapp hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                <MessageCircle size={18} /> WhatsApp
              </button>
            </div>

            {/* 2.5 Feedback Simples (Decisão) */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Decisão Rápida</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleDecision('reject')}
                  className="py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg font-bold text-sm transition-colors"
                >
                  Dispensar
                </button>
                <button
                  onClick={() => handleDecision('hire')}
                  className="py-3 bg-slate-900 dark:bg-purple-600 text-white hover:bg-slate-800 dark:hover:bg-purple-500 rounded-lg font-bold text-sm transition-colors shadow-lg"
                >
                  Aprovar / Contratar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
