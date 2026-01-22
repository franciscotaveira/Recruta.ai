import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Upload, ArrowRight, 
  CheckCircle, XCircle, Zap, Search, ChevronRight, Database, FileSpreadsheet, CreditCard, Plus, FileText, AlertCircle, Coins, X
} from 'lucide-react';
import { MOCK_JOBS } from '../../constants';
import { Link, useNavigate } from 'react-router-dom';
import { CreditService, CandidateService } from '../../services/mock';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  // State for dynamic data
  const [wallet, setWallet] = useState(CreditService.getWallet());
  
  // Bulk Activation State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [detectedCount, setDetectedCount] = useState(0);
  const [activationQuantity, setActivationQuantity] = useState(0);
  const [targetJob, setTargetJob] = useState('Analista de Marketing Pleno');

  // Refresh wallet on focus/mount
  useEffect(() => {
    setWallet(CreditService.getWallet());
  }, []);

  // Handlers
  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      // Simulate reading file and finding contacts
      const mockCount = Math.floor(Math.random() * 50) + 20; // 20-70 candidates
      setDetectedCount(mockCount);
      setActivationQuantity(Math.floor(mockCount / 2)); // Default to half
      setIsBulkModalOpen(true);
    }
  };

  const handleConfirmBulk = () => {
    const cost = activationQuantity;
    
    if (wallet.balance < cost) {
      alert("Saldo insuficiente para esta operação.");
      navigate('/recruiter/billing');
      return;
    }

    const success = CreditService.consumeBatchCredits(
      cost, 
      `Triagem em Massa: ${activationQuantity} cvs para ${targetJob}`
    );

    if (success) {
      // Create mock candidates
      CandidateService.addBatchCandidates(activationQuantity, targetJob);
      
      // Update UI
      setWallet(CreditService.getWallet());
      setIsBulkModalOpen(false);
      setUploadFile(null);
      alert(`Sucesso! ${activationQuantity} candidatos foram enviados para triagem e o valor foi debitado.`);
      navigate('/recruiter/candidates');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fade-in relative">
      
      {/* BULK ACTIVATION MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="text-yellow-500" /> Configurar Triagem
              </h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-red-500">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Arquivo identificado:</p>
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-green-600" />
                  {uploadFile?.name}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <CheckCircle size={14} className="text-emerald-500" />
                  {detectedCount} contatos válidos encontrados
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Quantas triagens você quer realizar agora?
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max={detectedCount} 
                    value={activationQuantity} 
                    onChange={(e) => setActivationQuantity(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="w-20 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 font-bold text-center text-slate-900 dark:text-white">
                    {activationQuantity}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Você pode processar o restante da lista depois.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase text-yellow-800 dark:text-yellow-500">Custo da Operação</span>
                  <span className="font-black text-xl text-slate-900 dark:text-white">{activationQuantity} Créditos</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>Saldo Atual: {wallet.balance}</span>
                  <span>Saldo Final: {wallet.balance - activationQuantity}</span>
                </div>
                {wallet.balance < activationQuantity && (
                  <div className="mt-3 text-xs font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} /> Saldo insuficiente. Recarregue para continuar.
                  </div>
                )}
              </div>

              <button 
                onClick={handleConfirmBulk}
                disabled={wallet.balance < activationQuantity || activationQuantity === 0}
                className="w-full py-4 bg-slate-900 dark:bg-purple-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center justify-center gap-2"
              >
                {wallet.balance < activationQuantity ? 'Recarregar Carteira' : 'Pagar e Ativar'} 
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DINÂMICO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">TechCorp Brasil</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Inteligência Artificial processou 12 novos perfis hoje.</p>
        </div>
        <div className="flex gap-3">
             {/* WALLET WIDGET */}
             <Link to="/recruiter/billing" className="hidden sm:flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-purple-500 transition-colors">Saldo Decisório</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{wallet.balance} CR</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <CreditCard size={16} />
                </div>
             </Link>

            <button className="bg-slate-900 dark:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
                <Plus size={18} /> Novo Processo
            </button>
        </div>
      </div>

      {/* KPIS REFINADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                 <span className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Processos Ativos</span>
                 <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600"><Briefcase size={20} /></div>
             </div>
             <p className="text-4xl font-black text-slate-900 dark:text-white">3</p>
             <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                 <ArrowRight size={12} className="-rotate-45" /> +2 essa semana
             </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-3">
             <div className="flex justify-between items-center mb-6">
                 <span className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Funil de Inteligência (Triagem)</span>
                 <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600"><Zap size={20} /></div>
             </div>
             <div className="grid grid-cols-3 gap-8 text-center sm:text-left divide-x divide-slate-100 dark:divide-slate-700">
                 <div className="px-4">
                     <p className="text-3xl font-black text-slate-900 dark:text-white">150</p>
                     <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Análises Realizadas</p>
                 </div>
                 <div className="px-8">
                     <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">45</p>
                     <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 flex items-center gap-1">
                         <CheckCircle size={12} className="text-emerald-500" /> Qualificados (Match)
                     </p>
                 </div>
                 <div className="px-8">
                     <p className="text-3xl font-black text-slate-300 dark:text-slate-600">105</p>
                     <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 flex items-center gap-1">
                         <XCircle size={12} className="text-slate-400" /> Descartados por IA
                     </p>
                 </div>
             </div>
          </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          
          {/* PIPELINE POR VAGA */}
          <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Pipeline de Candidatos</h2>
                  <button onClick={() => navigate('/recruiter/candidates')} className="text-xs font-bold text-purple-600 hover:underline">Ver Banco de Talentos</button>
              </div>

              <div className="space-y-6">
                  {MOCK_JOBS.map(job => (
                      <div key={job.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all hover:shadow-md">
                          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                  <h3 className="font-black text-slate-900 dark:text-white text-xl">{job.title}</h3>
                                  <p className="text-xs text-slate-500 font-medium">{job.location} • Criado em {job.postedDate}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{job.applicantsCount}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Em Triagem</p>
                                </div>
                                <ChevronRight size={20} className="text-slate-300" />
                              </div>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-900/40 p-6">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  {[
                                    { name: 'Francisco Taveira', score: 92, status: 'Aprovação Pendente', initial: 'FT' },
                                    { name: 'Ana Martinez', score: 88, status: 'Entrevista Agendada', initial: 'AM' },
                                    { name: 'Carlos Pereira', score: 85, status: 'Triagem Inicial', initial: 'CP' }
                                  ].map((cand, i) => (
                                      <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 group hover:border-purple-500 cursor-pointer transition-all shadow-sm">
                                          <div className="flex items-center gap-3 mb-3">
                                              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-purple-600 text-white flex items-center justify-center font-black text-[10px]">{cand.initial}</div>
                                              <div>
                                                <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-purple-600 transition-colors">{cand.name}</p>
                                                <p className="text-[10px] text-emerald-500 font-bold">Match: {cand.score}%</p>
                                              </div>
                                          </div>
                                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">{cand.status}</span>
                                      </div>
                                  ))}
                              </div>
                              <button className="w-full mt-6 py-3 text-xs text-slate-500 dark:text-slate-400 font-bold border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                  Ver detalhes dos {job.applicantsCount} perfis
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* COLUNA LATERAL - TRIAGEM DE BASE PRÓPRIA (REFINADO) */}
          <div className="space-y-6">
              <div className="bg-slate-900 dark:bg-purple-900 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden border border-slate-700 dark:border-purple-800">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-[80px] opacity-20"></div>
                  
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <Database className="text-yellow-400" size={24} />
                    <div>
                        <h2 className="text-xl font-black leading-none">Reaquecimento</h2>
                        <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">Base Legada</span>
                    </div>
                  </div>
                  
                  <p className="text-indigo-100 text-xs mb-6 relative z-10 font-medium leading-relaxed">
                      Transforme seus PDFs antigos em candidatos ativos. <span className="text-white font-bold">Importe e pague apenas por quem ativar.</span>
                  </p>

                  <div className="space-y-4 relative z-10">
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">1. Vaga Destino</label>
                          <select 
                            value={targetJob}
                            onChange={(e) => setTargetJob(e.target.value)}
                            className="w-full bg-slate-800 dark:bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-3 focus:ring-purple-500 outline-none cursor-pointer"
                          >
                              <option>Analista de Marketing Pleno</option>
                              <option>Coordenador de Projetos</option>
                          </select>
                      </div>

                      {/* Dropzone Style Update */}
                      <div className="relative">
                        <input 
                          type="file" 
                          accept=".csv,.xlsx,.pdf" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          onChange={handleFileDrop}
                        />
                        <div className="border-2 border-dashed border-slate-600 hover:border-yellow-400 bg-slate-800/50 hover:bg-slate-800 rounded-xl p-6 text-center transition-all group relative z-10 pointer-events-none">
                            <div className="flex justify-center gap-2 mb-2 text-slate-400 group-hover:text-yellow-400 transition-colors">
                                <FileSpreadsheet size={24} />
                                <FileText size={24} />
                            </div>
                            <p className="text-xs text-white font-bold">Arraste lista ou PDFs</p>
                            <p className="text-[9px] text-slate-400 mt-1">Cobrança feita na ativação.</p>
                        </div>
                      </div>

                      <div className="text-[10px] text-center text-slate-400">
                        Seu saldo: <strong className="text-white">{wallet.balance} CR</strong>
                      </div>
                  </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="font-black text-slate-900 dark:text-white mb-6 uppercase text-[10px] tracking-widest text-slate-400">Atalhos</h3>
                  <div className="space-y-3">
                      <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
                          <span className="flex items-center gap-3"><Briefcase size={18} className="text-slate-400" /> Novo Processo</span>
                          <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
                          <span className="flex items-center gap-3"><Search size={18} className="text-slate-400" /> Buscar Talentos</span>
                          <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default RecruiterDashboard;