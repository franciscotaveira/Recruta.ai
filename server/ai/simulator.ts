import { GoogleGenAI, Type } from '@google/genai';
import { randomUUID } from 'crypto';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export type SimulatorRole = 'candidate' | 'recruiter';
export type SimulatorMood = 'skeptical' | 'interested' | 'angry' | 'busy' | 'confused';

export interface SimulationScenario {
  id: string;
  role: SimulatorRole;
  mood: SimulatorMood;
  objectionFocus?: string;
  context: string;
}

export interface ChatMessage {
  role: 'user' | 'model'; // 'user' is the SDR, 'model' is the Simulated Lead
  content: string;
}

export interface SimulationEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

/**
 * Helper to build the system prompt for the Simulated Lead.
 */
function buildLeadSystemPrompt(scenario: SimulationScenario): string {
  const roleDesc =
    scenario.role === 'recruiter'
      ? 'um Profissional de RH / Recrutador buscando otimizar seu processo seletivo ou reduzir custos'
      : 'um Candidato buscando emprego que quer ajuda para melhorar seu currículo e arrumar uma vaga';

  let moodDesc = '';
  switch (scenario.mood) {
    case 'skeptical':
      moodDesc =
        'Você é cético, faz muitas perguntas difíceis e não acredita em promessas fáceis de IA.';
      break;
    case 'interested':
      moodDesc =
        'Você está bastante interessado, mas precisa entender como funciona na prática antes de fechar.';
      break;
    case 'angry':
      moodDesc = 'Você está frustrado com as ferramentas atuais de mercado e tem pouca paciência.';
      break;
    case 'busy':
      moodDesc =
        'Você está extremamente ocupado, responde com frases curtas e diretas, querendo ir direto ao ponto.';
      break;
    case 'confused':
      moodDesc =
        'Você é leigo em tecnologia, tem muitas dúvidas básicas e tem medo de usar algo novo.';
      break;
  }

  const objection = scenario.objectionFocus
    ? `\nSua principal objeção/barreira será: "${scenario.objectionFocus}". Traga isso à tona durante a conversa de forma natural.`
    : '';

  return `Você é um simulador de treinamento para vendedores/SDRs. Você deve atuar ESTREITAMENTE como o seguinte cliente interagindo via Chat (WhatsApp ou Site).

PERFIL DO CLIENTE:
- Tipo: ${roleDesc}
- Comportamento: ${moodDesc}
- Contexto: ${scenario.context}${objection}

REGRAS DA INTERAÇÃO:
1. NUNCA saia do personagem. Você não é uma IA assistente, você é o Cliente.
2. Responda em português do Brasil de forma natural, imitando uma conversa real de chat (mensagens curtas a médias).
3. Seja reativo e natural. Se o vendedor (usuário) for bom, mostre progresso. Se for ruim, perca a paciência ou recuse a venda.
4. O usuário com quem você vai falar é o SDR vendendo os serviços do Recruta.AI.`;
}

/**
 * Generates the response from the Simulated Lead based on chat history.
 */
export async function generateSimulatedResponse(
  scenario: SimulationScenario,
  history: ChatMessage[]
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada');
  }

  const transcript = history
    .map((msg) => (msg.role === 'user' ? `SDR: ${msg.content}` : `Cliente: ${msg.content}`))
    .join('\n\n');

  const prompt = `${buildLeadSystemPrompt(scenario)}

Abaixo está o histórico do chat até agora. Responda APENAS com a sua próxima fala como Cliente. Não inclua o prefixo "Cliente: ".

HISTÓRICO:
${transcript}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
    },
  });

  if (!response.text) {
    throw new Error('Resposta vazia da simulação');
  }

  return response.text.trim();
}

/**
 * Evaluates the SDR's performance and generates actionable feedback.
 */
export async function evaluateSimulation(
  scenario: SimulationScenario,
  history: ChatMessage[]
): Promise<SimulationEvaluation> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada');
  }

  const transcript = history
    .map((msg) => (msg.role === 'user' ? `SDR: ${msg.content}` : `Cliente: ${msg.content}`))
    .join('\n\n');

  const prompt = `Você é um AI Sales Coach Master avaliando um treinamento de um SDR vendendo o sistema Recruta.AI para este cliente:
Perfil: ${scenario.role} | Estado Emocional: ${scenario.mood} | Objeção Principal: ${scenario.objectionFocus || 'Nenhuma'}

Analise a conversa abaixo entre o SDR e o Cliente. Avalie a performance do SDR (empatia, quebra de objeções, tom de voz, persuasão e fechamento).

HISTÓRICO DO CHAT:
${transcript}

Retorne APENAS um JSON com o seguinte formato exato:
- score: nota de 0 a 100 da performance geral
- strengths: array com 2 a 4 pontos fortes do SDR no chat
- weaknesses: array com 2 a 4 pontos de melhoria, onde o SDR falhou
- recommendation: 1 parágrafo curto de recomendação prática para a próxima vez`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING },
        },
        required: ['score', 'strengths', 'weaknesses', 'recommendation'],
      },
    },
  });

  if (!response.text) {
    throw new Error('Retorno vazio do avaliador');
  }

  const result = JSON.parse(response.text) as SimulationEvaluation;
  result.score = Math.max(0, Math.min(100, result.score));
  return result;
}
