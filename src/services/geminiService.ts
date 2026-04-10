import { GoogleGenAI, type GenerateContentResponse, Type } from '@google/genai';

const API_KEY =
  (import.meta as any).env?.VITE_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.API_KEY ||
  '';

if (!API_KEY) {
  console.warn(
    '[geminiService] GEMINI_API_KEY não configurada. As chamadas à IA irão falhar.'
  );
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
export interface CVAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  matchPercentage?: number;
}

export interface JobMatchResult {
  matchScore: number;
  reasoning: string;
  recommendations: string[];
}

export type AnalysisErrorCode =
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'INVALID_INPUT'
  | 'SERVICE_ERROR'
  | 'MISSING_API_KEY';

export interface AnalysisError {
  code: AnalysisErrorCode;
  message: string;
  retryAfter?: number; // ms
}

export interface SafeResult<T> {
  data: T | null;
  error: AnalysisError | null;
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const API_TIMEOUT = 30_000; // 30 s
const MAX_RETRIES = 2;

function validateInput(cvText: string): AnalysisError | null {
  if (!cvText || cvText.trim().length < 100) {
    return { code: 'INVALID_INPUT', message: 'Currículo muito curto (mín. 100 caracteres).' };
  }
  if (cvText.length > 50_000) {
    return { code: 'INVALID_INPUT', message: 'Currículo muito longo (máx. 50 000 caracteres).' };
  }
  return null;
}

/** Wraps a Gemini call with timeout + exponential-backoff retry + generic fallback. */
async function callWithRetry<T>(
  fn: () => Promise<T>,
  fallback: T,
  maxRetries = MAX_RETRIES
): Promise<SafeResult<T>> {
  if (!API_KEY) {
    return { data: fallback, error: { code: 'MISSING_API_KEY', message: 'Chave da API não configurada. Defina GEMINI_API_KEY.' } };
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error('TIMEOUT')), API_TIMEOUT)
      );
      const result = (await Promise.race([fn(), timeoutPromise])) as T;
      return { data: result, error: null };
    } catch (err: any) {
      const msg = err?.message ?? 'Erro desconhecido';

      // Timeout
      if (msg === 'TIMEOUT') {
        if (attempt === maxRetries - 1) {
          return { data: fallback, error: { code: 'TIMEOUT', message: 'Tempo limite excedido. Tente novamente.' } };
        }
      }

      // Rate limit (429)
      if (msg?.includes('429') || msg?.toLowerCase()?.includes('rate')) {
        const retryAfter = 2 ** attempt * 2000;
        if (attempt === maxRetries - 1) {
          return { data: fallback, error: { code: 'RATE_LIMIT', message: 'Limite de requisições atingido. Aguarde e tente novamente.', retryAfter } };
        }
        await sleep(retryAfter);
        continue;
      }

      // Last attempt exhausted
      if (attempt === maxRetries - 1) {
        console.error('[geminiService]', err);
        return { data: fallback, error: { code: 'SERVICE_ERROR', message: 'Serviço temporariamente indisponível. Tente em ~30 s.' } };
      }

      await sleep(2 ** attempt * 1000);
    }
  }

  return { data: null, error: { code: 'SERVICE_ERROR', message: 'Erro inesperado.' } };
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/** Analyzes a CV with retry + fallback. Prefer `analyzeCVSafe` in UI code. */
export async function analyzeCV(cvText: string): Promise<CVAnalysisResult> {
  const inputError = validateInput(cvText);
  if (inputError) {
    return { score: 0, strengths: [], weaknesses: [inputError.message], suggestions: [] };
  }

  const result = await analyzeCVSafe(cvText);
  return result.data ?? result.errorFallback;
}

/** Safe wrapper — returns `{ data, error }` plus a fallback for UI rendering. */
export async function analyzeCVSafe(
  cvText: string
): Promise<
  SafeResult<CVAnalysisResult> & { errorFallback: CVAnalysisResult }
> {
  const fallback: CVAnalysisResult = {
    score: 50,
    strengths: ['Tente novamente mais tarde.'],
    weaknesses: ['Serviço sobrecarregado.'],
    suggestions: ['Aguarde alguns segundos e tente novamente.'],
  };

  const inputError = validateInput(cvText);
  if (inputError) {
    return {
      data: null,
      error: inputError,
      errorFallback: { score: 0, strengths: [], weaknesses: [inputError.message], suggestions: ['Envie um currículo com mais conteúdo (experiência, habilidades, formação).'] },
    };
  }

  const result = await callWithRetry<CVAnalysisResult>(
    () => geminiAnalyzeCV(cvText),
    fallback
  );

  return { ...result, errorFallback: fallback };
}

async function geminiAnalyzeCV(cvText: string): Promise<CVAnalysisResult> {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Analyze this CV and provide a JSON object with exactly these keys: score (0-100 integer), strengths (string[]), weaknesses (string[]), suggestions (string[]).

CV:
${cvText}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['score', 'strengths', 'weaknesses', 'suggestions'],
      },
    },
  });

  if (!response.text) throw new Error('Resposta vazia da IA');
  return JSON.parse(response.text) as CVAnalysisResult;
}

// ------------------------------------------------------------------

export async function matchCVToJob(
  cvText: string,
  jobDescription: string
): Promise<JobMatchResult> {
  const inputError = validateInput(cvText);
  if (inputError) {
    return { matchScore: 0, reasoning: inputError.message, recommendations: [] };
  }

  const fallback: JobMatchResult = {
    matchScore: 0,
    reasoning: 'Não foi possível analisar o match no momento.',
    recommendations: ['Tente novamente mais tarde.'],
  };

  const result = await callWithRetry<JobMatchResult>(
    () => geminiMatchCV(cvText, jobDescription),
    fallback
  );

  return result.data ?? fallback;
}

async function geminiMatchCV(cvText: string, jobDescription: string): Promise<JobMatchResult> {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Compare this CV against the job description. Return a JSON object with exactly: matchScore (0-100 integer), reasoning (string), recommendations (string[]).

CV:
${cvText}

Job Description:
${jobDescription}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.INTEGER },
          reasoning: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['matchScore', 'reasoning', 'recommendations'],
      },
    },
  });

  if (!response.text) throw new Error('Resposta vazia da IA');
  return JSON.parse(response.text) as JobMatchResult;
}

// ------------------------------------------------------------------

export async function generateCVSuggestions(
  cvText: string,
  targetRole: string
): Promise<string[]> {
  const inputError = validateInput(cvText);
  if (inputError) return [];

  const fallback: string[] = ['Tente novamente mais tarde.'];

  const result = await callWithRetry<{ suggestions: string[] }>(
    () => geminiSuggestions(cvText, targetRole),
    { suggestions: fallback }
  );

  return result.data?.suggestions ?? fallback;
}

async function geminiSuggestions(
  cvText: string,
  targetRole: string
): Promise<{ suggestions: string[] }> {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `You are a professional CV writer. Given a CV and a target role, provide 5-8 specific, actionable suggestions to optimize it. Return a JSON object with exactly: suggestions (string[]).

CV:
${cvText}

Target Role: ${targetRole}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['suggestions'],
      },
    },
  });

  if (!response.text) throw new Error('Resposta vazia da IA');
  return JSON.parse(response.text) as { suggestions: string[] };
}
