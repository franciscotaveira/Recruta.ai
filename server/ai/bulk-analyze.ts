/**
 * Bulk CV Analysis — analyzes multiple CVs against a job and returns ranked results
 * Uses smart AI routing (free first) + caching for cost optimization.
 */

import { smartAI } from './provider.js';
import { aiCache } from './cache.js';

export interface CVCandidate {
  name: string;
  phone: string;
  email?: string;
  cvText: string;
}

export interface CVAnalysis {
  name: string;
  phone: string;
  email?: string;
  cvText: string;
  matchScore: number;
  strengths: string[];
  concerns: string[];
  summary: string;
  recommendation: 'entrevistar' | 'rejeitar' | 'talvez';
}

export interface CVAnalysisError {
  name: string;
  phone: string;
  email?: string;
  error: string;
}

export interface BulkAnalysisResult {
  jobId: string;
  totalAnalyzed: number;
  candidates: CVAnalysis[];
  errors: CVAnalysisError[];
}

/**
 * Analyzes a single CV against job requirements.
 * Uses cache to avoid redundant API calls.
 */
async function analyzeSingleCV(
  cvText: string,
  jobTitle: string,
  jobDescription: string,
  jobRequirements: string
): Promise<Omit<CVAnalysis, 'name' | 'phone' | 'email' | 'cvText'>> {
  // Check cache first
  const cacheKey =
    `bulk_cv_${cvText.substring(0, 200).trim()}_${jobTitle}_${jobRequirements.substring(0, 100)}`
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 120);
  const cached = aiCache.get<Omit<CVAnalysis, 'name' | 'phone' | 'email' | 'cvText'>>(cacheKey);
  if (cached) {
    return cached;
  }

  const systemPrompt = `Você é um recrutador brasileiro analisando um currículo para uma vaga. Retorne APENAS JSON válido.`;

  const userContent = `VAGA: ${jobTitle}
DESCRIÇÃO: ${jobDescription}
REQUISITOS: ${jobRequirements}

Currículo do candidato:
${cvText.substring(0, 8000)}

Retorne JSON com:
- matchScore: número inteiro 0-100
- strengths: array de 2-3 pontos fortes
- concerns: array de 1-2 preocupações
- summary: resumo em 1 frase em português
- recommendation: "entrevistar", "rejeitar" ou "talvez"`;

  const result = await smartAI('analyze', systemPrompt, userContent, true);

  try {
    const parsed = JSON.parse(result);
    // Clamp score to valid range
    parsed.matchScore = Math.min(100, Math.max(0, Math.round(parsed.matchScore || 0)));
    // Cache for 30 days (job requirements don't change often)
    aiCache.set(cacheKey, parsed, 30 * 24 * 60 * 60 * 1000);
    return parsed;
  } catch {
    throw new Error('Resposta inválida da IA');
  }
}

/**
 * Analyzes multiple CVs against a job, returns ranked results.
 */
export async function bulkAnalyzeCVs(
  candidates: CVCandidate[],
  jobTitle: string,
  jobDescription: string,
  jobRequirements: string,
  jobId: string,
  maxConcurrent: number = 3
): Promise<BulkAnalysisResult> {
  const results: CVAnalysis[] = [];
  const errors: CVAnalysisError[] = [];

  // Process in batches to avoid rate limits
  for (let i = 0; i < candidates.length; i += maxConcurrent) {
    const batch = candidates.slice(i, i + maxConcurrent);
    const batchResults = await Promise.allSettled(
      batch.map(async (c) => {
        const analysis = await analyzeSingleCV(c.cvText, jobTitle, jobDescription, jobRequirements);
        return { ...c, ...analysis };
      })
    );

    for (let j = 0; j < batchResults.length; j++) {
      const r = batchResults[j];
      if (r.status === 'fulfilled') {
        results.push(r.value);
      } else {
        errors.push({
          name: batch[j].name,
          phone: batch[j].phone,
          email: batch[j].email,
          error: r.reason?.message || 'Erro na análise',
        });
      }
    }

    // Small delay between batches
    if (i + maxConcurrent < candidates.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Sort by matchScore descending
  results.sort((a, b) => b.matchScore - a.matchScore);

  return {
    jobId,
    totalAnalyzed: results.length,
    candidates: results,
    errors,
  };
}
