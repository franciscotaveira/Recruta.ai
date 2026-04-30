/**
 * WhatsApp Template definitions
 * Templates must be pre-approved in Meta Business Suite before use.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * REGRAS CRÍTICAS PARA CATEGORIA UTILITY (custo ~50% menor que Marketing)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * A Meta usa ML para detectar intenção. Qualquer linguagem promocional força
 * reclassificação automática para MARKETING.
 *
 * ❌ PALAVRAS/FRASES PROIBIDAS (causam reclassificação):
 *    - "oportunidade", "interesse", "participe", "conheça", "aproveite"
 *    - "quer participar?", "gostaria de?", "deseja fazer parte?"
 *    - "demonstrou interesse anteriormente" (referência a marketing list)
 *    - "rápida triagem" (feature selling), "leva X minutos" (argumento persuasivo)
 *    - emojis no corpo principal, múltiplos pontos de exclamação
 *
 * ✅ FÓRMULA APROVADA PARA UTILITY:
 *    [Fato processual] + [Ação requerida] + [Instrução binária neutra]
 *    Ex: "A empresa X iniciou processo para função Y. Confirmação pendente.
 *         Responda 1 para confirmar ou 2 para declinar."
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Setup instructions:
 * 1. Go to Meta Business Suite → WhatsApp → Message Templates
 * 2. Create templates matching the names/structure below
 * 3. Wait for approval (usually < 24h)
 * 4. NEVER contest a rejection — resubmit with a new name instead
 */

export const TEMPLATES = {
  /**
   * Template: recruta_convite_vaga
   * Category: UTILITY
   * Language: pt_BR
   *
   * Body (exact text to register in Meta):
   * ─────────────────────────────────────────────────────────────────────────
   * "Olá {{1}}, a empresa {{3}} iniciou o processo seletivo para a função de {{2}}.
   *
   * Sua participação na etapa de triagem está pendente de confirmação.
   *
   * Responda *1* para confirmar ou *2* para declinar."
   * ─────────────────────────────────────────────────────────────────────────
   *
   * Why it's UTILITY:
   * - "iniciou o processo seletivo" → fato processual, não oferta
   * - "pendente de confirmação" → ação requerida no processo existente
   * - "confirmar ou declinar" → instrução binária, sem persuasão
   * - Sem emojis, sem ponto de exclamação, sem adjetivos
   *
   * Variables:
   * {{1}} candidate_name
   * {{2}} job_title
   * {{3}} company_name
   */
  INVITE: {
    name: 'recruta_convite_vaga',
    buildVariables: (candidateName: string, jobTitle: string, companyName: string) => [
      { type: 'text', text: candidateName },
      { type: 'text', text: jobTitle },
      { type: 'text', text: companyName },
    ],
  },

  /**
   * Template: recruta_confirmacao
   * Category: UTILITY
   * Language: pt_BR
   *
   * Body (exact text to register in Meta):
   * ─────────────────────────────────────────────────────────────────────────
   * "Confirmação recebida. O processo de triagem para a função de {{1}} foi iniciado.
   *
   * {{2}}"
   * ─────────────────────────────────────────────────────────────────────────
   *
   * Variables:
   * {{1}} job_title
   * {{2}} first_question (plain text, no emoji, max 200 chars)
   */
  FIRST_QUESTION: {
    name: 'recruta_confirmacao',
    buildVariables: (jobTitle: string, question: string) => [
      { type: 'text', text: jobTitle },
      { type: 'text', text: question },
    ],
  },

  /**
   * Template: recruta_banco_talentos
   * Category: UTILITY
   * Language: pt_BR
   *
   * Body (exact text to register in Meta):
   * ─────────────────────────────────────────────────────────────────────────
   * "Olá {{1}}, a empresa {{2}} abriu uma vaga para a função de {{3}} e seu perfil
   * foi incluído no processo seletivo atual.
   *
   * Confirme sua disponibilidade para a etapa de triagem.
   *
   * Responda *1* para confirmar participação ou *2* para declinar."
   * ─────────────────────────────────────────────────────────────────────────
   *
   * Why it's UTILITY (not the rejected version):
   * - "seu perfil foi incluído" → fato administrativo, não referência a marketing list
   * - Removido "demonstrou interesse anteriormente" → era o gatilho de reclassificação
   * - "Confirme sua disponibilidade" → ação requerida, não persuasão
   *
   * Variables:
   * {{1}} candidate_name
   * {{2}} company_name
   * {{3}} job_title
   */
  TALENT_BANK_INVITE: {
    name: 'recruta_banco_talentos',
    buildVariables: (candidateName: string, companyName: string, jobTitle: string) => [
      { type: 'text', text: candidateName },
      { type: 'text', text: companyName },
      { type: 'text', text: jobTitle },
    ],
  },

  /**
   * Template: recruta_processo_ativo
   * Category: UTILITY
   * Language: pt_BR
   *
   * Body (exact text to register in Meta):
   * ─────────────────────────────────────────────────────────────────────────
   * "Olá {{1}}, o processo seletivo para a função de {{2}} na empresa {{3}} foi
   * registrado para seu perfil.
   *
   * A próxima etapa requer sua confirmação de participação.
   *
   * Responda *1* para prosseguir ou *2* para declinar."
   * ─────────────────────────────────────────────────────────────────────────
   *
   * NOTE: Template alternativo de backup — usar se recruta_convite_vaga
   * for rejeitado. Formulação ainda mais neutra e factual.
   *
   * Variables:
   * {{1}} candidate_name
   * {{2}} job_title
   * {{3}} company_name
   */
  PROCESSO_ATIVO: {
    name: 'recruta_processo_ativo',
    buildVariables: (candidateName: string, jobTitle: string, companyName: string) => [
      { type: 'text', text: candidateName },
      { type: 'text', text: jobTitle },
      { type: 'text', text: companyName },
    ],
  },
} as const;

const PRIVACY_POLICY_URL =
  process.env.PRIVACY_POLICY_URL || 'https://recrutaria.com.br/privacidade';

/**
 * Free-text messages (no template needed — valid within 24h customer service window)
 * After any candidate response, the 24h window opens for free-form messages.
 * Use templates ONLY for first contact or conversation reopening after 24h.
 */
export const TEXT_MESSAGES = {
  CONSENT_REQUEST: `Para garantir a segurança e a conformidade (LGPD), precisamos do seu consentimento antes de iniciar.\n\nVocê autoriza o processamento dos seus áudios por nossa Inteligência Artificial para fins exclusivos desta triagem?\n\nLeia nossos termos: ${PRIVACY_POLICY_URL}\n\nResponda *CONCORDO* para iniciar ou *NÃO CONCORDO* para encerrar.`,

  CONSENT_REMINDER:
    'Para seguir, responda *CONCORDO*. Se preferir não participar com IA, responda *NÃO CONCORDO*.',

  CONSENT_DECLINED:
    'Entendido. Encerramos este processo sem análise automatizada. Se mudar de ideia, o recrutador pode te convidar novamente.',

  MIC_CHECK_REQUEST:
    'Vamos fazer um teste rápido de áudio (não avaliativo). Envie um áudio curto dizendo: "Teste de áudio Recruta.AI". Se tiver problema técnico, avise por texto.',

  MIC_CHECK_REMINDER:
    'Para validar seu canal de resposta, envie um áudio curto de teste. Se não conseguir gravar, me avise em texto para seguir em modo acessível.',

  MIC_CHECK_SUCCESS: 'Áudio validado. Obrigado!',

  FIRST_QUESTION: (jobTitle: string, question: string, totalQuestions: number) =>
    `Triagem para a função de ${jobTitle} iniciada.\n\nFormato: respostas em áudio de até *2 minutos*.\n\nPergunta 1 de ${totalQuestions}: ${question}`,

  NEXT_QUESTION: (question: string, position: number, totalQuestions: number) =>
    `Pergunta ${position} de ${totalQuestions}:\n\n${question}\n\nResponda em áudio de até *2 minutos*.`,

  ALL_QUESTIONS_DONE:
    'Todas as respostas recebidas. O processo de análise do seu perfil foi iniciado. O resultado será encaminhado em breve. Obrigado.',

  DECLINED: 'Confirmado. Sua participação foi encerrada. Boa sorte.',

  DECLINE_REASON_PROMPT:
    'Para registro interno do processo, informe o motivo do declínio.\n\nResponda com o *número*:\n1) Salário\n2) Local de trabalho\n3) Benefícios\n4) Outra vaga aceita\n5) Já empregado\n6) Horário\n7) Requisitos\n8) Tipo de contratação\n9) Outro',

  DECLINE_REASON_PROMPT_BODY: 'Para registro do processo, informe o motivo do declínio.',

  DECLINE_REASON_PROMPT_BUTTON: 'Menu',

  DECLINE_REASON_PROMPT_SECTION: 'Motivos',

  DECLINE_REASON_REMINDER: 'Informe o motivo com um número de *1 a 9*.',

  DECLINE_REASON_THANK_YOU: 'Informação registrada. Obrigado.',

  WELCOME:
    'Olá. Sou o assistente de triagem da Recruta.AI. Vou conduzir as etapas do processo seletivo. Pode responder em áudio ou texto.',

  ERROR: 'Não foi possível processar sua mensagem. Tente novamente.',
} as const;
