/**
 * AI Provider Router — tries free models first, falls back to paid
 *
 * Priority:
 *   1. OpenRouter free models (zero cost)
 *   2. Gemini via @google/genai (free tier: 15 RPM)
 *   3. OpenRouter paid models (paid)
 *   4. OpenAI direct (paid, last resort)
 *
 * Cost optimization strategies:
 *   - Cache prompts with ETag-like hashing
 *   - Use smaller models for simple tasks (matching, summary)
 *   - Use larger models only for complex analysis
 *   - Batch multiple requests in single calls when possible
 */

import fetch from 'node-fetch';

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions';
const OPENAI_BASE = 'https://api.openai.com/v1/chat/completions';

// ── Free models on OpenRouter ──────────────────────────────────
const FREE_MODELS = {
  analyze: 'google/gemini-2.0-flash-exp:free', // CV analysis
  transcribe: 'meta-llama/llama-3.3-70b-instruct:free', // audio summary
  match: 'qwen/qwen-2.5-72b-instruct:free', // candidate-job matching
  questions: 'google/gemini-2.0-flash-exp:free', // pre-screening questions
  summarize: 'google/gemini-2.0-flash-exp:free', // candidate summary
  diag: 'google/gemini-2.0-flash-exp:free', // diagnostic check
  deep_analysis: 'google/gemini-2.0-flash-exp:free', // intensive interview evaluation
};

// AI call timeout in milliseconds
const AI_TIMEOUT_MS = 30_000;

// ── Paid fallback models ───────────────────────────────────────
const PAID_MODELS = {
  analyze: 'anthropic/claude-sonnet-4-20250514',
  transcribe: 'openai/gpt-4o',
  match: 'openai/gpt-4o-mini',
  questions: 'openai/gpt-4o-mini',
  summarize: 'openai/gpt-4o-mini',
  diag: 'openai/gpt-4o-mini',
  deep_analysis: 'anthropic/claude-3.5-sonnet',
};

interface AIResponse {
  text: string;
  model: string;
  tokensUsed?: number;
}

/**
 * Calls OpenRouter with a model.
 */
async function callOpenRouter(
  model: string,
  messages: Array<{ role: string; content: string }>,
  jsonMode: boolean = false
): Promise<AIResponse | null> {
  if (!OPENROUTER_KEY) return null;

  try {
    const res = await fetch(OPENROUTER_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://recruta.ai',
        'X-Title': 'Recruta.AI',
      },
      body: JSON.stringify({
        model,
        messages,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        max_tokens: 2000,
        temperature: 0.3, // Lower temperature for consistent results
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn(`[openrouter] ${model} failed: ${res.status} ${err.substring(0, 200)}`);
      return null;
    }

    const data: any = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return {
      text: content,
      model,
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (err: any) {
    console.warn(`[openrouter] ${model} error:`, err.message);
    return null;
  }
}

/**
 * Calls Gemini via Google AI API
 */
async function callGemini(
  systemPrompt: string,
  userContent: string,
  jsonMode: boolean = false
): Promise<AIResponse | null> {
  if (!GEMINI_KEY) return null;

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `${systemPrompt}\n\n${userContent}`,
        config: jsonMode
          ? {
              responseMimeType: 'application/json',
            }
          : undefined,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), AI_TIMEOUT_MS)
      ),
    ]);

    if (!response.text) return null;
    return { text: response.text, model: 'gemini-2.0-flash' };
  } catch (err: any) {
    console.warn('[gemini] Error:', err.message);
    return null;
  }
}

/**
 * Calls OpenAI directly (most expensive, last resort)
 */
async function callOpenAI(
  model: string,
  messages: Array<{ role: string; content: string }>,
  jsonMode: boolean = false
): Promise<AIResponse | null> {
  if (!OPENAI_KEY) return null;

  try {
    const res = await fetch(OPENAI_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        max_tokens: 2000,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });

    if (!res.ok) return null;
    const data: any = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return {
      text: content,
      model,
      tokensUsed: data.usage?.total_tokens,
    };
  } catch {
    return null;
  }
}

/**
 * Smart AI call — tries free first, falls back through tiers.
 * Logs which tier was used for cost tracking.
 */
export async function smartAI(
  task: keyof typeof FREE_MODELS,
  systemPrompt: string,
  userContent: string,
  jsonMode: boolean = false
): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];

  // Tier 1: OpenRouter free model (zero cost)
  const freeResult = await callOpenRouter(FREE_MODELS[task], messages, jsonMode);
  if (freeResult) {
    console.log(`[ai] ✅ ${task} via OpenRouter FREE (${FREE_MODELS[task]})`);
    return freeResult.text;
  }

  // Tier 2: Gemini (free tier, 15 RPM)
  const geminiResult = await callGemini(systemPrompt, userContent, jsonMode);
  if (geminiResult) {
    console.log(`[ai] ✅ ${task} via Gemini FREE`);
    return geminiResult.text;
  }

  // Tier 3: OpenRouter paid (low cost)
  const paidResult = await callOpenRouter(PAID_MODELS[task], messages, jsonMode);
  if (paidResult) {
    console.warn(
      `[ai] ⚠️  ${task} via OpenRouter PAID (${PAID_MODELS[task]}) — ${paidResult.tokensUsed || '?'} tokens`
    );
    return paidResult.text;
  }

  // Tier 4: OpenAI direct (highest cost)
  const openaiResult = await callOpenAI(PAID_MODELS[task], messages, jsonMode);
  if (openaiResult) {
    console.warn(
      `[ai] ⚠️  ${task} via OpenAI PAID (${PAID_MODELS[task]}) — ${openaiResult.tokensUsed || '?'} tokens`
    );
    return openaiResult.text;
  }

  throw new Error('Todos os provedores de IA falharam. Verifique as chaves de API.');
}

/**
 * Get usage statistics for cost tracking.
 */
export async function getProviderStatus(): Promise<{
  freeModelsAvailable: string[];
  paidModelsFallback: string[];
  providers: { openrouter: boolean; gemini: boolean; openai: boolean };
}> {
  return {
    freeModelsAvailable: Object.keys(FREE_MODELS),
    paidModelsFallback: Object.keys(PAID_MODELS),
    providers: {
      openrouter: !!OPENROUTER_KEY,
      gemini: !!GEMINI_KEY,
      openai: !!OPENAI_KEY,
    },
  };
}
