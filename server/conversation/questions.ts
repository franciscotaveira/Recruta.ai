/**
 * AI-powered question generator
 * Creates contextual pre-screening questions based on job requirements.
 * Optimized for Strategic Screening and Behavioral Assessment.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

export interface GeneratedQuestion {
  text: string;
  category: 'experience' | 'technical' | 'behavioral' | 'motivation' | 'availability';
}

/**
 * Generates 3-5 pre-screening questions tailored to the job.
 * Uses OpenRouter (Gemini 3/2.5) for superior reasoning and availability.
 */
export async function generateQuestions(
  jobTitle: string,
  jobDescription: string,
  count: number = 4,
  options?: {
    ragContext?: string;
  }
): Promise<GeneratedQuestion[]> {
  if (!OPENROUTER_API_KEY) {
    return DEFAULT_QUESTIONS.slice(0, count);
  }

  const ragContext = String(options?.ragContext || '').trim();

  // Modelos de 2026 (conforme painel do usuário)
  const models = [
    'google/gemini-3-flash-preview',
    'google/gemini-2.5-flash',
    'google/gemini-2.0-flash-001',
  ];

  for (const model of models) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://recrutaria.com.br',
          'X-Title': 'Recruta.AI',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: `Você é um Especialista em Recrutamento de Elite (Nível Sênior/Partner) focado em Metodologias Ágeis de Seleção e Psicologia Organizacional.

Sua missão é criar perguntas de triagem que utilizem as técnicas BARS, Entrevista Situacional, STAR, PAR e CAR para identificar o TALENTO REAL do candidato.

DIRETRIZES DE ENGENHARIA DE RH:
1. MULTI-METODOLOGIA: Escolha a técnica certa (SITUACIONAL para julgamento, STAR/PAR para resultados, BARS para comportamento).
2. FOCO EM EVIDÊNCIA: A pergunta deve induzir o candidato a trazer fatos reais ou resoluções lógicas, nunca respostas genéricas.
3. CENÁRIOS DE "STRESS TEST": Para vagas de Vendas/Atendimento, proponha cenários críticos de conflito, objeção de preço ou pressão por metas.
4. LINGUAGEM DO NEGÓCIO: Se a vaga é Vendas, use termos como "Funil", "Objeção", "Fechamento", "CAC". Se for Suporte, fale de "Empatia", "Resolução" e "SLA".
5. ZERO TECNÊS: Nunca use termos de TI (stack, deploy, bug) se a vaga for para áreas administrativas, vendas ou operacionais.
6. PROVOCATIVAS E CURTAS: O candidato deve ser desafiado a pensar rápido. Máximo 2 frases por pergunta.`,
            },
            {
              role: 'user',
              content: `Título da Vaga: ${jobTitle}
Descrição/Contexto: ${jobDescription}
${ragContext ? `\nContexto Organizacional (RAG):\n${ragContext}` : ''}

TAREFA:
Crie exatamente ${Math.max(3, count)} perguntas estratégicas para triagem via áudio no WhatsApp.

ESTRUTURA DESEJADA:
- Pergunta 1: Situacional Crítica (Cenário de desafio direto da função).
- Pergunta 2: Comportamental/Resiliência (Foco em como lida com falhas ou pressão).
- Pergunta 3: Técnica-Operacional (Metodologia de trabalho e busca por resultados).
- Pergunta 4+ (se aplicável): Motivação e Alinhamento Cultural.

Retorne APENAS um JSON no formato:
{
  "questions": [
    { "text": "texto da pergunta", "category": "behavioral|technical|motivation|experience" }
  ]
}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;

      if (text) {
        const parsed = JSON.parse(text) as { questions: GeneratedQuestion[] };
        if (parsed.questions && parsed.questions.length > 0) {
          return parsed.questions.slice(0, count);
        }
      }
    } catch (err) {
      // Tenta o próximo modelo
    }
  }

  return DEFAULT_QUESTIONS.slice(0, count);
}

const DEFAULT_QUESTIONS: GeneratedQuestion[] = [
  {
    text: 'Imagine que você recebeu um desafio com um prazo impossível. Como você organizaria suas prioridades para entregar o máximo de valor?',
    category: 'behavioral',
  },
  {
    text: 'Descreva uma situação em que você identificou uma falha em um processo e tomou a iniciativa de corrigi-la antes que virasse um problema.',
    category: 'experience',
  },
  {
    text: 'Se você tivesse que convencer um cliente ou gestor cético sobre uma ideia sua em apenas 60 segundos, qual seria sua estratégia?',
    category: 'technical',
  },
  {
    text: 'O que te faz querer superar seus próprios limites e como essa vaga se encaixa na sua visão de futuro?',
    category: 'motivation',
  },
];
