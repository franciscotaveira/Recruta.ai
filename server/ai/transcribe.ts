/**
 * AI Transcription — OpenRouter (Gemini) speech-to-text for WhatsApp audio
 * Uses Gemini 2.0 Flash Lite via OpenRouter which supports audio input.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

export interface TranscriptionResult {
  text: string;
  metadata?: {
    clarity: number; // 1-5
    confidence: number; // 1-5
    tone: string;
  };
}

/**
 * Transcribes an audio buffer using OpenRouter.
 * @param audioBuffer - Raw audio bytes (OGG/OPUS from WhatsApp)
 * @param mimeType - Audio mime type
 * @returns Transcribed text and metadata
 */
export async function transcribeAudio(
  audioBuffer: ArrayBuffer,
  mimeType = 'audio/ogg'
): Promise<TranscriptionResult> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY não configurada no .env');
  }

  const base64Audio = Buffer.from(audioBuffer).toString('base64');
  const format = mimeType.split('/')[1] || 'ogg';

  // Tentaremos modelos em ordem de prioridade
  const models = [
    'google/gemini-3-flash-preview',
    'google/gemini-2.5-flash',
    'google/gemini-2.0-flash-001',
    'google/gemini-flash-1.5',
  ];

  let lastError = null;

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
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Transcreva este áudio em português brasileiro. Além da transcrição, avalie a performance de comunicação do falante. Retorne APENAS um JSON com estas chaves: "text" (string), "clarity" (número 1-5), "confidence" (número 1-5), "tone" (string descrevendo o tom de voz).',
                },
                {
                  type: 'input_audio',
                  input_audio: {
                    data: base64Audio,
                    format: format === 'opus' ? 'ogg' : format,
                  },
                },
              ],
            },
          ],
          response_format: { type: 'json_object' }
        }),
      });

      const data = await response.json();

      if (data.error) {
        lastError = data.error.message;
        continue;
      }

      const content = data.choices?.[0]?.message?.content;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          return {
            text: String(parsed.text || '').trim(),
            metadata: {
              clarity: Number(parsed.clarity) || 3,
              confidence: Number(parsed.confidence) || 3,
              tone: String(parsed.tone || 'neutro')
            }
          };
        } catch (e) {
          // Fallback se o JSON falhar mas houver texto
          return { text: content.trim() };
        }
      }
    } catch (err: any) {
      lastError = err.message;
    }
  }

  throw new Error(
    `OpenRouter falhou em todos os modelos de transcrição. Último erro: ${lastError}`
  );
}
