import { JobQueue, Job } from '../../lib/JobQueue';
import { IntentButton } from './IntentButton';
import { useCandidateDashboard } from '../../hooks/useCandidateDashboard';

export const GovernanceChat = () => {
  const { profile } = useCandidateDashboard();
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', text: 'Bem-vindo ao Centro de Comando de Carreira. Como posso otimizar seu perfil hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const loadJobs = async () => {
      const allJobs = await JobQueue.listJobs();
      setJobs(allJobs);
    };
    loadJobs();

    const unsubscribe = JobQueue.subscribe((updatedJob) => {
      setJobs(prev => {
        const filtered = prev.filter(j => j.id !== updatedJob.id);
        return [updatedJob, ...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      });
    });
    return () => unsubscribe();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), role: 'user', text: input }]);
    setInput('');
    // Simular resposta da IA sugerindo uma ação
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        text: 'Analisei seu pedido. Recomendo rodar uma análise profunda de CV para identificar lacunas profissionais.',
        action: 'candidate.analyze_cv'
      }]);
    }, 1000);
  };

  return (
    <div className="flex h-full bg-slate-950 text-slate-100 overflow-hidden rounded-3xl border border-slate-800 shadow-2xl">
      {/* Sidebar - Histórico de Jobs/Transações */}
      <div className={`transition-all duration-300 border-r border-slate-800 bg-slate-900/50 flex flex-col ${isHistoryOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <History size={18} className="text-slate-400" />
          <span className="font-bold text-xs uppercase tracking-wider">Audit Trail</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {jobs.map(job => (
            <div key={job.id} className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-all text-[10px]">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-purple-400 font-bold">{job.actionId.split('.')[1]}</span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                  job.status === 'completed' ? 'bg-green-500/10 text-green-400' : 
                  job.status === 'pending_approval' ? 'bg-amber-500/10 text-amber-400' : 
                  job.status === 'processing' ? 'bg-blue-500/10 text-blue-400 animate-pulse' : 'bg-slate-700 text-slate-400'
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="text-slate-500 truncate font-mono">{job.id.substring(0, 8)}...</div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="text-center py-10 text-slate-600 text-[10px] italic">
              Nenhuma transação registrada
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col relative h-full">
        <button 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="absolute left-6 top-6 z-20 p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 rounded-xl transition-all border border-slate-700/50 backdrop-blur-md"
        >
          <History size={20} />
        </button>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth pt-24">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-5 max-w-2xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl border ${
                msg.role === 'ai' 
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-purple-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {msg.role === 'ai' ? <Bot size={24} /> : <User size={24} />}
              </div>
              <div className={`flex flex-col gap-4 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-6 rounded-[2rem] text-sm leading-relaxed shadow-xl ${
                  msg.role === 'ai' 
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none' 
                    : 'bg-purple-600 text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
                {msg.role === 'ai' && (msg as any).action && (
                  <div className="animate-in fade-in zoom-in slide-in-from-top-2 duration-700">
                    <IntentButton
                      actionId="candidate.analyze_cv"
                      payload={{ 
                        cv_id: profile?.id || 'default_profile', 
                        target_role: profile?.target_role || 'Developer' 
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-600/20"
                    >
                      Confirmar Análise
                    </IntentButton>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="p-8 md:p-12 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-30 transition duration-1000" />
            <div className="relative flex items-center">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Como posso ajudar na sua carreira?"
                className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 text-slate-100 px-8 py-6 rounded-[2rem] outline-none focus:border-purple-500/50 transition-all text-sm shadow-2xl placeholder:text-slate-600"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="absolute right-3 p-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:hover:bg-purple-600 text-white rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/20"
              >
                <Send size={22} />
              </button>
            </div>
          </div>
          <p className="text-[9px] font-black text-center text-slate-800 mt-6 uppercase tracking-[0.4em]">
            Governance AI Engine <span className="text-slate-900 mx-2">|</span> Powered by MCT OS v4
          </p>
        </div>
      </div>
    </div>
  );
};
