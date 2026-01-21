import React from 'react';
import { Clock, CheckCircle, XCircle, FileText, PlayCircle } from 'lucide-react';
import { MOCK_CANDIDATES } from '../constants';

const PendingReviews = () => {
  // Filter for processing or error status for this mock view
  const pendingCandidates = MOCK_CANDIDATES.filter(c => c.status === 'processing' || c.status === 'error');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Revisão Pendente</h1>
        <p className="text-slate-500 text-sm">Candidatos que precisam de análise manual ou tiveram problemas no processamento.</p>
      </div>

      <div className="grid gap-4">
        {pendingCandidates.map((candidate) => (
          <div key={candidate.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
            
            {/* Left Column: Candidate Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        {candidate.name.substring(0, 2)}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{candidate.name}</h3>
                        <p className="text-xs text-slate-500">Iniciado em {candidate.date} • {candidate.phone}</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    candidate.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                }`}>
                    {candidate.status === 'processing' ? 'Em Análise' : 'Falha na IA'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-xs text-slate-400 mb-1">Motivo da Pendência</span>
                    <span className="font-medium text-slate-700">
                        {candidate.status === 'error' 
                            ? 'Áudio com ruído excessivo ou formato não suportado.' 
                            : 'Aguardando transcrição final do áudio.'}
                    </span>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-xs text-slate-400 mb-1">Plano Solicitado</span>
                    <span className="font-medium text-slate-700 uppercase">{candidate.plan}</span>
                 </div>
              </div>

              <div className="flex gap-3">
                  <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                      <PlayCircle size={16} /> Ouvir Áudio Original
                  </button>
                  <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium">
                      <FileText size={16} /> Ver Log do Sistema
                  </button>
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="md:w-64 flex flex-col justify-center gap-3 md:border-l md:border-slate-100 md:pl-6">
                <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                    <CheckCircle size={16} /> Aprovar Manualmente
                </button>
                <button className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                    <Clock size={16} /> Reprocessar
                </button>
                <button className="w-full py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                    <XCircle size={16} /> Rejeitar / Cancelar
                </button>
            </div>

          </div>
        ))}

        {pendingCandidates.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <CheckCircle className="mx-auto text-green-500 mb-3" size={32} />
                <h3 className="text-lg font-medium text-slate-900">Tudo limpo!</h3>
                <p className="text-slate-500">Não há revisões pendentes no momento.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PendingReviews;