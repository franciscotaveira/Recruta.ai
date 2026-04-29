import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Activity, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Mic,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  AlertTriangle
} from 'lucide-react';

interface LiveSession {
  id: string;
  candidate_name: string;
  candidate_phone: string;
  state: string;
  current_question_idx: number;
  last_activity: string;
  responses: any[];
  job_title?: string;
}

const LiveFeed: React.FC = () => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveSessions();

    const channel = supabase
      .channel('live_triage')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_sessions' },
        () => fetchActiveSessions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveSessions = async () => {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select('*, jobs(title)')
      .in('state', ['invited', 'accepted', 'questioning', 'mic_check', 'consent_pending'])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching live sessions:', error);
    } else {
      setSessions(data.map(s => ({
        ...s,
        job_title: s.jobs?.title
      })));
    }
    setLoading(false);
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="text-emerald-500" size={16} />;
      case 'neutral': return <Meh className="text-slate-400" size={16} />;
      case 'negative': return <Frown className="text-orange-500" size={16} />;
      case 'frustrated': return <AlertTriangle className="text-red-500" size={16} />;
      default: return <Clock className="text-slate-300" size={16} />;
    }
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'questioning':
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">Entrevistando</span>;
      case 'accepted':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">Iniciado</span>;
      case 'mic_check':
        return <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase tracking-wider">Teste de Áudio</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-bold uppercase tracking-wider">{state}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-bold text-sm mb-1">
            <Activity size={16} className="animate-pulse" />
            <span>OPERATIONAL MONITORING</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            Feed em Tempo Real
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Acompanhe as triagens neurais em execução agora.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="s-glass px-4 py-2 border-white/10 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {sessions.length} Ativos
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Activity className="text-purple-500 animate-spin" size={48} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="s-glass p-20 text-center border-dashed border-2 border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="text-slate-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nenhuma atividade no momento</h3>
          <p className="text-slate-500 mt-2">Assim que um candidato iniciar uma triagem, ela aparecerá aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="s-glass border-white/5 overflow-hidden flex flex-col group hover:border-purple-500/30 transition-all duration-500">
              {/* Card Header */}
              <div className="p-6 border-b border-white/5 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white font-bold text-sm">
                      {session.candidate_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                        {session.candidate_name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {session.job_title || 'Sem vaga vinculada'}
                      </p>
                    </div>
                  </div>
                  {getStateBadge(session.state)}
                </div>

                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(session.last_activity || Date.now()).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center gap-1 text-purple-500">
                    <Mic size={12} />
                    Q{session.current_question_idx + 1} de 5
                  </div>
                </div>
              </div>

              {/* Card Body - Live Transcript */}
              <div className="p-6 flex-1 bg-slate-950/50 min-h-[160px] relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                
                <div className="space-y-4">
                  {session.responses && session.responses.length > 0 ? (
                    session.responses.slice(-2).map((res, idx) => (
                      <div key={idx} className={`space-y-1 ${idx === 1 ? 'opacity-100' : 'opacity-40'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {res.system ? 'SISTEMA' : 'CANDIDATO'}
                          </span>
                          {res.sentiment && getSentimentIcon(res.sentiment)}
                        </div>
                        <p className="text-sm text-slate-300 italic leading-relaxed">
                          "{res.text || res.transcription || '...'}"
                        </p>
                        {res.keyInsight && (
                          <div className="text-[10px] bg-purple-500/10 text-purple-400 py-0.5 px-2 rounded-md inline-block">
                            Insight: {res.keyInsight}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 py-8">
                      <TrendingUp className="mb-2" size={24} />
                      <span className="text-xs font-bold uppercase tracking-tighter">Aguardando sinal neural...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer - Visual Metrics */}
              <div className="px-6 py-4 bg-slate-900 flex items-center justify-between">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className={`h-1 w-8 rounded-full ${i <= (session.current_question_idx + 1) ? 'bg-purple-500' : 'bg-slate-700'}`} 
                    />
                  ))}
                </div>
                <button className="text-[10px] font-black text-white hover:text-purple-400 transition-colors uppercase tracking-widest flex items-center gap-1">
                  INTERVIR <Zap size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveFeed;
