import React, { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  PlayCircle,
  Loader2,
  Volume2,
  Check,
} from 'lucide-react';
import {
  getAudioBlob,
  getReviewQueue,
  getSessionAudios,
  updateSessionStatus,
} from '../services/whatsappApi';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { JobQueue } from '../lib/JobQueue';
import { useAuth } from '../contexts/AuthContext';
import type { RecruiterReviewQueueItem, WhatsAppAudioFile } from '../contracts/api';

type ReviewRow = {
  item: RecruiterReviewQueueItem;
  audios: WhatsAppAudioFile[];
};

const PendingReviews = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const { speak, stop, isSpeaking } = useTextToSpeech('pt-BR');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const queue = await getReviewQueue();

      const withAudios = await Promise.all(
        queue.map(async (item) => {
          const audios = await getSessionAudios(item.session_id);
          return { item, audios };
        })
      );

      setRows(withAudios.filter((entry) => entry.audios.length > 0));
    } catch (err: any) {
      setRows([]);
      setError(err?.message || 'Erro ao carregar revisões pendentes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusUpdate(
    sessionId: string,
    recommendation: 'entrevista' | 'rejeitar' | 'mais_info',
    state?: string
  ) {
    setUpdatingIds((prev) => new Set([...prev, sessionId]));
    try {
      const job = await JobQueue.createJob(
        'recruiter.update_review_status',
        {
          sessionId,
          recommendation,
          state,
        },
        user?.id
      );

      if (!job) throw new Error('Falha ao criar ação de revisão');

      // We don't necessarily reload immediately, the JobQueue will process it.
      // But for this UI, we can optimistic update or just reload after a delay.
      setTimeout(() => {
        load();
      }, 1000);
    } catch (err: any) {
      setError(`Falha ao atualizar sessão: ${err.message}`);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(sessionId);
        return next;
      });
    }
  }

  const pendingCandidates = useMemo(
    () =>
      rows.map((entry) => {
        const latestAudio = entry.audios[entry.audios.length - 1];
        return {
          id: entry.item.session_id,
          item: entry.item,
          latestAudio,
          totalAudios: entry.audios.length,
          transcription: latestAudio?.transcription || null,
          status: entry.item.review.status,
        };
      }),
    [rows]
  );
  // ... existing play/audio logic ...
  async function handlePlay(audioId: string) {
    try {
      setPlayingAudioId(audioId);
      const blob = await getAudioBlob(audioId);
      const url = URL.createObjectURL(blob);
      const player = new Audio(url);
      player.onended = () => {
        URL.revokeObjectURL(url);
        setPlayingAudioId(null);
      };
      player.onerror = () => {
        URL.revokeObjectURL(url);
        setPlayingAudioId(null);
      };
      await player.play();
    } catch {
      setPlayingAudioId(null);
      setError('Não foi possível reproduzir o áudio.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Revisão Pendente</h1>
          <p className="text-slate-500 text-sm">
            Candidatos com áudio em triagem para revisão do recrutador.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <Clock size={16} /> Atualizar
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {loading && (
          <div className="text-center py-12 text-slate-500 text-sm bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Loader2 size={32} className="animate-spin mx-auto mb-4 text-purple-500" />
            Carregando revisões...
          </div>
        )}

        {!loading &&
          pendingCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-8 transition-all hover:shadow-md ${updatingIds.has(candidate.id) ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-orange-200">
                      {candidate.item.candidate.label.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-none mb-1">
                        {candidate.item.candidate.label}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {candidate.item.candidate.maskedPhone || 'telefone oculto'} •{' '}
                        {candidate.item.job_id}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      candidate.item.review.priority === 'urgent'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : candidate.item.review.priority === 'high'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {candidate.item.review.priority}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <span className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                      IA Insight
                    </span>
                    <span className="font-bold text-slate-700 leading-tight">
                      {candidate.item.analysis.summary ||
                        'Triagem aguardando consolidação da análise.'}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <span className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                      Interação
                    </span>
                    <span className="font-bold text-slate-700">
                      {candidate.totalAudios} mensagens de voz • confiança{' '}
                      {candidate.item.analysis.confidence.score}/100
                    </span>
                  </div>
                </div>

                {candidate.transcription && (
                  <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50/30 italic text-slate-600 relative group">
                    <div className="absolute -top-3 left-3 px-2 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400">
                      Transcrição
                    </div>
                    <p className="text-sm leading-relaxed">
                      &ldquo;{candidate.transcription}&rdquo;
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => handlePlay(candidate.latestAudio.id)}
                    disabled={playingAudioId === candidate.latestAudio.id}
                    className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-bold uppercase tracking-tight py-2 px-3 bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {playingAudioId === candidate.latestAudio.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <PlayCircle size={16} />
                    )}
                    Ouvir Áudio
                  </button>

                  {candidate.transcription && (
                    <button
                      type="button"
                      onClick={() => (isSpeaking ? stop() : speak(candidate.transcription || ''))}
                      className="flex items-center gap-2 text-xs text-purple-600 hover:text-purple-800 font-bold uppercase tracking-tight py-2 px-3 bg-purple-50 rounded-lg transition-colors"
                    >
                      <Volume2 size={16} /> {isSpeaking ? 'Parar Leitura' : 'Leitura IA'}
                    </button>
                  )}
                </div>
              </div>

              <div className="lg:w-72 flex flex-col justify-center gap-3 lg:border-l lg:border-slate-100 lg:pl-8">
                <button
                  onClick={() => handleStatusUpdate(candidate.id, 'entrevista', 'completed')}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                >
                  <CheckCircle size={18} /> Aprovar p/ Entrevista
                </button>
                <button
                  onClick={() => handleStatusUpdate(candidate.id, 'mais_info', 'questioning')}
                  className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Clock size={16} /> Pedir mais info
                </button>
                <button
                  onClick={() => handleStatusUpdate(candidate.id, 'rejeitar', 'completed')}
                  className="w-full py-3 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <XCircle size={16} /> Reprovar agora
                </button>
              </div>
            </div>
          ))}

        {!loading && pendingCandidates.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
              <Check className="text-emerald-500" size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Tudo em dia!</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">
              Não há áudios pendentes para revisão no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingReviews;
