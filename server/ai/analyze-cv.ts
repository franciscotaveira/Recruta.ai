/**
 * CV Analysis — uses the smart AI provider (free first, paid fallback)
 * Includes caching to avoid redundant API calls.
 */

import { smartAI } from './provider.js';
import { aiCache } from './cache.js';
import crypto from 'crypto';

export interface CVAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  reasoning?: string;
}

export interface AnalysisError {
  code: string;
  message: string;
}

export interface SafeResult {
  data: CVAnalysisResult | null;
  error: AnalysisError | null;
}

const FALLBACK: CVAnalysisResult = {
  score: 50,
  strengths: ['Tente novamente mais tarde.'],
  weaknesses: ['Serviço sobrecarregado.'],
  suggestions: ['Aguarde e tente novamente.'],
  reasoning: 'Análise indisponível no momento.',
};

/**
 * Generate cache key for CV analysis.
 * FIX: Uses SHA256 of the FULL CV text to avoid collision.
 * Previously used first 300 chars with MD5, causing two different CVs
 * with the same name/header to collide.
 */
function getCacheKey(cvText: string): string {
  return `cv_${crypto.createHash('sha256').update(cvText.trim()).digest('hex').substring(0, 24)}`;
}

export async function analyzeCVSafe(cvText: string): Promise<SafeResult> {
  if (!cvText || cvText.trim().length < 100) {
    return {
      data: null,
      error: { code: 'INVALID_INPUT', message: 'Currículo muito curto (mín. 100 caracteres)' },
    };
  }

  // Check cache first
  const cacheKey = getCacheKey(cvText);
  const cached = aiCache.get(cacheKey);
  if (cached) {
    console.log('[cv-analysis] 📦 Cache hit');
    return { data: cached as CVAnalysisResult, error: null };
  }

  try {
    const systemPrompt = `Analise este currículo de um candidato brasileiro e retorne APENAS JSON válido.`;
    const userContent = `Currículo:
${cvText.substring(0, 10000)}

Retorne JSON com:
- score: número inteiro 0-100 baseado nos padrões do mercado brasileiro
- strengths: array de 3-5 pontos fortes
- weaknesses: array de 3-5 pontos fracos ou áreas de melhoria
- suggestions: array de 3-5 sugestões específicas e acionáveis para melhorar o CV
- reasoning: resumo em 1-2 parágrafos em português`;

    const result = await smartAI('analyze', systemPrompt, userContent, true);
    const data = JSON.parse(result) as CVAnalysisResult;

    // Validate structure
    if (!data.score || !Array.isArray(data.strengths)) {
      throw new Error('Estrutura de resposta inválida');
    }

    // Clamp score to valid range (AI may return out-of-bounds values)
    data.score = Math.min(100, Math.max(0, Math.round(data.score)));

    // Cache for 7 days
    aiCache.set(cacheKey, data, 7 * 24 * 60 * 60 * 1000);

    return { data, error: null };
  } catch (err: any) {
    console.error('[cv-analysis] Error:', err.message);
    return {
      data: FALLBACK,
      error: { code: 'SERVICE_ERROR', message: err.message || 'Erro na análise' },
    };
  }
}
