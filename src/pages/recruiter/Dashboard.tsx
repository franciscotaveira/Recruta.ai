import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Users,
  TrendingUp,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  MessageCircle,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  Upload,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRecruiterJobs } from '../../hooks/useRecruiterJobs';
import type { JobApplication, PublicJob } from '../../contracts/api';
import PostJobModal from '../../components/recruiter/PostJobModal';
import WhatsAppInviteModal from '../../components/recruiter/WhatsAppInviteModal';
import { resolveBlindCandidateDisplay } from '../../utils/blindCandidate';
import ResumeUploadZone from '../../components/recruiter/ResumeUploadZone';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data
  const {
    jobs,
    applicationsByJob: jobApps,
    loading,
    error,
    refresh: loadJobs,
  } = useRecruiterJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [jobStats, setJobStats] = useState<Record<string, any>>({});

  // Modals
  const [showPostJob, setShowPostJob] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PublicJob | null>(null);
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (jobs.length > 0) {
      jobs.forEach(async (job) => {
        try {
          const stats = await import('../../services/api').then((m) => m.getJobStats(job.id));
          setJobStats((prev) => ({ ...prev, [job.id]: stats.funnel }));
        } catch (err) {
          console.error(`Failed to fetch stats for job ${job.id}`, err);
        }
      });
    }
  }, [jobs]);

  const handleWhatsAppInvite = (job: PublicJob) => {
    setSelectedJob(job);
    setShowWhatsApp(true);
  };

  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter(
    (j) =>
      j?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      j?.company?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const totalCandidates = Object.values(jobApps || {}).reduce((sum, apps) => sum + (Array.isArray(apps) ? apps.length : 0), 0);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16 animate-fade-in px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
            Recruiter Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Orquestre seu recrutamento com inteligência soberana.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={loadJobs}
            className="flex items-center gap-2 px-4 py-2.5 s-glass s-glass-hover text-slate-700 dark:text-slate-300 font-bold text-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowPostJob(true)}
            className="s-btn-primary shadow-lg shadow-indigo-500/20"
          >
            <Plus size={18} /> Nova Vaga
          </button>
        </div>
      </div>

      {/* KPIs - Stitch Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="s-glass p-6 group transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vagas Ativas</span>
            <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
              <Briefcase size={20} className="text-indigo-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-slate-900 dark:text-white">{(jobs || []).length}</p>
            <span className="text-[10px] text-emerald-500 font-bold">+12% vs last month</span>
          </div>
        </div>

        <div className="s-glass p-6 group transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Candidatos</span>
            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
              <Users size={20} className="text-purple-500" />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900 dark:text-white">{totalCandidates}</p>
        </div>

        <div className="s-glass p-6 group transition-all duration-300 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engajamento WhatsApp</span>
            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
              <MessageCircle size={20} className="text-emerald-500" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-black text-slate-900 dark:text-white">88%</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Taxa de resposta autônoma</p>
          </div>
          {/* Shimmer effect background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </div>

      {/* Search */}
      <div className="relative group max-w-2xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar vagas por título ou empresa..."
          className="w-full pl-12 pr-4 py-4 s-glass bg-slate-900/50 border-white/5 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
        />
      </div>

      {/* Jobs List */}
      {error && (
        <div className="p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Briefcase size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
            {jobs.length === 0 ? 'Nenhuma vaga publicada ainda' : 'Nenhuma vaga encontrada'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            {jobs.length === 0
              ? 'Publique sua primeira vaga e ela ficará visível para milhares de candidatos.'
              : 'Tente ajustar sua busca.'}
          </p>
          {jobs.length === 0 && (
            <button
              onClick={() => setShowPostJob(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors"
            >
              <Plus size={18} /> Publicar Primeira Vaga
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredJobs.map((job) => {
            const apps: JobApplication[] = jobApps[job.id] || [];
            return (
              <div
                key={job.id}
                className="s-glass p-6 s-glass-hover group/card"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover/card:text-indigo-400 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            <Building2 size={12} className="text-indigo-500" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            <MapPin size={12} className="text-emerald-500" />
                            {job.location}
                          </span>
                          {job.salary_range && (
                            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                              <DollarSign size={12} className="text-amber-500" />
                              {job.salary_range}
                            </span>
                          )}
                           <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {job.created_at ? new Date(job.created_at).toLocaleDateString('pt-BR') : '—'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`s-badge ${
                          job.is_active
                            ? 's-badge-success'
                            : 's-badge-warning opacity-50'
                        }`}
                      >
                        {job.is_active ? 'Ativa' : 'Fechada'}
                      </span>
                    </div>

                    {job.description && (
                      <p className="text-sm text-slate-400 mt-4 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                    )}

                    {/* Stats & Funnel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 pt-6 border-t border-white/5">
                      {/* Left: Quick Stats */}
                      <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Candidatos</span>
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-purple-500" />
                            <span className="text-lg font-black text-slate-200">{apps.length}</span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Performance</span>
                          <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-500" />
                            <span className="text-lg font-black text-slate-200">{Math.min(apps.length * 12, 100)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Funnel Preview */}
                      <div className="flex flex-col justify-end">
                        <div className="flex items-end gap-1.5 h-10">
                          {(() => {
                            const stats = jobStats[job.id] || {
                              invites: apps.length,
                              responded: Math.round(apps.length * 0.7),
                              matchOk: apps.filter(a => (a.match_score || 0) >= 70).length,
                              hired: apps.filter(a => a.status === 'approved').length
                            };
                            const steps = [
                              { count: stats.invites, color: 'bg-slate-700' },
                              { count: stats.responded, color: 'bg-blue-500' },
                              { count: stats.matchOk, color: 'bg-indigo-500' },
                              { count: stats.hired, color: 'bg-emerald-500' }
                            ];
                            const max = Math.max(...steps.map(s => s.count), 1);
                            return steps.map((step, idx) => (
                              <div 
                                key={idx} 
                                className={`flex-1 rounded-t-sm ${step.color} transition-all duration-700 opacity-80 hover:opacity-100`}
                                style={{ height: `${Math.max((step.count / max) * 100, 15)}%` }}
                              ></div>
                            ));
                          })()}
                        </div>
                        <div className="flex justify-between mt-1 px-0.5">
                          <span className="text-[7px] font-black text-slate-600 uppercase">Input</span>
                          <span className="text-[7px] font-black text-slate-600 uppercase">Hire</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-3 shrink-0">
                    <button
                      onClick={() => handleWhatsAppInvite(job)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl text-xs font-black transition-all active:scale-95 group/btn"
                    >
                      <MessageCircle size={16} className="group-hover/btn:scale-110 transition-transform" />
                      Convocar
                    </button>
                    <button
                      onClick={() => { setSelectedJob(job); setShowResumeUpload(true); }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white border border-indigo-500/20 rounded-xl text-xs font-black transition-all active:scale-95 group/btn"
                    >
                      <Upload size={16} className="group-hover/btn:scale-110 transition-transform" />
                      Extrair CV
                    </button>
                    <button
                      onClick={() => navigate(`/recruiter/jobs/${job.id}`)}
                      className="flex items-center justify-center gap-2 px-6 py-3 s-glass-hover bg-white/5 border border-white/10 text-white rounded-xl text-xs font-black transition-all active:scale-95"
                    >
                      Pipeline
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Applications preview */}
                {apps.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Candidatos em Destaque
                      </p>
                      <button 
                        onClick={() => navigate(`/recruiter/jobs/${job.id}`)}
                        className="text-[10px] font-black text-indigo-400 uppercase hover:text-indigo-300 transition-colors"
                      >
                        Ver Pipeline Completo
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[...apps]
                        .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
                        .slice(0, 4)
                        .map((app) => {
                          const candidate = resolveBlindCandidateDisplay({
                            candidateName: app.candidate_name,
                            blindCandidate: app.blind_candidate,
                          });

                          return (
                            <div
                              key={app.id}
                              className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl s-glass-hover group/cand"
                            >
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs group-hover/cand:bg-indigo-500 group-hover/cand:text-white transition-all">
                                {candidate.initial}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-slate-200 font-bold text-xs">
                                  {candidate.label}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                  <span className="text-[10px] font-black text-emerald-500 uppercase">
                                    {app.match_score}% Match
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <PostJobModal
        open={showPostJob}
        onClose={() => setShowPostJob(false)}
        onSuccess={() => {
          setShowPostJob(false);
          loadJobs();
        }}
      />

      {showWhatsApp && selectedJob && (
        <WhatsAppInviteModal
          job={selectedJob}
          onClose={() => {
            setShowWhatsApp(false);
            setSelectedJob(null);
            loadJobs();
          }}
        />
      )}

      {showResumeUpload && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Recruta Express ⚡
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Arraste os currículos para triagem automática.
                </p>
              </div>
              <button 
                onClick={() => { setShowResumeUpload(false); setSelectedJob(null); loadJobs(); }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>
            
            <ResumeUploadZone 
              jobId={selectedJob.id} 
              onSuccess={() => {
                // Keep modal open to allow multiple uploads or show success
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
