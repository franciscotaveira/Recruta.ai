/**
 * AI Analysis — Generates candidate summary + match score
 * Analyzes transcribed responses against job requirements.
 */

import { smartAI } from './provider.js';

export interface CandidateCompetencyScore {
  requirementId: string;
  requirementText: string;
  category: string;
  weight: number;
  score: number;
  barsLevel: 1 | 2 | 3 | 4 | 5;
  evidence: 'fraca' | 'moderada' | 'forte';
  methodology: 'STAR' | 'BARS' | 'SITUATIONAL' | 'PAR' | 'CAR';
  evidenceType: 'behavioral' | 'technical' | 'situational';
  rationale: string;
}

export interface CandidateKnockoutSummary {
  status: 'pass' | 'fail';
  reason: string;
  requirementId?: string;
  requirementText?: string;
  weight?: number;
  questionType?: 'knockout';
  answer?: string;
  details?: Array<{
    requirementId?: string;
    requirementText?: string;
    weight?: number;
  }>;
}

export interface CandidateAnalysis {
  /** 0-100 match score */
  matchScore: number;
  /** 2-3 paragraph summary for the recruiter */
  summary: string;
  /** Key strengths identified */
  strengths: string[];
  /** Red flags or gaps */
  concerns: string[];
  /** Recommended next action */
  recommendation: 'entrevista' | 'rejeitar' | 'mais_info';
  /** Per-question assessment */
  questionScores: number[];
  /** Communication quality metrics (1-5 scale) */
  communicationPerformance?: {
    clarity: number;
    vocabulary: number;
    objectivity: number;
  };
  /** Competency evidence aligned with job requirements (BARS bands). */
  competencyScores?: CandidateCompetencyScore[];
  /** Knockout decision trail for eliminatory requirements. */
  knockout?: CandidateKnockoutSummary;
}

/**
 * Analyzes a candidate's transcribed responses against job requirements.
 */
export async function analyzeCandidate(
  jobTitle: string,
  jobDescription: string,
  companyName: string,
  questionsAndAnswers: { 
    question: string; 
    transcription: string;
    isAudio?: boolean;
    audioMetadata?: {
      clarity: number;
      confidence: number;
      tone: string;
    };
  }[],
  options?: {
    ragContext?: string;
    governanceNotes?: string[];
  }
): Promise<CandidateAnalysis> {
  const qaText = questionsAndAnswers
    .map((qa, i) => {
      const typeLabel = qa.isAudio ? '[ÁUDIO]' : '[TEXTO]';
      const voiceStats = qa.audioMetadata 
        ? ` (Clareza de Voz: ${qa.audioMetadata.clarity}/5, Confiança: ${qa.audioMetadata.confidence}/5, Tom: ${qa.audioMetadata.tone})`
        : '';
      return `P${i + 1} ${typeLabel}: ${qa.question}\nR: ${qa.transcription}${voiceStats}`;
    })
    .join('\n\n---\n\n');
  const ragContext = String(options?.ragContext || '').trim();
  const governanceNotes = Array.isArray(options?.governanceNotes)
    ? options?.governanceNotes.filter((note) => typeof note === 'string' && note.trim().length > 0)
    : [];

  const systemPrompt = `Você é um recrutador senior brasileiro analisando respostas de pré-seleção de candidatos.
VAGA:
- Cargo: ${jobTitle}
- Empresa: ${companyName}
- Descrição: ${jobDescription}

${ragContext ? `CONTEXTO DE REFERÊNCIA (RAG):\n${ragContext}\n` : ''}
${governanceNotes.length > 0 ? `REGRAS DE GOVERNANÇA:\n- ${governanceNotes.join('\n- ')}\n` : ''}`;

  const userContent = `RESPOSTAS DO CANDIDATO:
${qaText}

Analise as respostas e retorne APENAS um JSON com exatamente estas chaves:
- matchScore: número inteiro 0-100 indicando compatibilidade com a vaga
- summary: resumo em 2-3 parágrafos em português para o recrutador
- strengths: array de 3-5 pontos fortes identificados
- concerns: array de 0-3 preocupações ou lacunas
- recommendation: uma destas strings: "entrevista", "rejeitar", "mais_info"
- questionScores: array de números 0-100, um por pergunta, avaliando a qualidade da resposta
- communicationPerformance: objeto com clarity, vocabulary, objectivity (números inteiros 1-5)
- competencyScores: array de objetos com requirementId, requirementText, category, score, barsLevel (1-5), methodology (STAR|BARS|SITUATIONAL|PAR|CAR), evidenceType (behavioral|technical|situational), evidence (fraca|moderada|forte), rationale (justificativa técnica baseada em evidências).

Critérios para communicationPerformance:
- clarity: o quanto o candidato é fácil de entender, articulação e linha de raciocínio.
- vocabulary: uso de termos adequados à profissão e repertório linguístico.
- objectivity: o quanto o candidato vai direto ao ponto sem "encher linguiça".`;

  const resultText = await smartAI('deep_analysis', systemPrompt, userContent, true);
  const result = JSON.parse(resultText) as CandidateAnalysis;

  // Clamp score to valid range
  result.matchScore = Math.min(100, Math.max(0, Math.round(result.matchScore)));
  return result;
}
