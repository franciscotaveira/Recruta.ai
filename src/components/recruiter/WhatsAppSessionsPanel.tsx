import React from 'react';
import {
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Mic,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import type { WhatsAppSession } from '../../services/whatsappApi';
import { resolveBlindCandidateDisplay } from '../../utils/blindCandidate';

interface Props {
  sessions: WhatsAppSession[];
  onSelectSession?: (sessionId: string) => void;
}

const stateConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  invited: {
    label: 'Convite enviado',
    color: 'text-blue-600 dark:text-blue-400',
    icon: <Clock size={14} />,
  },
  consent_pending: {
    label: 'Aguardando consentimento',
    color: 'text-amber-600 dark:text-amber-400',
    icon: <Clock size={14} />,
  },
  mic_check: {
    label: 'Teste de áudio',
    color: 'text-indigo-600 dark:text-indigo-400',
    icon: <Mic size={14} />,
  },
  accepted: {
    label: 'Aceitou — iniciando',
    color: 'text-yellow-600 dark:text-yellow-400',
    icon: <ArrowRight size={14} />,
  },
  questioning: {
    label: 'Respondendo',
    color: 'text-purple-600 dark:text-purple-400',
    icon: <Mic size={14} />,
  },
  handoff_requested: {
    label: 'Aguardando RH (handoff)',
    color: 'text-orange-600 dark:text-orange-400',
    icon: <AlertTriangle size={14} />,
  },
  completed: {
    label: 'Concluído',
    color: 'text-emerald-600 dark:text-emerald-400',
    icon: <CheckCircle size={14} />,
  },
  declined: { label: 'Recusou', color: 'text-slate-400', icon: <XCircle size={14} /> },
};

const confidenceTone: Record<
  NonNullable<WhatsAppSession['confidence']>['level'],
  { chip: string; text: string }
> = {
  low: {
    chip: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-700',
    text: 'Confiança baixa',
  },
  medium: {
    chip: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700',
    text: 'Confiança moderada',
  },
  high: {
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700',
    text: 'Confiança alta',
  },
};

const recommendationLabel: Record<NonNullable<WhatsAppSession['recommendation']>, string> = {
  entrevista: 'Entrevistar',
  rejeitar: 'Rejeitar',
  mais_info: 'Mais informação',
};

const confidenceReasonLabel: Record<string, string> = {
  analysis_fallback: 'análise em fallback',
  incomplete_answer_coverage: 'cobertura incompleta das respostas',
  shallow_evidence: 'evidência superficial',
  missing_question_scores: 'score incompleto por pergunta',
  low_answer_quality: 'qualidade baixa das respostas',
  multiple_followups_required: 'múltiplos aprofundamentos necessários',
  low_confidence: 'confiança abaixo do limiar',
};

function barsTone(level: 1 | 2 | 3 | 4 | 5): string {
  if (level <= 2)
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-700';
  if (level === 3)
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700';
}

const WhatsAppSessionsPanel: React.FC<Props> = ({ sessions, onSelectSession }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Nenhum candidato convidado via WhatsApp ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((s) => {
        const cfg = stateConfig[s.state] || stateConfig.invited;
        const responses = s.responses || [];
        const score = s.match_score;
        const knockout = s.knockout || null;
        const competencyScores = Array.isArray(s.competency_scores) ? s.competency_scores : [];
        const candidate = resolveBlindCandidateDisplay({
          candidateName: s.candidate_name,
          candidatePhone: s.candidate_phone,
          blindCandidate: s.blind_candidate,
        });
        const confidence = s.confidence || null;
        const review = s.review || null;
        const confidenceMeta = confidence ? confidenceTone[confidence.level] : null;
        const blockerReasons =
          confidence && !confidence.autoRecommendationAllowed
            ? confidence.reasons
                .slice(0, 2)
                .map((reason) => confidenceReasonLabel[reason] || reason.replace(/_/g, ' '))
            : [];

        return (
          <div
            key={s.id}
            onClick={() => onSelectSession?.(s.id)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-purple-300 dark:hover:border-purple-600 transition-all cursor-pointer shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
                  {candidate.initial}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {candidate.label}
                  </p>
                  <p className="text-xs text-slate-400">{candidate.phone || 'sem telefone'}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${cfg.color}`}>
                {cfg.icon}
                {cfg.label}
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 mb-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Mic size={12} /> {responses.length} resposta{responses.length !== 1 ? 's' : ''}
              </span>
              {score !== null && (
                <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp size={12} /> Match: {score}%
                </span>
              )}
              <span className="ml-auto text-slate-400">
                {new Date(s.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {(confidenceMeta || review?.priority || s.recommendation) && (
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
                {confidence && confidenceMeta && (
                  <span className={`rounded-full border px-2.5 py-1 ${confidenceMeta.chip}`}>
                    {confidenceMeta.text} • {confidence.score}/100
                  </span>
                )}
                {review?.priority && review.status !== 'not_required' && (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                    Fila {review.priority}
                  </span>
                )}
                {s.recommendation && (
                  <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-purple-700 dark:border-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                    {recommendationLabel[s.recommendation]}
                  </span>
                )}
              </div>
            )}

            {/* AI Summary (if completed) */}
            {s.state === 'completed' && s.summary && (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-purple-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Análise da IA
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {s.summary}
                </p>
              </div>
            )}

            {blockerReasons.length > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Recomendação automática bloqueada</p>
                  <p className="mt-1 leading-relaxed">{blockerReasons.join(' • ')}</p>
                </div>
              </div>
            )}

            {/* Knockout reason */}
            {knockout?.failed && knockout.reason && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Desclassificação por requisito eliminatório</p>
                  <p className="mt-1 leading-relaxed">{knockout.reason}</p>
                </div>
              </div>
            )}

            {/* Communication Performance */}
            {s.communication_performance && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Performance Comunicativa (Iris Index)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Clareza</p>
                    <p className="text-sm font-black text-blue-600 dark:text-blue-400">{s.communication_performance.clarity}/5</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Vocabulário</p>
                    <p className="text-sm font-black text-purple-600 dark:text-purple-400">{s.communication_performance.vocabulary}/5</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Objetividade</p>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{s.communication_performance.objectivity}/5</p>
                  </div>
                </div>
              </div>
            )}

            {/* Competency scores */}
            {competencyScores.length > 0 && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Competências (BARS)
                </p>
                <div className="space-y-2">
                  {competencyScores.slice(0, 4).map((c) => (
                    <div
                      key={`${s.id}-${c.requirement_id}`}
                      className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2 text-xs dark:bg-slate-800"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-700 dark:text-slate-200">
                          {c.requirement_text}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Score {c.score}% • Peso {c.weight}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-md border px-2 py-1 font-bold ${barsTone(c.bars_level)}`}
                      >
                        BARS {c.bars_level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Concerns (if completed) */}
            {s.state === 'completed' && (s.concerns?.length || 0) > 0 && (
              <div className="mt-3 flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>{(s.concerns || []).join(' • ')}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WhatsAppSessionsPanel;
