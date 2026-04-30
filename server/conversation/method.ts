import { isExplicitAcceptIntent, isExplicitDeclineIntent, normalizeUserText } from './intents.js';

export type RequirementImportance = 'must_have' | 'preferred';
export type RequirementEvidenceType = 'objective' | 'behavioral' | 'technical' | 'situational';
export type SessionQuestionType = 'knockout' | 'bars';

export interface StructuredRequirement {
  id: string;
  text: string;
  category: string;
  importance: RequirementImportance;
  weight: number;
  knockout: boolean;
  evidenceType: RequirementEvidenceType;
  knockoutQuestion?: string;
  barsAnchors: Record<1 | 2 | 3 | 4 | 5, string>;
}

export interface StructuredSessionQuestion {
  id: string;
  text: string;
  category: string;
  type: SessionQuestionType;
  requirementId?: string;
  requirementText?: string;
  weight?: number;
  barsAnchors?: Record<1 | 2 | 3 | 4 | 5, string>;
}

export interface CompetencyScore {
  requirementId: string;
  requirementText: string;
  category: string;
  weight: number;
  score: number;
  barsLevel: 1 | 2 | 3 | 4 | 5;
  evidence: 'fraca' | 'moderada' | 'forte';
  rationale: string;
}

function toRequirementId(text: string, idx: number): string {
  const slug = normalizeUserText(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug || `req-${idx + 1}`;
}

function clampWeight(value: unknown, fallback: number): number {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return fallback;
  return Math.max(1, Math.min(5, Math.round(raw)));
}

function inferCategory(text: string): string {
  const t = normalizeUserText(text);
  if (/(python|java|react|sql|api|dados|analise|análise|devops|cloud|typescript)/.test(t))
    return 'technical';
  if (/(lideranca|liderança|gestao|gestão|comunicacao|comunicação|conflito|time)/.test(t))
    return 'behavioral';
  if (/(prazo|meta|kpi|resultado|impacto|entrega|projeto)/.test(t)) return 'delivery';
  return 'experience';
}

function inferEvidenceType(category: string): RequirementEvidenceType {
  const c = normalizeUserText(category);
  if (/(technical|tecnico|tecnica)/.test(c)) return 'technical';
  if (/(behavioral|comportamental|soft)/.test(c)) return 'behavioral';
  if (/(situational|situacional|cenario|cenario)/.test(c)) return 'situational';
  return 'objective';
}

function normalizeImportance(rawImportance: unknown, rawType: unknown): RequirementImportance {
  const value = normalizeUserText(String(rawImportance ?? rawType ?? ''));
  if (/(must_have|must|mandatory|obrigatorio|obrigatória|obrigatorio)/.test(value))
    return 'must_have';
  return 'preferred';
}

function normalizeEvidenceType(
  rawEvidenceType: unknown,
  category: string
): RequirementEvidenceType {
  const value = normalizeUserText(String(rawEvidenceType || ''));
  if (/(technical|tecnico|tecnica|portfolio|portifolio|case)/.test(value)) return 'technical';
  if (/(behavioral|comportamental|experience|experiencia|audio_answer)/.test(value))
    return 'behavioral';
  if (/(situational|situacional|scenario|cenario)/.test(value)) return 'situational';
  if (/(objective|objetivo)/.test(value)) return 'objective';
  return inferEvidenceType(category);
}

function defaultBarsAnchors(
  evidenceType: RequirementEvidenceType
): Record<1 | 2 | 3 | 4 | 5, string> {
  if (evidenceType === 'technical') {
    return {
      1: 'Sem evidência técnica prática.',
      2: 'Conhecimento básico sem aplicação clara.',
      3: 'Aplicação técnica em contexto limitado.',
      4: 'Aplicação consistente com bons resultados.',
      5: 'Domínio técnico com impacto comprovado e replicável.',
    };
  }
  if (evidenceType === 'behavioral') {
    return {
      1: 'Sem exemplo comportamental observável.',
      2: 'Exemplo vago e sem ação clara.',
      3: 'Exemplo adequado com ação parcial.',
      4: 'Exemplo claro com ação e resultado consistente.',
      5: 'Exemplo robusto com liderança e impacto mensurável.',
    };
  }
  if (evidenceType === 'situational') {
    return {
      1: 'Não apresenta abordagem para o cenário.',
      2: 'Abordagem fraca e sem priorização.',
      3: 'Abordagem razoável com lacunas.',
      4: 'Boa abordagem com critérios e execução.',
      5: 'Abordagem excelente, estruturada e orientada a impacto.',
    };
  }
  return {
    1: 'Sem evidência suficiente.',
    2: 'Evidência fraca e genérica.',
    3: 'Evidência moderada.',
    4: 'Evidência forte e consistente.',
    5: 'Evidência excelente com resultados claros.',
  };
}

export function normalizeJobRequirements(input: unknown): StructuredRequirement[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((raw: any, idx): StructuredRequirement | null => {
      const text = typeof raw === 'string' ? raw.trim() : String(raw?.text || '').trim();
      if (!text) return null;

      const normalizedImportance = normalizeImportance(raw?.importance, raw?.type);
      const category = String(raw?.category || inferCategory(text)).trim() || 'experience';
      const evidenceType = normalizeEvidenceType(raw?.evidenceType, category);
      const fallbackWeight = normalizedImportance === 'must_have' ? 4 : 2;
      const weight = clampWeight(raw?.weight, fallbackWeight);
      const knockout = Boolean(raw?.knockout);

      const customAnchors =
        raw?.barsAnchors && typeof raw.barsAnchors === 'object' ? raw.barsAnchors : null;
      const defaults = defaultBarsAnchors(evidenceType);
      const barsAnchors: Record<1 | 2 | 3 | 4 | 5, string> = {
        1: String(customAnchors?.[1] || defaults[1]),
        2: String(customAnchors?.[2] || defaults[2]),
        3: String(customAnchors?.[3] || defaults[3]),
        4: String(customAnchors?.[4] || defaults[4]),
        5: String(customAnchors?.[5] || defaults[5]),
      };

      return {
        id: toRequirementId(text, idx),
        text,
        category,
        importance: normalizedImportance,
        weight,
        knockout,
        evidenceType,
        knockoutQuestion:
          typeof raw?.knockoutQuestion === 'string' ? raw.knockoutQuestion.trim() : undefined,
        barsAnchors,
      };
    })
    .filter((req): req is StructuredRequirement => !!req);
}

function buildKnockoutQuestion(jobTitle: string, req: StructuredRequirement): string {
  if (req.knockoutQuestion) return req.knockoutQuestion;
  return `Requisito eliminatório para a vaga de ${jobTitle}: ${req.text}. Você atende esse requisito hoje? Responda apenas SIM ou NÃO.`;
}

function buildBarsQuestion(jobTitle: string, req: StructuredRequirement): string {
  const isTechJob =
    /(dev|software|engenheiro|engineer|analista de sistemas|tecnologia|ti|fullstack|backend|frontend)/i.test(
      jobTitle
    );

  let evidenceHint = '';

  if (req.evidenceType === 'technical') {
    evidenceHint = isTechJob
      ? 'Explique a stack, sua decisão técnica e o impacto gerado.'
      : 'Explique a metodologia ou técnica que você utilizou e o resultado prático alcançado.';
  } else if (req.evidenceType === 'behavioral') {
    evidenceHint = 'Descreva a situação, sua ação específica e o resultado final (método STAR).';
  } else if (req.evidenceType === 'situational') {
    evidenceHint =
      'Como você agiu nesse cenário? Quais foram suas prioridades e o impacto da sua decisão?';
  } else {
    evidenceHint = 'Use o formato Situação -> Ação -> Resultado (STAR).';
  }

  return `Sobre "${req.text}", descreva um caso real da sua experiência. ${evidenceHint}`;
}

export function buildStructuredQuestions(
  jobTitle: string,
  requirements: StructuredRequirement[],
  options?: { maxKnockoutQuestions?: number; maxBarsQuestions?: number }
): StructuredSessionQuestion[] {
  const maxKnockout = Math.max(0, Math.min(options?.maxKnockoutQuestions ?? 5, 8));
  const maxBars = Math.max(1, Math.min(options?.maxBarsQuestions ?? 4, 8));

  const knockouts = requirements
    .filter((r) => r.knockout)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, maxKnockout)
    .map((r) => ({
      id: `ko_${r.id}`,
      text: buildKnockoutQuestion(jobTitle, r),
      category: r.category,
      type: 'knockout' as const,
      requirementId: r.id,
      requirementText: r.text,
      weight: r.weight,
    }));

  const bars = requirements
    .filter((r) => !r.knockout)
    .sort((a, b) => {
      if (a.importance === b.importance) return b.weight - a.weight;
      return a.importance === 'must_have' ? -1 : 1;
    })
    .slice(0, maxBars)
    .map((r) => ({
      id: `bars_${r.id}`,
      text: buildBarsQuestion(jobTitle, r),
      category: r.category,
      type: 'bars' as const,
      requirementId: r.id,
      requirementText: r.text,
      weight: r.weight,
      barsAnchors: r.barsAnchors,
    }));

  return [...knockouts, ...bars];
}

export function evaluateKnockoutReply(answer: string): 'pass' | 'fail' | 'unclear' {
  if (isExplicitAcceptIntent(answer)) return 'pass';
  if (isExplicitDeclineIntent(answer)) return 'fail';
  const t = normalizeUserText(answer);
  if (/^(sim|yes|ok|confirmo|atendo)\b/.test(t)) return 'pass';
  if (/^(nao|não|no|negativo|nao atendo|não atendo)\b/.test(t)) return 'fail';
  return 'unclear';
}

export function barsLevelFromScore(rawScore: number): 1 | 2 | 3 | 4 | 5 {
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  if (score < 20) return 1;
  if (score < 40) return 2;
  if (score < 60) return 3;
  if (score < 80) return 4;
  return 5;
}

export function computeCompetencyScores(
  rows: Array<{
    requirementId?: string;
    requirementText?: string;
    category?: string;
    weight?: number;
  }>,
  questionScores: number[]
): CompetencyScore[] {
  return rows
    .map((row, idx) => {
      if (!row.requirementId || !row.requirementText) return null;
      const score = Math.max(0, Math.min(100, Math.round(Number(questionScores[idx] ?? 50))));
      const barsLevel = barsLevelFromScore(score);
      const evidence: 'fraca' | 'moderada' | 'forte' =
        barsLevel <= 2 ? 'fraca' : barsLevel === 3 ? 'moderada' : 'forte';
      const rationale =
        evidence === 'forte'
          ? 'Evidência robusta com ação e resultado observável.'
          : evidence === 'moderada'
            ? 'Evidência parcial; há clareza, mas faltam métricas ou profundidade.'
            : 'Evidência fraca ou genérica; exige validação adicional.';

      return {
        requirementId: row.requirementId,
        requirementText: row.requirementText,
        category: String(row.category || 'experience'),
        weight: Math.max(1, Math.min(5, Math.round(Number(row.weight || 1)))),
        score,
        barsLevel,
        evidence,
        rationale,
      };
    })
    .filter((v): v is CompetencyScore => !!v);
}
