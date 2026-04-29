import React, { useState } from 'react';
import { X, Plus, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { postJob } from '../../services/api';
import { JobQueue } from '../../lib/JobQueue';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type RequirementImportance = 'must_have' | 'preferred';
type RequirementEvidenceType = 'objective' | 'behavioral' | 'technical' | 'situational';

interface StructuredRequirementInput {
  id: string;
  text: string;
  category: string;
  importance: RequirementImportance;
  weight: number;
  knockout: boolean;
  evidenceType: RequirementEvidenceType;
  knockoutQuestion: string;
}

const createDefaultRequirement = (text = ''): StructuredRequirementInput => ({
  id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  text,
  category: 'skill',
  importance: 'preferred',
  weight: 3,
  knockout: false,
  evidenceType: 'behavioral',
  knockoutQuestion: '',
});

const clampWeight = (value: number): number => {
  if (!Number.isFinite(value)) return 3;
  return Math.max(1, Math.min(5, Math.round(value)));
};

const PostJobModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [requirementDraft, setRequirementDraft] = useState('');
  const [structuredRequirements, setStructuredRequirements] = useState<
    StructuredRequirementInput[]
  >([]);
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  if (!open) return null;

  const addStructuredRequirement = () => {
    const text = requirementDraft.trim();
    if (!text) return;
    setStructuredRequirements((prev) => [...prev, createDefaultRequirement(text)]);
    setRequirementDraft('');
  };

  const removeStructuredRequirement = (id: string) => {
    setStructuredRequirements((prev) => prev.filter((req) => req.id !== id));
  };

  const updateStructuredRequirement = (id: string, patch: Partial<StructuredRequirementInput>) => {
    setStructuredRequirements((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;
        return { ...req, ...patch };
      })
    );
  };

  const buildRequirementsPayload = () => {
    const quickRequirements = requirements
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text) => createDefaultRequirement(text));

    const mergedByText = new Map<string, StructuredRequirementInput>();
    for (const req of [...quickRequirements, ...structuredRequirements]) {
      const normalizedText = req.text.trim();
      if (!normalizedText) continue;
      mergedByText.set(normalizedText.toLowerCase(), {
        ...req,
        text: normalizedText,
        weight: clampWeight(req.weight),
      });
    }

    return Array.from(mergedByText.values()).map((req) => ({
      text: req.text,
      category: req.category || 'skill',
      importance: req.importance,
      weight: req.weight,
      knockout: req.knockout,
      evidenceType: req.evidenceType,
      knockoutQuestion: req.knockout
        ? req.knockoutQuestion?.trim() || `Descreva sua experiência prática com: ${req.text}.`
        : undefined,
    }));
  };

  const handleSubmit = async () => {
    if (!title || !company || !location || !description) return;
    setPosting(true);
    setResult(null);
    try {
      const reqs = buildRequirementsPayload();
      const job = await JobQueue.createJob('recruiter.post_job', { 
        title, company, location, description, requirements: reqs 
      }, user?.id);

      if (!job) throw new Error("Falha ao criar ação de publicação");

      setResult({
        ok: true,
        msg: 'Ação de publicação enviada! A vaga será processada em breve.',
      });
      
      setTitle('');
      setCompany('');
      setLocation('');
      setDescription('');
      setRequirements('');
      setRequirementDraft('');
      setStructuredRequirements([]);
      
      setTimeout(() => {
        onSuccess?.();
      }, 1500);

    } catch (err: any) {
      setResult({ ok: false, msg: err.message || 'Erro ao publicar vaga' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <Plus size={18} className="text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Publicar Vaga (Board Público)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500">
            <X size={22} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Esta vaga ficará visível no <strong>board de vagas</strong> dos candidatos, que
              poderão se candidatar diretamente.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Título da Vaga
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Analista de Marketing Pleno"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Empresa
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="TechCorp"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Localização
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="São Paulo, SP"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descreva a vaga, responsabilidades e requisitos..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Requisitos rápidos (compatibilidade, um por linha)
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              placeholder="React, TypeScript&#10;3+ anos de experiência&#10;Inglês intermediário"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/70 dark:bg-slate-800/40">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Requisitos estruturados (método de triagem)
            </label>

            <div className="flex gap-2">
              <input
                value={requirementDraft}
                onChange={(e) => setRequirementDraft(e.target.value)}
                placeholder="Ex: Experiência com atendimento consultivo B2B"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                type="button"
                onClick={addStructuredRequirement}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                Adicionar
              </button>
            </div>

            {structuredRequirements.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dica: adicione os requisitos críticos aqui para configurar importância, peso e
                knockout.
              </p>
            )}

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {structuredRequirements.map((req) => (
                <div
                  key={req.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      value={req.text}
                      onChange={(e) =>
                        updateStructuredRequirement(req.id, { text: e.target.value })
                      }
                      placeholder="Requisito"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeStructuredRequirement(req.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label="Remover requisito"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={req.importance}
                      onChange={(e) =>
                        updateStructuredRequirement(req.id, {
                          importance: e.target.value as RequirementImportance,
                        })
                      }
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                    >
                      <option value="must_have">Obrigatório (must-have)</option>
                      <option value="preferred">Importante (preferred)</option>
                    </select>

                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={req.weight}
                      onChange={(e) =>
                        updateStructuredRequirement(req.id, {
                          weight: clampWeight(Number(e.target.value)),
                        })
                      }
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                      placeholder="Peso"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={req.evidenceType}
                      onChange={(e) =>
                        updateStructuredRequirement(req.id, {
                          evidenceType: e.target.value as RequirementEvidenceType,
                        })
                      }
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                    >
                      <option value="objective">Pergunta objetiva</option>
                      <option value="behavioral">Comportamental (STAR)</option>
                      <option value="technical">Técnica</option>
                      <option value="situational">Situacional</option>
                    </select>

                    <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={req.knockout}
                        onChange={(e) =>
                          updateStructuredRequirement(req.id, { knockout: e.target.checked })
                        }
                      />
                      Requisito eliminatório
                    </label>
                  </div>

                  {req.knockout && (
                    <input
                      value={req.knockoutQuestion}
                      onChange={(e) =>
                        updateStructuredRequirement(req.id, { knockoutQuestion: e.target.value })
                      }
                      placeholder="Pergunta eliminatória (opcional)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {result && (
            <div
              className={`flex items-start gap-3 p-3 rounded-xl border ${
                result.ok
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
              }`}
            >
              <CheckCircle
                size={16}
                className={`mt-0.5 shrink-0 ${result.ok ? 'text-emerald-600' : 'text-red-600'}`}
              />
              <p
                className={`text-sm ${result.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}
              >
                {result.msg}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={posting || !title || !company || !location || !description}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {posting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Publicando...
              </>
            ) : (
              'Publicar Vaga'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostJobModal;
