import React from 'react';
import { X, AlertCircle, CheckCircle, Lock, Coins } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  candidateName: string;
  currentBalance: number;
}

const CreditActivationModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, candidateName, currentBalance }) => {
  if (!isOpen) return null;

  const hasBalance = currentBalance >= 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800 p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400">
                <Lock size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Ativar Candidato</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
            Você está prestes a desbloquear os dados de contato (WhatsApp/Email) e habilitar o convite para entrevista de <strong className="text-slate-900 dark:text-white">{candidateName}</strong>.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 mb-6">
             <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase text-slate-500">Custo da Ação</span>
                <span className="font-bold text-red-500">-1 Crédito</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-slate-500">Seu Saldo Atual</span>
                <span className={`font-bold ${hasBalance ? 'text-emerald-500' : 'text-red-500'}`}>
                    {currentBalance} Créditos
                </span>
             </div>
          </div>

          {!hasBalance && (
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 rounded-lg flex items-start gap-3 mb-4">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-300">
                    Você não possui créditos suficientes. Recarregue sua carteira para continuar.
                </p>
             </div>
          )}

          <div className="flex gap-3">
            <button 
                onClick={onClose}
                className="flex-1 py-3 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={onConfirm}
                disabled={!hasBalance}
                className="flex-1 py-3 bg-slate-900 dark:bg-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {hasBalance ? (
                    <>Confirmar (-1 <Coins size={14} />)</>
                ) : (
                    'Saldo Insuficiente'
                )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreditActivationModal;