import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAIRagSettings } from '../admin/ai-rag.js';

export interface RAGDocument {
  id: string;
  title: string;
  source: string;
  tags: string[];
  text: string;
}

export interface RAGRetrievalResult {
  used: boolean;
  context: string;
  citations: string[];
  selected: Array<{ id: string; title: string; source: string; score: number }>;
}

interface CachedResult {
  expiresAt: number;
  result: RAGRetrievalResult;
}

interface LoadedCorpus {
  docs: RAGDocument[];
  signature: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultCorpusPath = path.join(__dirname, '..', 'data', 'rag-corpus.json');

const DEFAULT_CORPUS: RAGDocument[] = [
  {
    id: 'core-architecture',
    title: 'Arquitetura de recrutamento aumentado',
    source: 'internal/notebooklm',
    tags: ['arquitetura', 'agentes', 'triagem'],
    text: 'Use arquitetura híbrida com workflows agenticos e roteamento hierárquico. Evite agente monolítico quando o número de skills cresce para preservar precisão e latência.',
  },
  {
    id: 'screening-discovery',
    title: 'Triagem como descoberta de talento',
    source: 'internal/notebooklm',
    tags: ['triagem', 'matching', 'predictive'],
    text: 'A triagem deve priorizar descoberta de evidências, não apenas rejeição. Estruture perguntas para capturar sinais de execução, contexto e resultado mensurável.',
  },
  {
    id: 'audio-structured',
    title: 'Entrevista assíncrona por áudio',
    source: 'internal/notebooklm',
    tags: ['audio', 'entrevista', 'mobile'],
    text: 'Entrevistas assíncronas reduzem o tempo de ciclo e aumentam completude. Perguntas abertas devem pedir formato Situação Ação Resultado com evidências concretas.',
  },
  {
    id: 'whatsapp-best-practices',
    title: 'Boas práticas de fluxo WhatsApp',
    source: 'internal/notebooklm',
    tags: ['whatsapp', 'ux', 'conversational-apply'],
    text: 'Fluxos conversacionais devem ser curtos e claros. Cada etapa com uma ação única, CTA objetivo e conclusão em menos de cinco minutos para reduzir abandono.',
  },
  {
    id: 'bias-mitigation',
    title: 'Mitigação de viés em decisões assistidas por IA',
    source: 'internal/notebooklm',
    tags: ['bias', 'compliance', 'governanca'],
    text: 'Mantenha decisão final humana para contratação. Registre trilha de auditoria, aplique revisão periódica de viés e evite inferências sem evidência observável.',
  },
  {
    id: 'candidate-experience',
    title: 'Experiência do candidato e transparência',
    source: 'internal/notebooklm',
    tags: ['candidate_experience', 'feedback', 'brand'],
    text: 'Candidatos aceitam melhor IA quando existe transparência de uso. Mensagens de status e feedback específico reduzem percepção de processo caixa-preta.',
  },
  {
    id: 'interviewer-intelligence',
    title: 'Inteligência para apoiar recrutador',
    source: 'internal/notebooklm',
    tags: ['recrutador', 'calibracao', 'qualidade'],
    text: 'Padronize roteiro de perguntas por vaga para comparação justa. Use scorecards por competência e destaque lacunas com base em evidências da resposta.',
  },
  {
    id: 'production-governance',
    title: 'Governança operacional de IA em RH',
    source: 'internal/notebooklm',
    tags: ['governanca', 'auditoria', 'human-in-the-loop'],
    text: 'Operações críticas devem ter limites claros de automação, fallback explícito, observabilidade e revisão humana obrigatória quando risco ou incerteza são altos.',
  },
];

const STOPWORDS = new Set([
  'a',
  'o',
  'e',
  'de',
  'da',
  'do',
  'das',
  'dos',
  'em',
  'para',
  'por',
  'com',
  'na',
  'no',
  'nas',
  'nos',
  'que',
  'um',
  'uma',
  'ao',
  'aos',
  'as',
  'os',
  'se',
  'ou',
  'como',
  'mais',
  'menos',
  'daquela',
  'deste',
  'esta',
  'esse',
  'isso',
  'sobre',
  'ser',
]);

let corpusCache: LoadedCorpus | null = null;
let corpusLoadedAt = 0;
const resultCache = new Map<string, CachedResult>();
const stats = {
  queries: 0,
  cacheHits: 0,
  cacheMisses: 0,
};

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function resolveCorpusPath(): string {
  const override = String(process.env.AI_RAG_CORPUS_PATH || '').trim();
  return override || defaultCorpusPath;
}

function sanitizeDoc(raw: unknown, fallbackId: string): RAGDocument | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;

  const id = String(row.id || fallbackId)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-');
  const title = String(row.title || '').trim();
  const source = String(row.source || '').trim();
  const text = String(row.text || '').trim();
  const tags = Array.isArray(row.tags)
    ? row.tags
        .map((tag) =>
          String(tag || '')
            .trim()
            .toLowerCase()
        )
        .filter((tag) => tag.length > 0)
    : [];

  if (!id || !title || !text) return null;

  return {
    id,
    title,
    source: source || 'internal/custom',
    tags,
    text,
  };
}

function readCorpusFromDisk(corpusPath: string): RAGDocument[] | null {
  try {
    if (!fs.existsSync(corpusPath)) return null;
    const raw = fs.readFileSync(corpusPath, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;

    const docs = parsed
      .map((row, index) => sanitizeDoc(row, `custom-${index + 1}`))
      .filter((doc): doc is RAGDocument => !!doc);

    return docs.length > 0 ? docs : null;
  } catch {
    return null;
  }
}

function computeSignature(docs: RAGDocument[]): string {
  const joined = docs
    .map((doc) => `${doc.id}:${doc.title}:${doc.source}:${doc.text.length}`)
    .join('|');
  return crypto.createHash('sha256').update(joined).digest('hex');
}

async function loadCorpus(): Promise<LoadedCorpus> {
  const now = Date.now();
  if (corpusCache && now - corpusLoadedAt < 30_000) return corpusCache;

  const corpusPath = resolveCorpusPath();
  const customDocs = readCorpusFromDisk(corpusPath);
  const docs = customDocs || DEFAULT_CORPUS;

  corpusCache = {
    docs,
    signature: computeSignature(docs),
  };
  corpusLoadedAt = now;
  return corpusCache;
}

function scoreDocument(queryTokens: string[], queryNormalized: string, doc: RAGDocument): number {
  if (queryTokens.length === 0) return 0;

  const titleNormalized = normalizeText(doc.title);
  const tagNormalized = normalizeText(doc.tags.join(' '));
  const bodyNormalized = normalizeText(doc.text);
  const merged = `${titleNormalized} ${tagNormalized} ${bodyNormalized}`;

  let score = 0;
  const uniqueTokens = Array.from(new Set(queryTokens));

  for (const token of uniqueTokens) {
    if (titleNormalized.includes(token)) score += 3;
    else if (tagNormalized.includes(token)) score += 2;
    else if (bodyNormalized.includes(token)) score += 1;
  }

  if (queryNormalized.length >= 8 && merged.includes(queryNormalized)) {
    score += 4;
  }

  const allTokensPresent = uniqueTokens.every((token) => merged.includes(token));
  if (allTokensPresent) score += 2;

  return score;
}

function trimText(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 1)).trim()}…`;
}

function emptyResult(): RAGRetrievalResult {
  return {
    used: false,
    context: '',
    citations: [],
    selected: [],
  };
}

export async function retrieveRAGContext(
  query: string,
  scope: 'analysis' | 'question_generation'
): Promise<RAGRetrievalResult> {
  const settings = await getAIRagSettings();
  if (!settings.enabled) return emptyResult();

  const queryNormalized = normalizeText(query);
  if (!queryNormalized) return emptyResult();

  const corpus = await loadCorpus();
  const cacheKey = crypto
    .createHash('sha256')
    .update(`${scope}:${queryNormalized}:${corpus.signature}:${JSON.stringify(settings)}`)
    .digest('hex');

  const now = Date.now();
  const cached = resultCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    stats.cacheHits += 1;
    stats.queries += 1;
    return cached.result;
  }

  stats.cacheMisses += 1;
  stats.queries += 1;

  const queryTokens = tokenize(queryNormalized);
  const ranked = corpus.docs
    .map((doc) => ({
      doc,
      score: scoreDocument(queryTokens, queryNormalized, doc),
    }))
    .filter((row) => row.score >= settings.minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, settings.topK);

  if (ranked.length === 0) {
    const result = emptyResult();
    resultCache.set(cacheKey, {
      expiresAt: now + settings.cacheTtlSeconds * 1000,
      result,
    });
    return result;
  }

  const maxPerDoc = Math.max(120, Math.floor(settings.maxContextChars / ranked.length));
  const selected = ranked.map((row) => ({
    id: row.doc.id,
    title: row.doc.title,
    source: row.doc.source,
    score: row.score,
  }));

  const context = ranked
    .map((row) => {
      const snippet = trimText(row.doc.text, maxPerDoc);
      return `[Fonte: ${row.doc.title} | ${row.doc.source}]\n${snippet}`;
    })
    .join('\n\n')
    .slice(0, settings.maxContextChars);

  const citations = settings.includeCitations
    ? Array.from(new Set(ranked.map((row) => `${row.doc.title} (${row.doc.source})`)))
    : [];

  const result: RAGRetrievalResult = {
    used: true,
    context,
    citations,
    selected,
  };

  resultCache.set(cacheKey, {
    expiresAt: now + settings.cacheTtlSeconds * 1000,
    result,
  });

  return result;
}

export async function getRAGDiagnostics(): Promise<{
  settings: Awaited<ReturnType<typeof getAIRagSettings>>;
  corpusSize: number;
  cacheEntries: number;
  cacheHitRate: number;
  corpusSignature: string;
}> {
  const settings = await getAIRagSettings();
  const corpus = await loadCorpus();
  const cacheHitRate = stats.queries > 0 ? stats.cacheHits / stats.queries : 0;

  return {
    settings,
    corpusSize: corpus.docs.length,
    cacheEntries: resultCache.size,
    cacheHitRate: Number(cacheHitRate.toFixed(4)),
    corpusSignature: corpus.signature,
  };
}

export function clearRAGCache(): void {
  resultCache.clear();
}

export function __scoreDocumentForTest(query: string, doc: RAGDocument): number {
  return scoreDocument(tokenize(query), normalizeText(query), doc);
}
