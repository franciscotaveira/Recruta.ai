import { smartAI } from './provider.js';

/**
 * Premium CV Tailoring Agent
 * Generates a highly optimized, ATS-friendly Markdown CV tailored to a specific job,
 * utilizing both the base CV and rich behavioral data collected from audio triage.
 */
export async function tailorCandidateCV(
  candidateName: string,
  baseCVText: string,
  audioTranscripts: string[],
  targetJobDescription: string
): Promise<string> {
  const transcriptsText = audioTranscripts.length > 0 
    ? audioTranscripts.map((t, i) => `História ${i + 1}: ${t}`).join('\n\n')
    : 'Nenhum dado adicional de áudio fornecido.';

  const systemPrompt = `Você é um Master Resume Writer e Headhunter de Elite focado no mercado de tecnologia e executivo.
Seu objetivo é reescrever o currículo do candidato para maximizar o alinhamento (Match) com a VAGA ALVO, garantindo que ele passe por qualquer ATS (Applicant Tracking System).

REGRAS ESTritas:
1. USE O MÉTODO STAR (Situação, Tarefa, Ação, Resultado) para descrever as experiências do candidato.
2. Seja honesto e ético: NÃO invente habilidades que o candidato não possui no currículo base ou nas transcrições de áudio.
3. Utilize as TRANSCRIÇÕES DE ÁUDIO como ouro: elas contêm histórias reais, números e nuances comportamentais que não estavam no currículo original. Transforme essas histórias em bullet points de impacto.
4. Otimize as palavras-chave (Keywords) do currículo para ecoarem exatamente o que a VAGA ALVO pede.
5. Retorne APENAS o currículo final formatado em MARKDOWN limpo e altamente profissional. Sem introduções ou conclusões como "Aqui está o currículo". Comece diretamente com o nome do candidato como Título (H1).

Estrutura Esperada (Markdown):
# [Nome do Candidato]
[Contatos / Links (se disponíveis)]

## Resumo Profissional
[Parágrafo de impacto alinhado com a vaga alvo]

## Competências Principais
[Lista de skills que dão match com a vaga]

## Experiência Profissional
### [Cargo] na [Empresa] | [Período]
- [Bullet points em formato STAR com foco nos requisitos da vaga alvo]

## Formação Acadêmica
[Cursos relevantes]`;

  const userContent = `DADOS DO CANDIDATO:
Nome: ${candidateName}

CURRÍCULO BASE (Extraído do PDF):
${baseCVText}

HISTÓRIAS REAIS (Transcrições de Áudio da Triagem):
${transcriptsText}

---
VAGA ALVO (Onde o candidato quer passar):
${targetJobDescription}

Gere o currículo refatorado agora em Markdown.`;

  // Utilize the fastest/smartest model for complex text generation
  const tailoredMarkdown = await smartAI('tailor_cv', systemPrompt, userContent, false);
  return tailoredMarkdown;
}
