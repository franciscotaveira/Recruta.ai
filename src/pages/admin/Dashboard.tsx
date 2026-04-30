import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Bot,
  RefreshCcw,
  Save,
  ShieldCheck,
  Users,
  Workflow,
  Eye,
  Activity,
  Shield,
  Database,
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AuditFeed } from '../../components/admin/AuditFeed';
import { GovernanceQueue } from '../../components/admin/GovernanceQueue';
import type {
  AdminAIControlSettings,
  AdminAIRagDiagnostics,
  AdminAIRagSettings,
  AdminAISpecialist,
  AdminAISpecialistArea,
  AdminAISquad,
  AdminOverview,
} from '../../contracts/api';
import {
  getAdminAIRag,
  getAdminAISquad,
  getAdminOverview,
  updateAdminAIRag,
  updateAdminAIControl,
  updateAdminAISquad,
} from '../../services/api';

const money = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((cents || 0) / 100);

const areaLabels: Record<AdminAISpecialistArea, string> = {
  attraction: 'Atração',
  triage: 'Triagem',
  interview: 'Entrevista',
  compliance: 'Compliance',
  candidate_experience: 'Experiência candidato',
  quality: 'Qualidade/Viés',
  revenue: 'Receita',
  learning: 'Aprendizado',
};

const modelOptions: Array<{ value: AdminAISpecialist['modelPolicy']; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'fallback_only', label: 'Fallback only' },
];

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [savingControl, setSavingControl] = useState(false);
  const [savingSquad, setSavingSquad] = useState(false);
  const [savingRag, setSavingRag] = useState(false);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [control, setControl] = useState<AdminAIControlSettings | null>(null);
  const [squad, setSquad] = useState<AdminAISquad | null>(null);
  const [ragDiagnostics, setRagDiagnostics] = useState<AdminAIRagDiagnostics | null>(null);
  const [ragSettings, setRagSettings] = useState<AdminAIRagSettings | null>(null);

  const adminSection = useMemo<
    | 'overview'
    | 'analytics'
    | 'ai-control'
    | 'ai-squad'
    | 'ai-rag'
    | 'ai-observability'
    | 'ai-governance'
  >(() => {
    if (location.pathname.startsWith('/admin/analytics')) return 'analytics';
    if (location.pathname.startsWith('/admin/ai-control')) return 'ai-control';
    if (location.pathname.startsWith('/admin/ai-squad')) return 'ai-squad';
    if (location.pathname.startsWith('/admin/ai-rag')) return 'ai-rag';
    if (location.pathname.startsWith('/admin/ai-observability')) return 'ai-observability';
    if (location.pathname.startsWith('/admin/ai-governance')) return 'ai-governance';
    return 'overview';
  }, [location.pathname]);

  const showAnalytics = adminSection === 'overview' || adminSection === 'analytics';
  const showControl = adminSection === 'overview' || adminSection === 'ai-control';
  const showSquad = adminSection === 'overview' || adminSection === 'ai-squad';
  const showRag = adminSection === 'overview' || adminSection === 'ai-rag';
  const showObservability = adminSection === 'ai-observability';
  const showGovernance = adminSection === 'ai-governance';

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewData, squadRes] = await Promise.all([
        getAdminOverview(),
        supabase.from('ai_specialists').select('*').order('area'),
      ]);

      const squadData: AdminAISquad = {
        experts: (squadRes.data || []).map((row) => ({
          id: row.id,
          name: row.name,
          area: row.area as AdminAISpecialistArea,
          objective: row.objective,
          keyMetric: row.key_metric,
          enabled: row.enabled,
          humanReviewRequired: row.human_review_required,
          modelPolicy: row.model_policy as AdminAISpecialist['modelPolicy'],
          slaMinutes: row.sla_minutes,
          owner: row.owner,
          updatedAt: row.updated_at,
        })),
        governance: overviewData.aiSquadSummary?.governance || {
          consentRequired: true,
          blindScreeningEnabled: true,
          humanInTheLoopRequired: true,
          biasAuditCadenceDays: 30,
          maxParallelSessions: 200,
        },
        updatedAt: new Date().toISOString(),
        updatedBy: null,
      };

      setOverview(overviewData);
      setControl(overviewData.aiControl);
      setSquad(squadData);

      const ragResult = await Promise.allSettled([getAdminAIRag()]);
      const ragData =
        ragResult[0].status === 'fulfilled' ? ragResult[0].value : overviewData.aiRag || null;
      setRagDiagnostics(ragData);
      setRagSettings(ragData?.settings || null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Falha ao carregar painel admin.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const userRoleRows = useMemo(() => Object.entries(overview?.users.byRole || {}), [overview]);
  const sessionStateRows = useMemo(
    () => Object.entries(overview?.triage.byState || {}),
    [overview]
  );
  const squadCoverageRows = useMemo(
    () =>
      Object.entries(overview?.aiSquadSummary?.coverage || {}) as Array<
        [AdminAISpecialistArea, number]
      >,
    [overview]
  );

  const updateExpert = (id: string, patch: Partial<AdminAISpecialist>) => {
    setSquad((current) => {
      if (!current) return current;
      return {
        ...current,
        experts: current.experts.map((expert) =>
          expert.id === id ? { ...expert, ...patch, updatedAt: new Date().toISOString() } : expert
        ),
      };
    });
  };

  const saveControl = async () => {
    if (!control) return;
    setSavingControl(true);
    setError('');
    try {
      const updated = await updateAdminAIControl(control);
      setControl(updated);
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Falha ao salvar controle de IA.'));
    } finally {
      setSavingControl(false);
    }
  };

  const saveSquad = async () => {
    if (!squad) return;
    setSavingSquad(true);
    setError('');
    try {
      const updated = await updateAdminAISquad({
        experts: squad.experts,
        governance: squad.governance,
      });
      setSquad(updated);
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Falha ao salvar squad de IA.'));
    } finally {
      setSavingSquad(false);
    }
  };

  const saveRag = async () => {
    if (!ragSettings) return;
    setSavingRag(true);
    setError('');
    try {
      const updated = await updateAdminAIRag(ragSettings);
      setRagSettings(updated);
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Falha ao salvar configuração de RAG.'));
    } finally {
      setSavingRag(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 dark:text-slate-300">
        Carregando console admin...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in-up px-4 md:px-0">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.05),transparent_40%),radial-gradient(circle_at_100%_0%,rgba(239,68,68,0.03),transparent_40%)]" />

      {/* Sovereign Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pt-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 s-glass border-red-500/20 text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-2">
            <Shield size={12} /> Sovereign Command Tower
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white font-heading">
            Painel{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 font-black">
              Gestor
            </span>
          </h1>
          <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
            <Activity size={14} className="text-red-500 animate-pulse" /> Operação Global v2.0 ·{' '}
            {overview?.generatedAt ? new Date(overview.generatedAt).toLocaleTimeString() : '--:--'}
          </p>
        </div>

        {/* Tactical Navigation */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/ai-governance"
            className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              adminSection === 'ai-governance'
                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20'
                : 's-glass border-white/5 text-slate-400 hover:text-red-400 hover:border-red-500/30'
            }`}
          >
            <ShieldCheck size={14} /> Governança
          </Link>
          <Link
            to="/admin/ai-observability"
            className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              adminSection === 'ai-observability'
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                : 's-glass border-white/5 text-slate-400 hover:text-purple-400 hover:border-purple-500/30'
            }`}
          >
            <Eye size={14} /> Observabilidade
          </Link>
          <button
            onClick={load}
            className="px-5 py-2.5 s-glass border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
          >
            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 s-glass border-red-500/30 bg-red-500/5 text-xs font-bold text-red-400 animate-shake flex items-center gap-3">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* KPI Grid - Glassmorphism */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Usuários', value: overview?.users.total, icon: Users, color: 'text-blue-400' },
          {
            label: 'Vagas Ativas',
            value: overview?.jobs.active,
            icon: Workflow,
            color: 'text-indigo-400',
          },
          {
            label: 'Match Rate',
            value: `${overview?.triage.completionRate}%`,
            icon: Activity,
            color: 'text-emerald-400',
          },
          {
            label: 'Receita',
            value: money(overview?.revenue.paidRevenueCents || 0),
            icon: BarChart3,
            color: 'text-amber-400',
          },
          {
            label: 'Squad Ativo',
            value: `${overview?.aiSquadSummary?.enabledExperts}/${overview?.aiSquadSummary?.totalExperts}`,
            icon: Bot,
            color: 'text-purple-400',
          },
          {
            label: 'RAG Hit',
            value: `${Math.round((ragDiagnostics?.cacheHitRate || 0) * 100)}%`,
            icon: BrainCircuit,
            color: 'text-pink-400',
          },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="s-glass p-5 border-white/5 group hover:border-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <kpi.icon size={16} className={`${kpi.color} opacity-80`} />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>
            <p className="text-2xl font-black text-white group-hover:scale-105 transition-transform origin-left">
              {kpi.value || 0}
            </p>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {(showAnalytics || showControl) && (
        <div
          className={`grid gap-6 ${showAnalytics && showControl ? 'xl:grid-cols-3' : 'grid-cols-1'}`}
        >
          {showAnalytics && (
            <div className={`${showControl ? 'xl:col-span-2 ' : ''} s-glass p-8`}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                  <BarChart3 size={20} className="text-indigo-400" />
                </div>
                <h2 className="text-xl font-black text-white font-heading">Analytics Global</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-12 text-sm">
                <div className="space-y-6">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Users size={14} /> Distribuição de Acesso
                  </p>
                  <ul className="space-y-3">
                    {userRoleRows.map(([role, count]) => (
                      <li
                        key={role}
                        className="flex justify-between items-center s-glass border-white/5 px-5 py-3 s-glass-hover"
                      >
                        <span className="text-slate-400 font-bold capitalize">{role}</span>
                        <span className="text-white font-black">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-6">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> Ciclo de Triagem
                  </p>
                  <ul className="space-y-3">
                    {sessionStateRows.map(([state, count]) => (
                      <li
                        key={state}
                        className="flex justify-between items-center s-glass border-white/5 px-5 py-3 s-glass-hover"
                      >
                        <span className="text-slate-400 font-bold capitalize">{state}</span>
                        <span className="text-indigo-400 font-black">{count}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex justify-around">
                    <div className="text-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase">Avg Match</p>
                      <p className="text-sm font-black text-white">
                        {overview?.triage.avgMatchScore ?? '—'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase">Decline</p>
                      <p className="text-sm font-black text-red-400">
                        {overview?.triage.declineRate ?? 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showControl && (
            <div className="s-glass p-8 border-indigo-500/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-purple-500/10 rounded-xl">
                  <Bot size={20} className="text-purple-400" />
                </div>
                <h2 className="text-xl font-black text-white font-heading">Sovereign Control</h2>
              </div>

              {control && (
                <div className="space-y-6 text-sm">
                  {[
                    { label: 'IA Ativa', key: 'aiEnabled', icon: Activity },
                    { label: 'Deep Dive Engine', key: 'deepDiveEnabled', icon: BrainCircuit },
                    { label: 'Smart Fallback', key: 'textFallbackEnabled', icon: Workflow },
                  ].map((toggle) => (
                    <label
                      key={toggle.key}
                      className="flex items-center justify-between p-4 s-glass border-white/5 cursor-pointer hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <toggle.icon size={14} className="text-slate-500" />
                        <span className="text-slate-300 font-bold">{toggle.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={(control as any)[toggle.key]}
                        onChange={(e) => setControl({ ...control, [toggle.key]: e.target.checked })}
                        className="w-4 h-4 rounded border-white/10 bg-slate-900 text-indigo-500 focus:ring-0"
                      />
                    </label>
                  ))}

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="block">
                      <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        Max Audio Payload (Bytes)
                      </span>
                      <input
                        type="number"
                        value={control.maxAudioBytes}
                        onChange={(e) =>
                          setControl({ ...control, maxAudioBytes: Number(e.target.value) })
                        }
                        className="w-full px-4 py-3 s-glass bg-slate-950 border-white/5 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        Policy Master
                      </span>
                      <select
                        value={control.modelPolicy}
                        onChange={(e) =>
                          setControl({ ...control, modelPolicy: e.target.value as any })
                        }
                        className="w-full px-4 py-3 s-glass bg-slate-950 border-white/5 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/30 outline-none"
                      >
                        <option value="auto">Automatic (Dynamic)</option>
                        <option value="gemini">Gemini Sovereign</option>
                        <option value="fallback_only">Safety Fallback</option>
                      </select>
                    </label>
                  </div>

                  <button
                    onClick={saveControl}
                    disabled={savingControl}
                    className="w-full s-btn-primary py-4 justify-center shadow-xl shadow-indigo-500/10 mt-4"
                  >
                    <Save size={16} /> {savingControl ? 'Salvando...' : 'Update Policy'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showRag && (
        <div className="s-glass p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full -mr-32 -mt-32 blur-[100px]" />

          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-500/10 rounded-xl">
                <BrainCircuit size={20} className="text-pink-400" />
              </div>
              <h2 className="text-xl font-black text-white font-heading">Neural Knowledge (RAG)</h2>
            </div>
            <button
              onClick={saveRag}
              disabled={!ragSettings || savingRag}
              className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Save size={14} /> {savingRag ? 'Commiting...' : 'Sync RAG'}
            </button>
          </div>

          {ragDiagnostics && (
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Corpus Size', value: ragDiagnostics.corpusSize, icon: Database },
                { label: 'Cache Entries', value: ragDiagnostics.cacheEntries, icon: Workflow },
                {
                  label: 'Efficiency',
                  value: `${Math.round(ragDiagnostics.cacheHitRate * 100)}%`,
                  icon: Activity,
                },
                {
                  label: 'Neural Signature',
                  value: ragDiagnostics.corpusSignature.substring(0, 12) + '...',
                  icon: ShieldCheck,
                  mono: true,
                },
              ].map((stat, i) => (
                <div key={i} className="p-5 s-glass border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-xl font-black text-white ${stat.mono ? 'font-mono' : ''}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {ragSettings && (
            <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-4 text-sm">
              {[
                { label: 'Status', key: 'enabled', type: 'toggle' },
                { label: 'Citations', key: 'includeCitations', type: 'toggle' },
                { label: 'Top-K', key: 'topK', type: 'number', min: 1, max: 10 },
                { label: 'Min Score', key: 'minScore', type: 'number', min: 0, max: 20 },
                {
                  label: 'Context Limit',
                  key: 'maxContextChars',
                  type: 'number',
                  min: 300,
                  max: 5000,
                },
                { label: 'Cache TTL', key: 'cacheTtlSeconds', type: 'number', min: 30, max: 3600 },
              ].map((field) => (
                <div key={field.key} className="p-4 s-glass border-white/5">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    {field.label}
                  </span>
                  {field.type === 'toggle' ? (
                    <input
                      type="checkbox"
                      checked={(ragSettings as any)[field.key]}
                      onChange={(e) =>
                        setRagSettings({ ...ragSettings, [field.key]: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-white/10 bg-slate-900 text-pink-500 focus:ring-0"
                    />
                  ) : (
                    <input
                      type="number"
                      min={field.min}
                      max={field.max}
                      value={(ragSettings as any)[field.key]}
                      onChange={(e) =>
                        setRagSettings({ ...ragSettings, [field.key]: Number(e.target.value) })
                      }
                      className="w-full bg-transparent border-none text-white font-black text-sm p-0 focus:ring-0"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showSquad && (
        <div className="s-glass p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full -mr-40 -mt-40 blur-[120px]" />

          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <Users size={20} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-black text-white font-heading">AI Specialists Squad</h2>
            </div>
            <button
              onClick={saveSquad}
              disabled={!squad || savingSquad}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Save size={14} /> {savingSquad ? 'Deploying...' : 'Deploy Squad'}
            </button>
          </div>

          {overview?.aiSquadSummary && (
            <div className="grid md:grid-cols-4 gap-3 mb-4">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-xs text-slate-500">Especialistas</p>
                <p className="text-xl font-black">{overview.aiSquadSummary.enabledExperts}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-xs text-slate-500">Cobertura de áreas</p>
                <p className="text-xl font-black">
                  {squadCoverageRows.filter(([, count]) => count > 0).length}/
                  {squadCoverageRows.length}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-xs text-slate-500">Score de governança</p>
                <p className="text-xl font-black">{overview.aiSquadSummary.governanceScore}%</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-500">
                Cobertura atual:{' '}
                {squadCoverageRows
                  .filter(([, count]) => count > 0)
                  .map(([area]) => areaLabels[area])
                  .join(', ') || 'sem cobertura'}
              </div>
            </div>
          )}

          {squad && (
            <>
              <div className="grid md:grid-cols-5 gap-3 mb-4">
                <label className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                  <span>Consentimento obrigatório</span>
                  <input
                    type="checkbox"
                    checked={squad.governance.consentRequired}
                    onChange={(e) =>
                      setSquad({
                        ...squad,
                        governance: { ...squad.governance, consentRequired: e.target.checked },
                      })
                    }
                  />
                </label>
                <label className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                  <span>Blind screening</span>
                  <input
                    type="checkbox"
                    checked={squad.governance.blindScreeningEnabled}
                    onChange={(e) =>
                      setSquad({
                        ...squad,
                        governance: {
                          ...squad.governance,
                          blindScreeningEnabled: e.target.checked,
                        },
                      })
                    }
                  />
                </label>
                <label className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                  <span>HITL obrigatório</span>
                  <input
                    type="checkbox"
                    checked={squad.governance.humanInTheLoopRequired}
                    onChange={(e) =>
                      setSquad({
                        ...squad,
                        governance: {
                          ...squad.governance,
                          humanInTheLoopRequired: e.target.checked,
                        },
                      })
                    }
                  />
                </label>
                <label className="block px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                  <span className="block text-xs text-slate-500 mb-1">Auditoria viés (dias)</span>
                  <input
                    type="number"
                    min={7}
                    max={365}
                    value={squad.governance.biasAuditCadenceDays}
                    onChange={(e) =>
                      setSquad({
                        ...squad,
                        governance: {
                          ...squad.governance,
                          biasAuditCadenceDays:
                            Number(e.target.value) || squad.governance.biasAuditCadenceDays,
                        },
                      })
                    }
                    className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </label>
                <label className="block px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                  <span className="block text-xs text-slate-500 mb-1">Sessões paralelas</span>
                  <input
                    type="number"
                    min={10}
                    max={10000}
                    value={squad.governance.maxParallelSessions}
                    onChange={(e) =>
                      setSquad({
                        ...squad,
                        governance: {
                          ...squad.governance,
                          maxParallelSessions:
                            Number(e.target.value) || squad.governance.maxParallelSessions,
                        },
                      })
                    }
                    className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </label>
              </div>

              <div className="space-y-3">
                {(squad.experts || []).map((expert) => (
                  <article
                    key={expert.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 p-3"
                  >
                    <div className="grid md:grid-cols-6 gap-3 items-start">
                      <div className="md:col-span-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {expert.name}
                        </p>
                        <p className="text-xs text-slate-500">{areaLabels[expert.area]}</p>
                        <p className="text-xs text-slate-500 mt-1">Métrica: {expert.keyMetric}</p>
                      </div>

                      <label className="text-xs">
                        <span className="block mb-1 text-slate-500">Owner</span>
                        <input
                          value={expert.owner}
                          onChange={(e) => updateExpert(expert.id, { owner: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </label>

                      <label className="text-xs">
                        <span className="block mb-1 text-slate-500">Modelo</span>
                        <select
                          value={expert.modelPolicy}
                          onChange={(e) =>
                            updateExpert(expert.id, {
                              modelPolicy: e.target.value as AdminAISpecialist['modelPolicy'],
                            })
                          }
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                          {modelOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs">
                        <span className="block mb-1 text-slate-500">SLA (min)</span>
                        <input
                          type="number"
                          min={5}
                          max={1440}
                          value={expert.slaMinutes}
                          onChange={(e) =>
                            updateExpert(expert.id, {
                              slaMinutes: Number(e.target.value) || expert.slaMinutes,
                            })
                          }
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </label>

                      <div className="text-xs text-slate-500 space-y-1">
                        <label className="flex items-center justify-between gap-2">
                          <span>Ativo</span>
                          <input
                            type="checkbox"
                            checked={expert.enabled}
                            onChange={(e) => updateExpert(expert.id, { enabled: e.target.checked })}
                          />
                        </label>
                        <label className="flex items-center justify-between gap-2">
                          <span>Revisão humana</span>
                          <input
                            type="checkbox"
                            checked={expert.humanReviewRequired}
                            onChange={(e) =>
                              updateExpert(expert.id, { humanReviewRequired: e.target.checked })
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <label className="block text-xs mt-2">
                      <span className="block mb-1 text-slate-500">Objetivo operacional</span>
                      <input
                        value={expert.objective}
                        onChange={(e) => updateExpert(expert.id, { objective: e.target.value })}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </label>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {showGovernance && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <GovernanceQueue />
        </div>
      )}

      {showObservability && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-purple-600" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Observabilidade do Kernel
            </h2>
          </div>
          <AuditFeed />
        </div>
      )}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300 text-sm flex items-start gap-2">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        Como admin, você já pode navegar em <strong>/recruiter</strong> e{' '}
        <strong>/candidate</strong> para revisar a experiência dos dois perfis.
      </div>
    </div>
  );
};

export default AdminDashboard;
