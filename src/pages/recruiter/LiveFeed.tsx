import React, { useEffect, useState, useMemo } from 'react';
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
  AlertTriangle,
  RefreshCw,
  Briefcase,
  LayoutDashboard,
  Bell,
  Search,
  Filter,
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
  match_score?: number;
}

interface SystemEvent {
  id: string;
  event: string;
  level: string;
  details: any;
  created_at: string;
}

const LiveFeed: React.FC = () => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'events'>('sessions');

  useEffect(() => {
    fetchActiveSessions();
    fetchLatestEvents();

    const sessionsChannel = supabase
      .channel('live_triage')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_sessions' }, () =>
        fetchActiveSessions()
      )
      .subscribe();

    const eventsChannel = supabase
      .channel('system_activity')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'system_logs' },
        (payload) => {
          setEvents((prev) => [payload.new as SystemEvent, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(eventsChannel);
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
      setSessions(
        data.map((s) => ({
          ...s,
          job_title: s.jobs?.title,
        }))
      );
    }
    setLoading(false);
  };

  const fetchLatestEvents = async () => {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) console.error(error);
    else setEvents(data || []);
  };

  const stats = useMemo(() => {
    const total = sessions.length;
    const interviewing = sessions.filter((s) => s.state === 'questioning').length;
    const avgProgress =
      sessions.length > 0
        ? Math.round(
            (sessions.reduce((acc, s) => acc + (s.current_question_idx + 1), 0) /
              (sessions.length * 5)) *
              100
          )
        : 0;

    return { total, interviewing, avgProgress };
  }, [sessions]);

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="text-emerald-400" size={14} />;
      case 'neutral':
        return <Meh className="text-slate-500" size={14} />;
      case 'negative':
        return <Frown className="text-orange-400" size={14} />;
      case 'frustrated':
        return <AlertTriangle className="text-red-400" size={14} />;
      default:
        return <Clock className="text-slate-600" size={14} />;
    }
  };

  const getStateBadge = (state: string) => {
    const styles: Record<string, string> = {
      questioning: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse',
      accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      mic_check: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      invited: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${styles[state] || styles.invited}`}
      >
        {state === 'questioning' ? 'Brain Active' : state}
      </span>
    );
  };

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-20 animate-fade-in px-4 md:px-0">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)]" />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 pt-6">
        <div className="xl:col-span-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 s-glass border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
            <Activity size={12} className="animate-pulse" /> Operational Command
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight font-heading leading-none">
            Live{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-400">
              Control
            </span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Monitoramento neural de triagens em tempo real.
          </p>
        </div>

        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="s-glass p-6 border-indigo-500/10 flex flex-col justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Sessões Ativas
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl font-black text-white">{stats.total}</span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">
                {stats.interviewing} em entrevista
              </span>
            </div>
          </div>
          <div className="s-glass p-6 border-purple-500/10 flex flex-col justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Progresso Médio
            </span>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${stats.avgProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">
              {stats.avgProgress}% da trilha concluída
            </span>
          </div>
          <div className="s-glass p-6 border-emerald-500/10 flex flex-col justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Sinal de IA
            </span>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-1 h-4 rounded-full ${i <= 4 ? 'bg-emerald-500' : 'bg-slate-700 animate-pulse'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest ml-2">
                Sovereign Stable
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sessions' ? 'text-white border-b-2 border-indigo-500 pb-6 -mb-6' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Candidatos On-line
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`lg:hidden text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'events' ? 'text-white border-b-2 border-indigo-500 pb-6 -mb-6' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Atividade Global
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {sessions.slice(0, 3).map((s, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[8px] font-black text-white uppercase"
                  >
                    {s.candidate_name.charAt(0)}
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {sessions.length} pulsando
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <RefreshCw className="animate-spin text-indigo-500" size={40} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Sincronizando Pulso Neural...
              </span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="s-glass p-32 text-center border-dashed border-2 border-white/5">
              <Zap className="mx-auto text-slate-800 mb-6" size={48} />
              <h3 className="text-xl font-black text-white font-heading">Silêncio Operacional</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                Nenhum candidato em triagem ativa no momento. Convide candidatos para ver o comando
                ganhar vida.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="s-glass border-white/5 flex flex-col group/card hover:border-indigo-500/20 transition-all duration-500 animate-fade-in-up"
                >
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-white font-black text-sm">
                            {session.candidate_name.charAt(0)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-950 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-black text-white group-hover/card:text-indigo-400 transition-colors leading-tight">
                            {session.candidate_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                            <Briefcase size={10} className="text-indigo-500" />{' '}
                            {session.job_title || 'General Triage'}
                          </div>
                        </div>
                      </div>
                      {getStateBadge(session.state)}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.1em]">
                        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                          <Clock size={12} className="text-indigo-500" />
                          {new Date(session.last_activity || Date.now()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="flex items-center gap-1.5 bg-indigo-500/5 px-2 py-1 rounded-md text-indigo-400">
                          <Mic size={12} />Q{session.current_question_idx + 1} / 5
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-500">
                          {session.match_score || 0}%
                        </span>
                        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-700"
                            style={{ width: `${session.match_score || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 relative group/transcript overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                      <div className="space-y-4 max-h-[120px] overflow-y-auto no-scrollbar">
                        {session.responses && session.responses.length > 0 ? (
                          session.responses.slice(-2).map((res, i) => (
                            <div
                              key={i}
                              className={`space-y-2 transition-opacity duration-500 ${i === 1 ? 'opacity-100' : 'opacity-40'}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                                  {res.system ? 'Brain Engine' : 'Candidato'}
                                </span>
                                {!res.system && res.sentiment && getSentimentIcon(res.sentiment)}
                              </div>
                              <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic">
                                "{res.text || res.transcription || 'Iniciando processamento...'}"
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 flex flex-col items-center justify-center text-slate-600 space-y-2">
                            <RefreshCw size={20} className="animate-spin opacity-20" />
                            <span className="text-[8px] font-black uppercase tracking-widest">
                              Aguardando Conexão Neural
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between mt-auto">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 w-6 rounded-full transition-all duration-500 ${i <= session.current_question_idx + 1 ? 'bg-indigo-500' : 'bg-slate-800'}`}
                        />
                      ))}
                    </div>
                    <button className="flex items-center gap-2 text-[9px] font-black text-white hover:text-indigo-400 transition-all uppercase tracking-widest group/btn">
                      Intervir{' '}
                      <Zap size={10} className="group-hover/btn:scale-125 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:block lg:col-span-4 space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white uppercase tracking-widest">
                Atividade Global
              </h2>
            </div>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          </div>

          <div className="s-glass p-0 border-white/5 overflow-hidden flex flex-col max-h-[800px]">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Log de Eventos
              </span>
              <Filter size={14} className="text-slate-600 hover:text-slate-400 cursor-pointer" />
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
              {events.length === 0 ? (
                <div className="py-20 text-center space-y-4 opacity-40">
                  <Search className="mx-auto" size={24} />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    Nenhum evento captado
                  </p>
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="relative pl-6 border-l border-white/10 group/event"
                  >
                    <div
                      className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-slate-950 transition-colors ${
                        event.level === 'error'
                          ? 'bg-red-500'
                          : event.level === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                      }`}
                    />
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-white group-hover/event:text-indigo-400 transition-colors uppercase tracking-tighter">
                          {event.event.replace(/\./g, ' ')}
                        </span>
                        <span className="text-[8px] font-black text-slate-600">
                          {new Date(event.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                        {typeof event.details === 'string'
                          ? event.details
                          : JSON.stringify(event.details)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-indigo-500/5 border-t border-indigo-500/10 text-center">
              <button className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:text-indigo-300 transition-colors">
                Ver Monitoramento Completo
              </button>
            </div>
          </div>

          <div className="s-glass p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <TrendingUp size={16} className="text-indigo-400" />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                AI Command Insight
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              O engajamento de hoje está <span className="text-emerald-400">14% acima</span> da
              média semanal. Considere convocar os top 5 candidatos com match acima de 85% para a
              próxima fase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveFeed;
