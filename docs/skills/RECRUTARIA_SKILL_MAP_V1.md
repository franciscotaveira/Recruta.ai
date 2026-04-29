# Skill Map — Recrutaria v1

Atualizado em: 2026-04-23

## 0. Resumo Executivo

O Recrutaria nao precisa de "mais agentes".
Precisa de uma camada clara de `skills` reutilizaveis, com contrato, fallback, metrica e governanca.

Regra estrutural desta versao:

- `skill` = capacidade delimitada, testavel e auditavel
- `workflow` = encadeamento de skills
- `agent/squad` = camada de orquestracao, politica e supervisao

O objetivo deste mapa e impedir que o produto continue crescendo com logica de IA espalhada em feature, pagina ou prompt solto.

## 1. Leitura do Cenario

[KNOWN] O wedge real do produto esta estabilizado como:

- vaga criada pela empresa
- convite por WhatsApp
- triagem estruturada por audio
- diagnostico para o recrutador
- cobranca por credito

[KNOWN] O backend atual ja possui partes importantes dessa arquitetura em:

- `server/conversation/flow.ts`
- `server/conversation/method.ts`
- `server/conversation/governance.ts`
- `server/ai/analyze.ts`
- `server/ai/transcribe.ts`
- `server/payment/*`

[INFERRED] O principal gap atual nao e ausencia de runtime.
O principal gap e ausencia de `skill registry` como camada oficial entre:

- produto
- engenharia
- governanca
- backlog

[INFERRED] Hoje varias capacidades existem, mas ainda estao acopladas ao caso de uso do wedge ou embutidas em fluxo unico.
Isso dificulta:

- reuso entre projetos
- versionamento
- testes por capacidade
- medicao de qualidade por skill
- evolucao segura do produto

## 2. Arquitetura Skill-First

### Camada 1 — Core Skills

Capacidades estruturais que podem ser reutilizadas dentro e fora do Recrutaria.

### Camada 2 — Domain Skills

Capacidades especificas do wedge de recrutamento via WhatsApp.

### Camada 3 — Orchestration Skills

Capacidades de decisao operacional, governanca, handoff, fila de revisao e cobranca.

## 3. Registry Inicial

| Skill | Camada | Status | Prioridade | Reuso | Papel no negocio |
|---|---|---|---|---|---|
| `job_requirement_structurer` | core | live | now | shared | padroniza a vaga para o resto do sistema |
| `screening_question_builder` | core | live | now | shared | transforma vaga em roteiro estruturado |
| `consent_accessibility_guard` | orchestration | live | now | shared | protege LGPD, consentimento e acessibilidade |
| `knockout_gate` | domain | live | now | shared | elimina cedo sem desperdiçar triagem longa |
| `whatsapp_screening_orchestrator` | orchestration | live | now | recrutaria_only | segura a maquina de estados do wedge |
| `candidate_audio_transcriber` | core | live | now | shared | converte audio em dado utilizavel |
| `candidate_fit_scorer` | domain | live | now | recrutaria_only | gera score, resumo e recomendacao |
| `competency_evidence_scorer` | domain | live | now | recrutaria_only | transforma respostas em evidencia por requisito |
| `human_handoff_router` | orchestration | live | now | shared | preserva controle humano em excecoes |
| `credit_and_payment_gate` | orchestration | live | now | shared | conecta valor entregue com receita |
| `deep_dive_followup` | domain | partial | next_90d | recrutaria_only | aprofunda respostas superficiais sem loop solto |
| `blind_screening_guard` | orchestration | partial | now | shared | reduz exposicao de PII no scoring inicial |
| `recruiter_review_queue` | orchestration | live | now | recrutaria_only | organiza trabalho humano apos a triagem |
| `confidence_and_abstention_engine` | orchestration | live | now | shared | evita recomendacao automatica sem confianca suficiente |
| `semantic_skill_extractor` | domain | missing | next_90d | shared | infere competencias alem de palavra-chave |
| `candidate_feedback_writer` | domain | missing | next_90d | recrutaria_only | entrega feedback educativo sem confundir com decisao final |
| `scheduler_and_reminder` | orchestration | missing | next_90d | recrutaria_only | reduz no-show e acelera avancos de funil |
| `audio_evidence_clip_extractor` | domain | missing | next_90d | recrutaria_only | cria living profiles com prova de audio |
| `channel_attribution_tracker` | orchestration | missing | next_90d | shared | mede origem do candidato e CAC por canal |
| `post_hire_learning_loop` | domain | missing | later | recrutaria_only | fecha loop entre triagem e performance real |

## 4. O Que Ja Existe de Verdade

### Live

- `job_requirement_structurer`
- `screening_question_builder`
- `consent_accessibility_guard`
- `knockout_gate`
- `whatsapp_screening_orchestrator`
- `candidate_audio_transcriber`
- `candidate_fit_scorer`
- `competency_evidence_scorer`
- `human_handoff_router`
- `credit_and_payment_gate`
- `recruiter_review_queue`
- `confidence_and_abstention_engine`

### Partial

- `deep_dive_followup`
  Hoje existe em v1, mas ainda esta preso ao fluxo principal e sem contrato isolado.
- `blind_screening_guard`
  Hoje redige PII na analise, nas sessoes, no pipeline inicial, no banco de talentos, na triagem em lote e na exportacao do banco de talentos, mas ainda nao cobre algumas exportacoes adjacentes e superficies fora do funil principal.

### Missing

- `semantic_skill_extractor`
- `candidate_feedback_writer`
- `scheduler_and_reminder`
- `audio_evidence_clip_extractor`
- `channel_attribution_tracker`
- `post_hire_learning_loop`

## 5. Ordem de Implementacao Recomendada

### Fase A — Corrigir a base operacional

1. `blind_screening_guard`
2. `confidence_and_abstention_engine`
3. `recruiter_review_queue`

Motivo:

- fecha risco de compliance
- evita overreach da IA
- melhora velocidade de decisao humana

### Fase B — Melhorar conversao e confianca do wedge

1. `scheduler_and_reminder`
2. `candidate_feedback_writer`
3. `channel_attribution_tracker`

Motivo:

- reduz no-show
- melhora experiencia do candidato
- torna GTM e CAC mensuraveis

### Fase C — Construir moat de dados e diferenca real

1. `semantic_skill_extractor`
2. `audio_evidence_clip_extractor`
3. `deep_dive_followup` v2
4. `post_hire_learning_loop`

Motivo:

- melhora precisao do matching
- cria ativo dificil de copiar
- fecha o loop entre diagnostico e qualidade real de contratacao

## 6. Regras de Operacao

Toda feature nova de IA deve obedecer estas regras:

1. Nenhuma feature nova entra sem `skill_id`.
2. Toda skill precisa declarar:
   - objetivo
   - input
   - output
   - fallback
   - metrica
   - necessidade de revisao humana
3. Nenhum fluxo sensivel deve chamar modelo diretamente sem passar por uma skill registrada.
4. Skill sem metrica vira custo, nao ativo.
5. Skill parcial ou missing nao deve ser vendida como capability madura.

## 7. Reuso Alem do Recrutaria

Skills mais portaveis para STA e outros projetos:

- `consent_accessibility_guard`
- `candidate_audio_transcriber`
- `confidence_and_abstention_engine`
- `human_handoff_router`
- `channel_attribution_tracker`
- `credit_and_payment_gate`

Skills mais especificas do wedge Recrutaria:

- `knockout_gate`
- `candidate_fit_scorer`
- `competency_evidence_scorer`
- `scheduler_and_reminder`
- `audio_evidence_clip_extractor`
- `post_hire_learning_loop`

## 8. Proximo Movimento Inteligente

Usar `docs/skills/RECRUTARIA_SKILL_REGISTRY_V1.json` como fonte canonica para:

- backlog de produto
- definicao de pronto de features IA
- revisao semanal do AI Squad
- futura extracao de contratos tipados no backend
