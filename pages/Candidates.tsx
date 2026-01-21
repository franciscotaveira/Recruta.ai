import React, { useState } from 'react';
import { Search, Filter, Download, X, CheckCircle, XCircle, User, FileText, Zap, MessageCircle, AlertTriangle } from 'lucide-react';
import { MOCK_CANDIDATES } from '../constants';
import { Candidate } from '../types';

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  const filteredCandidates = MOCK_CANDIDATES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.extractedData?.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simulação de Feedback (Spec 2.5)
  const handleDecision = (decision: 'hire' | 'reject') => {
    alert(decision === 'hire' ? "Candidato Contratado! Feedback enviado: 'Diagnóstico ajudou na decisão.'" : "Candidato dispensado.");
    setSelectedCandidate(null);
  };

  return (
    <div className="space-y-6 relative h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Banco de Talentos</h1>
          <p className="text-slate-500 text-sm">Visualize diagnósticos e tome decisões rápidas.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
             <Download size={16} /> Exportar CSV
           </button>
        </div>
      </div>

      {/* 2.2 PIPELINE LIST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou cargo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-100">
             <Filter size={16} /> Filtros
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nome / Contato</th>
                <th className="px-6 py-4">SCPD</th>
                <th className="px-6 py-4">Perfil Indicado</th>
                <th className="px-6 py-4">Origem</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map((candidate) => (
                <tr 
                  key={candidate.id} 
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`cursor-pointer transition-colors hover:bg-purple-50 ${selectedCandidate?.id === candidate.id ? 'bg-purple-50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{candidate.name}</div>
                    <div className="text-xs text-slate-500">{candidate.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    {candidate.score > 0 ? (
                      <span className={`font-bold ${candidate.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {candidate.score}/100
                      </span>
                    ) : <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-6 py-4">
                     {candidate.extractedData?.role || "Em análise"}
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {candidate.plan === 'pro' ? <Zap size={12} className="text-purple-500" /> : <User size={12} />}
                        {candidate.plan === 'pro' ? 'Base Ativa' : 'Candidatura'}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      candidate.status === 'completed' ? 'bg-green-100 text-green-700' :
                      candidate.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {candidate.status === 'completed' ? 'Pronto' : 'Processando'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-blue-600 font-bold text-xs hover:underline">
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
        <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 overflow-y-auto z-50">
           <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedCandidate.name}</h2>
                    <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                       <User size={14} /> {selectedCandidate.extractedData?.role || 'Perfil em análise'}
                    </p>
                 </div>
                 <button onClick={() => setSelectedCandidate(null)} className="text-slate-400 hover:text-slate-700">
                    <X size={24} />
                 </button>
              </div>

              {/* 2.3.1 Resumo do Diagnóstico */}
              <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl mb-6">
                 <h3 className="text-xs font-bold text-purple-700 uppercase mb-2 flex items-center gap-2">
                    <Zap size={14} /> Diagnóstico da IA
                 </h3>
                 <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedCandidate.diagnosis || "Análise comportamental pendente. O candidato mostra fortes indícios técnicos no currículo, mas a avaliação de soft skills via áudio ainda não foi concluída."}
                 </p>
              </div>

              {/* 2.3.2 SCPD Breakdown */}
              <div className="mb-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900">Score de Clareza (SCPD)</h3>
                    <span className="text-2xl font-bold text-emerald-600">{selectedCandidate.score}/100</span>
                 </div>
                 <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-600">Clareza de trajetória</span>
                       {selectedCandidate.scpdBreakdown?.clarity 
                         ? <CheckCircle size={18} className="text-emerald-500" /> 
                         : <AlertTriangle size={18} className="text-amber-500" />}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-600">Evidência de resultados</span>
                       {selectedCandidate.scpdBreakdown?.evidence 
                         ? <CheckCircle size={18} className="text-emerald-500" /> 
                         : <AlertTriangle size={18} className="text-amber-500" />}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-600">Foco em cargo-alvo</span>
                       {selectedCandidate.scpdBreakdown?.focus 
                         ? <CheckCircle size={18} className="text-emerald-500" /> 
                         : <AlertTriangle size={18} className="text-amber-500" />}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-600">Atualização recente</span>
                       {selectedCandidate.scpdBreakdown?.freshness 
                         ? <CheckCircle size={18} className="text-emerald-500" /> 
                         : <XCircle size={18} className="text-red-500" />}
                    </div>
                 </div>
              </div>

              {/* 2.3.3 Currículo & Ações */}
              <div className="flex gap-3 mb-8">
                 <button className="flex-1 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2">
                    <FileText size={18} /> Ver CV Original
                 </button>
                 <button className="flex-1 py-3 border border-whatsapp border-opacity-50 text-whatsapp hover:bg-green-50 rounded-lg font-bold flex items-center justify-center gap-2">
                    <MessageCircle size={18} /> WhatsApp
                 </button>
              </div>

              {/* 2.5 Feedback Simples (Decisão) */}
              <div className="border-t border-slate-100 pt-6">
                 <h3 className="font-bold text-slate-900 mb-4">Decisão Rápida</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                       onClick={() => handleDecision('reject')}
                       className="py-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold text-sm transition-colors"
                    >
                       Dispensar
                    </button>
                    <button 
                       onClick={() => handleDecision('hire')}
                       className="py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-bold text-sm transition-colors shadow-lg"
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