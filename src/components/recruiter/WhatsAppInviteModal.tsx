import React, { useState } from 'react';
import { X, Send, Phone, Loader2, CheckCircle, AlertCircle, Users, Briefcase } from 'lucide-react';
import { JobQueue } from '../../lib/JobQueue';

interface Props {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
  recruiterId: string;
  onSuccess?: (sessionId: string) => void;
}

const WhatsAppInviteModal: React.FC<Props> = ({
  open,
  onClose,
  jobId,
  jobTitle,
  companyName,
  recruiterId,
  onSuccess,
}) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [scenario, setScenario] = useState<'direct' | 'talent_bank'>('direct');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  if (!open) return null;

  const handleSend = async () => {
    if (!phone.trim()) return;
    setSending(true);
    setResult(null);

    try {
      const job = await JobQueue.createJob('recruiter.invite_candidate', {
        phone: phone.replace(/\D/g, ''),
        name: name.trim() || '',
        jobId,
        recruiterId,
        jobTitle,
        companyName,
        scenario,
      }, recruiterId);

      if (!job) throw new Error("Falha ao agendar disparo de convite");

      setResult({
        ok: true,
        msg: `Ação de convite enfileirada! O WhatsApp disparará o convite em instantes.`,
      });
      
      setPhone('');
      setName('');
      
      // Since we don't have the sessionId immediately anymore, we use the jobId as reference or wait
      setTimeout(() => {
        onSuccess?.(job.id);
      }, 1500);

    } catch (err: any) {
      setResult({ ok: false, msg: err.message || 'Erro ao enviar convite.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <Phone size={18} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Convite via WhatsApp</h3>
              <p className="text-xs text-slate-500">
                {jobTitle} • {companyName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
            {/* Scenario Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setScenario('direct')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-bold ${
                scenario === 'direct'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Briefcase size={20} />
              Convite Direto
              <span className="text-[10px] font-normal opacity-70">Vaga publicada</span>
            </button>
            <button
              type="button"
              onClick={() => setScenario('talent_bank')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-bold ${
                scenario === 'talent_bank'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Users size={20} />
              Banco de Talentos
              <span className="text-[10px] font-normal opacity-70">Interesse anterior</span>
            </button>
          </div>

          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <p className="text-sm text-green-800 dark:text-green-300 font-medium">
              {scenario === 'talent_bank'
                ? 'Mensagem de re-engajamento: "A empresa iniciou um processo para a vaga que você demonstrou interesse."'
                : 'O candidato receberá um convite direto para a triagem. Ao responder SIM, começará as perguntas por áudio.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Telefone do candidato
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5549999999999"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">Formato: código do país + DDD + número</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Nome (opcional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do candidato"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {result && (
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                result.ok
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
              }`}
            >
              {result.ok ? (
                <CheckCircle
                  size={18}
                  className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
                />
              ) : (
                <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              )}
              <p
                className={`text-sm font-medium ${result.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}
              >
                {result.msg}
              </p>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !phone.trim()}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg"
          >
            {sending ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Enviando...
              </>
            ) : (
              <>
                <Send size={18} /> Enviar Convite
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppInviteModal;
