import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Sparkles,
  MoreHorizontal,
  Plus,
  Loader2,
  Check,
  X,
  MessageCircle,
} from 'lucide-react';
import {
  getPublicJob,
  getJobApplications,
  updateApplicationStatus,
  sendWhatsAppInvite,
  getWhatsAppSessions,
} from '../../services/api';
import { WhatsAppSession } from '../../contracts/api';
import type { JobApplication, PublicJob } from '../../contracts/api';
import { resolveBlindCandidateDisplay } from '../../utils/blindCandidate';
import CandidateComparison from '../../components/recruiter/CandidateComparison';

const JobKanban = () => {
  const { id } = useParams();
  const [job, setJob] = useState<PublicJob | null>(null);
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

  const loadData = async () => {
    if (id) {
      try {
        const [j, a, s] = await Promise.all([
          getPublicJob(id).catch(() => null),
          getJobApplications(id)
            .then((r) => r.data)
            .catch(() => []),
          getWhatsAppSessions(id)
            .then((r) => r.data)
            .catch(() => []),
        ]);
        setJob(j);
        setApps(a);
        setSessions(s);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusUpdate = async (
    appId: string,
    newStatus: 'new' | 'shortlisted' | 'interview' | 'approved' | 'rejected'
  ) => {
    if (!id || updatingId) return;

    setUpdatingId(appId);
    try {
      // Optimistic update
      setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));

      await updateApplicationStatus(id, appId, newStatus);
    } catch (error) {
      console.error('Failed to update status', error);
      // Revert if failed
      loadData();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleInviteWhatsApp = async (app: JobApplication) => {
    if (!id || invitingId || !app.id) return;
    setInvitingId(app.id);
    try {
      await sendWhatsAppInvite({
        jobId: id,
        profileId: app.candidate_id || undefined,
        candidateName: app.candidate_name || undefined,
        candidatePhone: app.candidate_phone || undefined,
        jobTitle: job?.title,
        companyName: job?.company,
      });
      setInvitedIds((prev) => new Set(prev).add(app.id!));
    } catch (error) {
      console.error('Failed to send WhatsApp invite', error);
      alert('Erro ao enviar convite por WhatsApp. Verifique se o telefone está correto.');
    } finally {
      setInvitingId(null);
    }
  };

  const toggleSelection = (appId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const stages = [
    { id: 'new', label: 'Novos', color: 'border-blue-500' },
    { id: 'interview', label: 'Entrevista', color: 'border-yellow-500' },
    { id: 'shortlisted', label: 'Shortlist', color: 'border-emerald-500' },
    { id: 'approved', label: 'Aprovados', color: 'border-green-600' },
    { id: 'rejected', label: 'Reprovados', color: 'border-slate-300' },
  ];

  const getStageApps = (stageId: string) => {
    return (Array.isArray(apps) ? apps : []).filter((a) => {
      if (stageId === 'new') return !a?.status || a?.status === 'new' || a?.status === 'screening';
      return a?.status === stageId;
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!job) {
    return <div className="p-8 text-center text-slate-500">Vaga não encontrada.</div>;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in px-4 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/recruiter/jobs"
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              {job.title}
              <span className="text-xs font-normal text-slate-500 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full capitalize">
                {job.location}
              </span>
            </h1>
            <p className="text-sm text-slate-500">
              Pipeline de contratação • {(apps || []).length} candidatos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.size >= 2 && (
            <button
              onClick={() => setShowComparison(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-200 dark:shadow-none transition-all animate-in zoom-in-95"
            >
              <Sparkles size={18} /> Comparar {selectedIds.size} candidatos
            </button>
          )}
          {selectedIds.size > 0 && (
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Limpar seleção
            </button>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-4 min-w-max pb-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="w-80 flex flex-col bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800"
            >
              {/* Column Header */}
              <div
                className={`p-3 border-b-2 bg-white dark:bg-slate-800 rounded-t-xl flex justify-between items-center ${stage.color} dark:border-slate-700`}
              >
                <span className="font-bold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  {stage.label}
                </span>
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  {getStageApps(stage.id).length}
                </span>
              </div>

              {/* Column Content */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {(getStageApps(stage.id) || []).map((app) => {
                  const candidate = resolveBlindCandidateDisplay({
                    candidateName: app?.candidate_name,
                    blindCandidate: app?.blind_candidate,
                  });

                  return (
                    <div
                      key={app.id}
                      className={`bg-white dark:bg-slate-800 p-4 rounded-xl border transition-all group relative ${
                        selectedIds.has(app.id!)
                          ? 'border-purple-500 ring-2 ring-purple-100 dark:ring-purple-900/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:shadow-lg'
                      } ${updatingId === app.id ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {/* Selection Checkbox */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(app.id!);
                        }}
                        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all z-10 ${
                          selectedIds.has(app.id!)
                            ? 'bg-purple-600 border-purple-600 text-white scale-110 shadow-lg'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-transparent opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Check size={12} strokeWidth={4} />
                      </div>

                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 text-xs font-black flex items-center justify-center">
                            {candidate.initial}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">
                              {candidate.label}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(app.applied_at || app.created_at || '').toLocaleDateString(
                                'pt-BR'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                            (app.match_score || 0) >= 80
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : (app.match_score || 0) >= 50
                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                : 'bg-slate-50 text-slate-500 border border-slate-100'
                          }`}
                        >
                          Match: {app.match_score}%
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 invisible group-hover:visible animate-in fade-in slide-in-from-bottom-1">
                        {stage.id === 'new' && (
                          <button
                            onClick={() => handleInviteWhatsApp(app)}
                            disabled={invitingId === app.id || invitedIds.has(app.id!)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                              invitedIds.has(app.id!)
                                ? 'bg-slate-100 text-slate-500 cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {invitingId === app.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : invitedIds.has(app.id!) ? (
                              <>
                                <Check size={12} /> Enviado
                              </>
                            ) : (
                              <>
                                <MessageCircle size={12} /> Convidar WhatsApp
                              </>
                            )}
                          </button>
                        )}
                        {stage.id !== 'approved' && stage.id !== 'rejected' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(app.id!, 'interview')}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                            >
                              <Check size={12} /> Entrevista
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(app.id!, 'rejected')}
                              className="flex items-center justify-center p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 transition-colors rounded-lg"
                              title="Reprovar"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {stage.id === 'interview' && (
                          <button
                            onClick={() => handleStatusUpdate(app.id!, 'approved')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                          >
                            <Check size={12} /> Contratar
                          </button>
                        )}
                        {(stage.id === 'approved' || stage.id === 'rejected') && (
                          <button
                            onClick={() => handleStatusUpdate(app.id!, 'new')}
                            className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold hover:bg-slate-200"
                          >
                            Resetar Status
                          </button>
                        )}
                        <button className="flex items-center justify-center p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                          <MessageCircle size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {showComparison && (
        <CandidateComparison
          sessions={sessions.filter((s) => {
            const app = apps.find((a) => a.id === Array.from(selectedIds)[0]); // Example mapping logic
            // Mapping by phone is safer
            const selectedPhones = new Set(
              apps.filter((a) => selectedIds.has(a.id!)).map((a) => a.candidate_phone)
            );
            return selectedPhones.has(s.candidate_phone);
          })}
          onClose={() => {
            setShowComparison(false);
            setSelectedIds(new Set());
          }}
        />
      )}
    </div>
  );
};

export default JobKanban;
