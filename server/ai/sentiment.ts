import { smartAI } from './provider.js';

export interface ResponseSentiment {
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
  clarity: number; // 1-5
  keyInsights: string;
}

/**
 * Real-time analysis of a single candidate response.
 * Focuses on sentiment and immediate clarity for recruiter visibility.
 */
export async function analyzeResponseRealtime(
  question: string,
  transcription: string
): Promise<ResponseSentiment> {
  const systemPrompt = `Você é um observador de entrevistas em tempo real. Analise a resposta do candidato à pergunta fornecida.
Foque no tom de voz (através do texto) e clareza.`;

  const userContent = `PERGUNTA: ${question}
RESPOSTA: ${transcription}

Retorne APENAS um JSON com estas chaves:
- sentiment: "positive" | "neutral" | "negative" | "frustrated"
- clarity: número inteiro 1-5 (5 é excelente)
- keyInsights: uma frase curta resumindo a intenção central da resposta.`;

  try {
    const resultText = await smartAI('diag', systemPrompt, userContent, true);
    return JSON.parse(resultText) as ResponseSentiment;
  } catch (err) {
    console.error('[sentiment] Analysis failed:', err);
    return {
      sentiment: 'neutral',
      clarity: 3,
      keyInsights: 'Análise em tempo real indisponível.',
    };
  }
}
