import React, { startTransition, useEffect, useState } from 'react';
import {
  getBulkResults,
  getPublicJobs,
  bulkAnalyzeCVs,
  sendWhatsAppInvite,
} from '../../services/api';
import { JobQueue } from '../../lib/JobQueue';
import { useAuth } from '../../contexts/AuthContext';
import type { BulkAnalysisErrorItem, BulkAnalysisResultItem, PublicJob } from '../../contracts/api';
import { resolveBlindCandidateDisplay } from '../../utils/blindCandidate';
import {
  Upload,
  Loader2,
  CheckCircle2,
  X,
  MessageCircle,
  AlertTriangle,
  ChevronDown,
  Zap,
  XCircle,
  Brain,
  Target,
  Shield,
  Activity,
  BarChart3,
  Search,
} from 'lucide-react';

interface Candidate {
  name: string;
  phone: string;
  email: string;
  cvText: string;
}

const BulkAnalysis = () => {
  const { user } = useAuth();
  // Step 1: Job selection
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');

  // Step 2: Candidates input
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [bulkText, setBulkText] = useState('');

  // Step 3: Analysis
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingSavedResults, setLoadingSavedResults] = useState(false);
  const [results, setResults] = useState<BulkAnalysisResultItem[]>([]);
  const [errors, setErrors] = useState<BulkAnalysisErrorItem[]>([]);
  const [loadError, setLoadError] = useState('');
  const [analyzeError, setAnalyzeError] = useState('');
  const [resultsSource, setResultsSource] = useState<'stored' | 'fresh' | null>(null);

  // Step 4: Selection
  const [selectedProfileIds, setSelectedProfileIds] = useState<Set<string>>(new Set());
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Step 5: Dispatch
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{ ok: number; fail: number } | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (!selectedJobId) {
      startTransition(() => {
        setResults([]);
        setErrors([]);
        setSelectedProfileIds(new Set());
        setResultsSource(null);
      });
      return;
    }

    void loadSavedResults(selectedJobId);
  }, [selectedJobId]);

  const loadJobs = async () => {
    try {
      const result = await getPublicJobs();
      const jobList = result.data;
      setJobs(jobList);
      if (jobList.length > 0) setSelectedJobId(jobList[0].id);
      setLoadError('');
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Erro ao carregar vagas');
    }
  };

  const loadSavedResults = async (jobId: string) => {
    setLoadingSavedResults(true);
    try {
      const savedResults = await getBulkResults(jobId);
      startTransition(() => {
        setResults(savedResults || []);
        setErrors([]);
        setSelectedProfileIds(new Set());
        setExpandedIdx(null);
        setResultsSource((savedResults || []).length > 0 ? 'stored' : null);
      });
    } catch {
      startTransition(() => {
        setResults([]);
        setResultsSource(null);
      });
    } finally {
      setLoadingSavedResults(false);
    }
  };

  // Parse bulk text into candidates
  // Format: one candidate per block, separated by "---"
  // Each block:
  //   Nome: João Silva
  //   Telefone: 5511999999999
  //   CV: [text...]
  const parseBulkText = () => {
    const blocks = bulkText.split('---').filter((b) => b.trim());
    const parsed: Candidate[] = [];
    for (const block of blocks) {
      const nameMatch = block.match(/Nome:\s*(.+)/i);
      const phoneMatch = block.match(/Telefone:\s*(.+)/i);
      const cvMatch = block.match(/CV:\s*([\s\S]+)/i);
      if (nameMatch && phoneMatch && cvMatch) {
        parsed.push({
          name: nameMatch[1].trim(),
          phone: phoneMatch[1].trim(),
          email: '',
          cvText: cvMatch[1].trim(),
        });
      }
    }
    setCandidates(parsed);
  };

  const addCandidate = () => {
    setCandidates([...candidates, { name: '', phone: '', email: '', cvText: '' }]);
  };

  const updateCandidate = (idx: number, field: keyof Candidate, value: string) => {
    const updated = [...candidates];
    updated[idx] = { ...updated[idx], [field]: value };
    setCandidates(updated);
  };

  const removeCandidate = (idx: number) => {
    setCandidates(candidates.filter((_, i) => i !== idx));
  };

  const handleAnalyze = async () => {
    if (!selectedJobId || candidates.length === 0) return;
    setAnalyzing(true);
    setAnalyzeError('');
    startTransition(() => {
      setResults([]);
      setErrors([]);
      setSelectedProfileIds(new Set());
      setExpandedIdx(null);
      setResultsSource(null);
    });
    try {
      const job = await JobQueue.createJob(
        'recruiter.bulk_analyze',
        {
          jobId: selectedJobId,
          candidates,
        },
        user?.id
      );

      if (!job) throw new Error('Falha ao iniciar triagem');

      // We listen for the result
      const unsubscribe = JobQueue.subscribe((updatedJob) => {
        if (updatedJob.id === job.id) {
          if (updatedJob.status === 'completed') {
            startTransition(() => {
              setResults(updatedJob.result?.candidates || []);
              setErrors(updatedJob.result?.errors || []);
              setResultsSource((updatedJob.result?.candidates || []).length > 0 ? 'fresh' : null);
              setAnalyzing(false);
            });
            unsubscribe();
          } else if (updatedJob.status === 'failed') {
            setAnalyzeError(updatedJob.error || 'Erro na análise IA');
            setAnalyzing(false);
            unsubscribe();
          }
        }
      });
    } catch (err: any) {
      setAnalyzeError(err.message || 'Erro ao iniciar análise');
      setAnalyzing(false);
    }
  };

  const toggleSelect = (profileId: string) => {
    setSelectedProfileIds((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) next.delete(profileId);
      else next.add(profileId);
      return next;
    });
  };

  const selectTop = (n: number) => {
    const top = results.slice(0, n).map((c) => c.profile_id);
    setSelectedProfileIds(new Set(top));
  };

  const handleDispatch = async () => {
    if (selectedProfileIds.size === 0) return;
    setDispatching(true);
    setDispatchResult(null);

    const selected = results.filter((c) => selectedProfileIds.has(c.profile_id));
    let ok = 0;
    let fail = 0;

    const jobTitle = jobs.find((j) => j.id === selectedJobId)?.title || '';
    const companyName = jobs.find((j) => j.id === selectedJobId)?.company || '';

    // We create individual jobs for better tracking of bulk invites
    const jobPromises = selected.map((c) =>
      JobQueue.createJob(
        'recruiter.invite_candidate',
        {
          phone: c.phone || '',
          name: c.name || '',
          jobId: selectedJobId,
          jobTitle,
          companyName,
          scenario: 'direct' as const,
          recruiterId: user?.id || '',
        },
        user?.id
      )
    );

    const createdJobs = await Promise.all(jobPromises);
    ok = createdJobs.filter((j) => !!j).length;
    fail = createdJobs.length - ok;

    setDispatchResult({ ok, fail });
    setDispatching(false);

    // UI Feedback: since these are jobs, we inform the user they are being processed
    if (ok > 0) {
      alert(`${ok} convites enfileirados para disparo via WhatsApp.`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-heading">
          Triagem{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-500">
            Inteligente
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
          Ranquemanento neural de alta performance com disparo autônomo via WhatsApp.
        </p>
      </div>

      {/* Step 1: Select Job */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
            1
          </span>
          <h2 className="font-bold text-slate-900 dark:text-white">Selecione a Vaga</h2>
        </div>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="">Selecione uma vaga...</option>
          {(jobs || []).map((j) => (
            <option key={j.id} value={j.id}>
              {j.title} — {j.company} ({j.location})
            </option>
          ))}
        </select>
        {loadError && (
          <div className="mt-3 p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 text-sm text-red-700 dark:text-red-300">
            {loadError}
          </div>
        )}
      </div>

      {/* Step 2: Input Candidates */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h2 className="font-bold text-slate-900 dark:text-white">
              Currículos dos Candidatos ({candidates.length})
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addCandidate}
              className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              + Adicionar
            </button>
          </div>
        </div>

        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            💡 <strong>Formato:</strong> Cole os currículos abaixo separados por{' '}
            <code className="px-1 bg-amber-100 dark:bg-amber-800 rounded">---</code>
          </p>
          <pre className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 bg-amber-100 dark:bg-amber-900/20 p-2 rounded-lg overflow-x-auto">
            {`Nome: João Silva
Telefone: 5511999999999
CV: [cole o texto do currículo aqui]
---
Nome: Maria Santos
Telefone: 5521988888888
CV: [cole o texto do currículo aqui]`}
          </pre>
        </div>

        <textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder="Cole os currículos no formato acima..."
          rows={8}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-mono"
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={parseBulkText}
            disabled={!bulkText.trim()}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 disabled:opacity-50 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <Upload size={14} className="inline mr-1" /> Processar Texto
          </button>
          <span className="text-xs text-slate-400 self-center">
            {candidates.length} candidatos parseados
          </span>
        </div>

        {/* Individual candidate cards */}
        {candidates.length > 0 && (
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {candidates.map((c, idx) => (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-700 rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">Candidato #{idx + 1}</span>
                  <button
                    onClick={() => removeCandidate(idx)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={c.name}
                    onChange={(e) => updateCandidate(idx, 'name', e.target.value)}
                    placeholder="Nome"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    value={c.phone}
                    onChange={(e) => updateCandidate(idx, 'phone', e.target.value)}
                    placeholder="Telefone (5511999999999)"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <textarea
                  value={c.cvText}
                  onChange={(e) => updateCandidate(idx, 'cvText', e.target.value)}
                  placeholder="Texto do currículo..."
                  rows={2}
                  className="w-full mt-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none resize-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={analyzing || !selectedJobId || candidates.length === 0}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-colors shadow-xl"
      >
        {analyzing ? (
          <>
            <Loader2 size={24} className="animate-spin" /> Analisando {candidates.length} currículos
            com IA...
          </>
        ) : (
          <>
            <Zap size={24} fill="currentColor" /> Analisar e Ranquear {candidates.length} Candidatos
          </>
        )}
      </button>

      {analyzeError && (
        <div className="p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 text-sm text-red-700 dark:text-red-300">
          {analyzeError}
        </div>
      )}

      {loadingSavedResults && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 size={14} className="animate-spin" />
          Carregando resultados salvos desta vaga...
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((e, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400"
            >
              <XCircle size={14} /> {e.name}: {e.error}
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Results */}
      {results.length > 0 && (
        <>
          {/* Summary bar */}
          {/* Tactical Insights Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 s-glass p-6 border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Candidatos
                  </span>
                  <p className="text-2xl font-black text-white">{results.length}</p>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                    Aprovados
                  </span>
                  <p className="text-2xl font-black text-emerald-500">
                    {results.filter((r) => r.recommendation === 'entrevistar').length}
                  </p>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">
                    Potenciais
                  </span>
                  <p className="text-2xl font-black text-amber-500">
                    {results.filter((r) => r.recommendation === 'talvez').length}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => selectTop(5)}
                  className="px-4 py-2 s-glass border-white/10 text-[10px] font-black uppercase hover:bg-white/10 transition-all"
                >
                  Top 5
                </button>
                <button
                  onClick={() => selectTop(10)}
                  className="px-4 py-2 s-glass border-white/10 text-[10px] font-black uppercase hover:bg-white/10 transition-all"
                >
                  Top 10
                </button>
                <button
                  onClick={() => selectTop(results.length)}
                  className="px-4 py-2 s-glass border-white/10 text-[10px] font-black uppercase hover:bg-white/10 transition-all"
                >
                  Todos
                </button>
              </div>
            </div>

            <div className="s-glass p-6 border-indigo-500/20 bg-indigo-500/5 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <Brain size={14} className="text-indigo-400" />
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                  Neural Match Avg
                </span>
              </div>
              <p className="text-2xl font-black text-white">
                {Math.round(results.reduce((acc, r) => acc + r.matchScore, 0) / results.length)}%
              </p>
            </div>
          </div>

          {/* Ranked Table */}
          <div className="space-y-2">
            {(results || []).map((r, idx) => {
              const candidate = resolveBlindCandidateDisplay({
                candidateName: r.name,
                candidatePhone: r.phone,
                blindCandidate: r.blind_candidate,
                fallbackLabel: `Candidato ${idx + 1}`,
              });

              return (
                <div
                  key={r.profile_id}
                  className={`border rounded-2xl overflow-hidden transition-all ${
                    selectedProfileIds.has(r.profile_id)
                      ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer"
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  >
                    {/* Rank badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                        idx === 0
                          ? 'bg-yellow-400 text-yellow-900'
                          : idx === 1
                            ? 'bg-slate-300 text-slate-700'
                            : idx === 2
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      #{idx + 1}
                    </div>

                    {/* Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(r.profile_id);
                      }}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selectedProfileIds.has(r.profile_id)
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {selectedProfileIds.has(r.profile_id) && <CheckCircle2 size={14} />}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {candidate.label}
                        </p>
                        {r.blind_candidate?.enabled && (
                          <span className="text-[10px] px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full shrink-0 font-bold uppercase tracking-wide">
                            Blind
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                            r.recommendation === 'entrevistar'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : r.recommendation === 'talvez'
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {r.recommendation === 'entrevistar'
                            ? '✅ Entrevistar'
                            : r.recommendation === 'talvez'
                              ? '⚠️ Talvez'
                              : '❌ Rejeitar'}
                        </span>
                      </div>
                      {candidate.phone && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {candidate.phone}
                        </p>
                      )}
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <p
                        className={`text-xl font-black ${
                          r.matchScore >= 70
                            ? 'text-emerald-500'
                            : r.matchScore >= 40
                              ? 'text-amber-500'
                              : 'text-red-500'
                        }`}
                      >
                        {r.matchScore}%
                      </p>
                      <p className="text-[10px] text-slate-400">match</p>
                    </div>

                    <ChevronDown
                      size={16}
                      className={`text-slate-400 shrink-0 transition-transform ${expandedIdx === idx ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {/* Expanded details */}
                  {expandedIdx === idx && (
                    <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-700 space-y-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300 italic mt-3">
                        {r.summary}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                            Pontos Fortes
                          </p>
                          <ul className="space-y-1">
                            {(r.strengths || []).map((s, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400"
                              >
                                <CheckCircle2
                                  size={12}
                                  className="text-emerald-500 mt-0.5 shrink-0"
                                />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                            Preocupações
                          </p>
                          <ul className="space-y-1">
                            {(r.concerns || []).map((c, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400"
                              >
                                <AlertTriangle size={12} className="text-red-500 mt-0.5 shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dispatch Button */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Disparar Convites WhatsApp
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedProfileIds.size} candidato(s) selecionado(s) → {selectedProfileIds.size}{' '}
                  crédito(s) consumido(s)
                </p>
              </div>
            </div>

            {dispatchResult && (
              <div
                className={`p-3 rounded-xl mb-3 text-sm font-bold flex items-center gap-2 ${
                  dispatchResult.fail === 0
                    ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}
              >
                {dispatchResult.fail === 0 ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
                {dispatchResult.ok} enviado(s) com sucesso
                {dispatchResult.fail > 0 ? `, ${dispatchResult.fail} falha(s)` : ''}
              </div>
            )}

            <button
              onClick={handleDispatch}
              disabled={dispatching || selectedProfileIds.size === 0}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {dispatching ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Enviando convites...
                </>
              ) : (
                <>
                  <MessageCircle size={16} /> Enviar {selectedProfileIds.size} Convite(s) via
                  WhatsApp
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BulkAnalysis;
