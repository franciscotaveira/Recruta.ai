/**
 * CV Analysis — uses the smart AI provider (free first, paid fallback)
 * Includes caching to avoid redundant API calls.
 */

import { smartAI } from './provider.js';
import { aiCache } from './cache.js';
import crypto from 'crypto';

export interface CVAnalysisResult {
  score: number;
  breakdown: {
    clarity: number;
    evidence: number;
    focus: number;
    freshness: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  attention_points: string[];
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
  breakdown: { clarity: 50, evidence: 50, focus: 50, freshness: 50 },
  strengths: ['Tente novamente mais tarde.'],
  weaknesses: ['Serviço sobrecarregado.'],
  suggestions: ['Aguarde e tente novamente.'],
  attention_points: ['Erro na comunicação com a IA'],
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

export async function analyzeCVSafe(
  cvText: string,
  jobRequirements?: string
): Promise<SafeResult> {
  if (!cvText || cvText.trim().length < 100) {
    return {
      data: null,
      error: { code: 'INVALID_INPUT', message: 'Currículo muito curto (mín. 100 caracteres)' },
    };
  }

  // Check cache (include job requirements in key if present)
  const cacheKey = getCacheKey(cvText + (jobRequirements || ''));
  const cached = aiCache.get(cacheKey);
  if (cached) {
    console.log('[cv-analysis] 📦 Cache hit');
    return { data: cached as CVAnalysisResult, error: null };
  }

  try {
    const isMatching = !!jobRequirements;
    const systemPrompt = isMatching
      ? `Você é um Recrutador de Elite especializado em Match de Candidatos. Sua tarefa é comparar um currículo com os requisitos de uma vaga específica.`
      : `Analise este currículo de um candidato brasileiro e retorne APENAS JSON válido.`;

    const matchingContext = isMatching
      ? `\n\nREQUISITOS DA VAGA:\n${jobRequirements}\n\nINSTRUÇÃO ADICIONAL: O score deve refletir a ADERÊNCIA do candidato a estes requisitos específicos.`
      : '';

    const userContent = `Currículo:
${cvText.substring(0, 10000)}${matchingContext}

Retorne JSON com:
- score: número inteiro 0-100 (Score de ${isMatching ? 'Aderência à Vaga' : 'Qualidade Global'})
- breakdown: objeto com scores 0-100 para { clarity, evidence, focus, freshness }
- strengths: array de 3-5 pontos fortes ${isMatching ? 'em relação à vaga' : ''}
- weaknesses: array de 3-5 pontos fracos ou gaps ${isMatching ? 'em relação à vaga' : ''}
- suggestions: array de 3-5 sugestões específicas para melhorar o perfil para esta oportunidade
- reasoning: resumo de 1-2 parágrafos justificando o match em português
- attention_points: array de 2-3 pontos críticos ou 'red flags'`;

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
