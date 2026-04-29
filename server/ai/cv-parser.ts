/**
 * CV Parser Skill
 * Converts PDF/Image resumes to Markdown and extracts structured candidate data.
 * Powered by Gemini Multimodal via OpenRouter.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

export interface ExtractedCandidateData {
  name: string;
  email: string;
  phone: string;
  location?: string;
  summary: string;
  markdown: string;
}

/**
 * Parses a resume file (PDF/Image) using Multimodal AI.
 */
export async function parseResume(
  fileBuffer: Buffer,
  mimeType: string = 'application/pdf'
): Promise<ExtractedCandidateData> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const base64File = fileBuffer.toString('base64');
  
  // Modelos de 2026 com suporte multimodal robusto
  const models = [
    'google/gemini-2.0-flash-001',
    'google/gemini-flash-1.5'
  ];

  for (const model of models) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://recrutaria.com.br',
          'X-Title': 'Recruta.AI'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: `Você é um Especialista em Extração de Dados e Parsing de Currículos. 
Sua tarefa é ler o arquivo enviado e converter todo o seu conteúdo para MARKDOWN (.md).

REGRAS DE EXTRAÇÃO:
1. Preserve a estrutura original (títulos, listas, seções).
2. Extraia campos específicos para o JSON.
3. Se o arquivo estiver em outro idioma, mantenha o texto original no Markdown, mas identifique os campos no JSON.
4. Telefone: Formate sempre com DDI e DDD (ex: +5549999999999).`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Leia este currículo e retorne APENAS um JSON no formato:\n{\n  "name": "nome completo",\n  "email": "email",\n  "phone": "telefone formatado",\n  "location": "cidade/estado",\n  "summary": "resumo profissional curto (3 linhas)",\n  "markdown": "conteúdo completo do currículo em formato .md"\n}'
                },
                {
                  type: 'image_url', // OpenRouter usa image_url para base64/arquivos dependendo do modelo
                  image_url: {
                    url: `data:${mimeType};base64,${base64File}`
                  }
                }
              ]
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      
      if (text) {
        return JSON.parse(text) as ExtractedCandidateData;
      }
    } catch (err) {
      console.error(`[cv-parser] Error with model ${model}:`, err);
      // Tenta o próximo modelo
    }
  }

  throw new Error('Failed to parse resume with all available models');
}
