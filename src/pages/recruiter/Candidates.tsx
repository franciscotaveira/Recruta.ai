import React, { useState, useEffect } from 'react';
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
  Lock,
  Eye,
} from 'lucide-react';
import { Candidate } from '../../types';
import { CandidateService, CreditService } from '../../services/mock';
import CreditActivationModal from '../../components/recruiter/CreditActivationModal';

const Candidates = () => {
  // State
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Credit Modal State
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // Load Data on Mount
  useEffect(() => {
    setCandidates(CandidateService.getAll());
    setWalletBalance(CreditService.getWallet().balance);
  }, []);

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.extractedData?.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- ACTIONS ---

  const handleOpenActivation = () => {
    // Refresh balance before showing modal
    setWalletBalance(CreditService.getWallet().balance);
    setIsCreditModalOpen(true);
  };

  const confirmActivation = () => {
    if (!selectedCandidate) return;

    const success = CreditService.consumeCredit(
      `Ativação de Candidato: ${selectedCandidate.name}`,
      selectedCandidate.id
    );

    if (success) {
      CandidateService.activateCandidate(selectedCandidate.id);
      // Refresh local state
      const updatedList = CandidateService.getAll();
      setCandidates(updatedList);
      setSelectedCandidate(updatedList.find((c) => c.id === selectedCandidate.id) || null);
      setWalletBalance(CreditService.getWallet().balance); // Update balance UI
      setIsCreditModalOpen(false);
      alert('Candidato ativado! Dados de contato liberados.');
    } else {
      alert('Erro ao processar ativação. Verifique seu saldo.');
    }
  };

  // --- RENDER ---

  return (
    <div className="space-y-6 relative h-full animate-fade-in">
      {/* CONFIRMATION MODAL */}
      <CreditActivationModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        onConfirm={confirmActivation}
        candidateName={selectedCandidate?.name || ''}
        currentBalance={walletBalance}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Banco de Talentos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Visualize diagnósticos.{' '}
            <span className="text-purple-600 font-bold">
              Ativar um candidato consome 1 crédito.
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* PIPELINE LIST */}
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
                <th className="px-6 py-4">Candidato</th>
                <th className="px-6 py-4">SCPD</th>
                <th className="px-6 py-4">Perfil Indicado</th>
                <th className="px-6 py-4">Origem</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ação</th>
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
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 text-xs font-bold">
                        {candidate.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {candidate.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          {candidate.isActivated ? (
                            <span className="text-emerald-500 flex items-center gap-0.5">
                              <CheckCircle size={10} /> Ativo
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-0.5">
                              <Lock size={10} /> Contato Oculto
                            </span>
                          )}
                        </div>
                      </div>
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
                  <td className="px-6 py-4">
                    <button className="text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline flex items-center gap-1">
                      <Eye size={14} /> Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER (VISÃO DO CANDIDATO) */}
      {selectedCandidate && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700 transform transition-transform duration-300 overflow-y-auto z-40 animate-fade-in-up">
          <div className="p-6 pb-24">
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

            {/* Status de Ativação (Banner) */}
            {!selectedCandidate.isActivated ? (
              <div className="bg-slate-900 dark:bg-slate-800 p-4 rounded-xl text-white mb-6 border border-slate-700 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={18} className="text-yellow-400" />
                  <h3 className="font-bold text-sm">Perfil Travado</h3>
                </div>
                <p className="text-xs text-slate-300 mb-4">
                  Para acessar contatos (WhatsApp) e iniciar triagem, você deve ativar este
                  candidato.
                </p>
                <button
                  onClick={handleOpenActivation}
                  className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Zap size={14} /> Ativar Candidato (-1 Crédito)
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-xl text-emerald-800 dark:text-emerald-200 mb-6 flex items-center gap-2">
                <CheckCircle size={18} />
                <span className="text-sm font-bold">Candidato Ativo. Contatos liberados.</span>
              </div>
            )}

            {/* Contatos (Blur se não ativo) */}
            <div
              className={`space-y-3 mb-6 ${!selectedCandidate.isActivated ? 'blur-sm select-none opacity-50 pointer-events-none' : ''}`}
            >
              <div className="flex items-center gap-3 text-sm">
                <MessageCircle size={16} className="text-green-500" />
                <span className="font-medium">
                  {selectedCandidate.phone || '+55 11 99999-9999'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileText size={16} className="text-blue-500" />
                <span className="font-medium">
                  {selectedCandidate.email || 'candidato@email.com'}
                </span>
              </div>
            </div>

            {/* 2.3.1 Resumo do Diagnóstico */}
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 p-4 rounded-xl mb-6">
              <h3 className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase mb-2 flex items-center gap-2">
                <Zap size={14} /> Diagnóstico da IA
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedCandidate.diagnosis ||
                  'Análise comportamental pendente. O candidato mostra fortes indícios técnicos no currículo.'}
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
                {/* ... other breakdown items ... */}
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
              </div>
            </div>

            {/* Ações Finais */}
            {selectedCandidate.isActivated && (
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold hover:opacity-90 transition-opacity">
                  Enviar Convite
                </button>
                <button className="flex-1 py-3 border border-slate-300 dark:border-slate-600 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                  Ver CV Original
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
