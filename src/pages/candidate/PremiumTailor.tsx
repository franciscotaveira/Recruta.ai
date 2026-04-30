import React, { useState, useEffect } from 'react';
import { getCandidateWallet, tailorCV, buyCandidateCredits } from '../../services/api';
import { Sparkles, Loader2, Download, Briefcase, FileText, CreditCard } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PremiumTailor: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tailoredCV, setTailoredCV] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchWallet = async () => {
    try {
      const res = await getCandidateWallet();
      setBalance(res.balance);
    } catch (err) {
      console.error('Error fetching wallet:', err);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      setError('Por favor, cole a descrição da vaga alvo.');
      return;
    }

    if (balance !== null && balance <= 0) {
      setError('Você não tem créditos suficientes. Compre mais para continuar.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const res = await tailorCV(jobDescription);
      setTailoredCV(res.markdown);
      setBalance(res.balanceAfter);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar o currículo premium. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyCredits = async () => {
    try {
      const res = await buyCandidateCredits();
      window.location.href = res.checkoutUrl;
    } catch (err) {
      console.error('Error buying credits', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            Currículo Premium <Sparkles className="text-yellow-500 w-6 h-6" />
          </h1>
          <p className="text-slate-500 mt-2">
            Nossa IA usa suas histórias de áudio para refatorar seu currículo perfeitamente para a vaga alvo.
          </p>
        </div>
        
        {balance !== null && (
          <div className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Seus Créditos</span>
              <span className="font-black text-xl">{balance} <span className="text-sm font-normal text-slate-400">restantes</span></span>
            </div>
            {balance <= 0 && (
              <button 
                onClick={handleBuyCredits}
                className="bg-yellow-500 hover:bg-yellow-400 text-yellow-950 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <CreditCard size={16} /> Comprar (R$ 10)
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[700px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vaga Alvo</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Cole a descrição completa da vaga que você deseja. A IA vai analisar os requisitos e reescrever sua experiência focando no que o recrutador quer ler.
          </p>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Ex: Desenvolvedor Front-end Senior. Requisitos: Experiência com React, TypeScript, testes automatizados e liderança de equipe técnica..."
            className="flex-1 w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-purple-500 outline-none"
          />
          
          {error && <div className="mt-4 text-red-500 text-sm font-medium">{error}</div>}

          <button
            onClick={handleTailor}
            disabled={isProcessing || !jobDescription.trim() || (balance !== null && balance <= 0)}
            className="mt-6 w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? (
              <><Loader2 size={20} className="animate-spin" /> Refatorando com IA...</>
            ) : (
              <><Sparkles size={20} /> Refatorar Meu Currículo (Custa 1 Crédito)</>
            )}
          </button>
        </div>

        {/* Right Column: Output */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[700px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Seu Novo Currículo</h2>
            </div>
            {tailoredCV && (
              <button 
                onClick={() => {
                  const blob = new Blob([tailoredCV], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'Curriculo_Refatorado_Premium.md';
                  a.click();
                }}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 text-sm font-bold bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl transition-colors"
              >
                <Download size={16} /> Baixar (.md)
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 prose prose-slate dark:prose-invert max-w-none border border-slate-200 dark:border-slate-800">
            {tailoredCV ? (
              <ReactMarkdown>{tailoredCV}</ReactMarkdown>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                <Sparkles size={48} className="mb-4 opacity-20" />
                <p>Cole a vaga e clique em refatorar para ver a mágica acontecer.<br/>Seu histórico de áudio será injetado automaticamente.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumTailor;
