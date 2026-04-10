# 👁️ Visionary Diagnosis: A Alma do Recruta.AI

## 1. A Tese Central
O mercado de recrutamento não sofre de falta de talento, sofre de **falha de tradução**.
*   **Verdade não óbvia:** O melhor candidato muitas vezes é rejeitado porque não sabe "falar a língua" do algoritmo (ATS).
*   **Nossa Solução:** Não somos apenas um "gerador de CV". Somos um **Middleware de Tradução Semântica** que normaliza o caos humano para a estrutura de dados que as empresas compram.
*   **O Moat (Fosso):** Enquanto competidores vendem "vagas" (commodity), nós vendemos "dados estruturados e validados" (asset).

## 2. Pilares de Engenharia Atemporal
1.  **Job-As-A-Protocol:** O sistema inteiro é uma máquina de estados de jobs. Isso permite escalar, retentar falhas e auditar tudo sem reescrever o core.
2.  **Hexagonal AI:** O modelo (Gemini) é um detalhe de implementação. O sistema fala "Intenção de Análise", o adaptador fala com a IA. Amanhã podemos trocar por GPT-5 ou Llama local sem quebrar a UI.
3.  **Policy-as-Code:** As regras de negócio (quem pode fazer o quê, quanto custa) não estão "hardcoded" em `if/else` espalhados, mas centralizadas no `ACTION_CONTRACTS.json`.

## 3. Modelo de Autonomia & "Lovable-like"
Queremos que o usuário sinta que está conversando com um engenheiro sênior, não preenchendo formulários.
*   **Interface:** Chat-driven + Widgets Efêmeros.
*   **Mecanismo:** O usuário pede "Analise este CV". O sistema responde com um Widget de `JobPreview` ("Vou analisar este arquivo, custará 1 crédito. Aprovar?"). O usuário clica, o job roda, o resultado aparece no chat.

## 4. 💀 PRE-MORTEM NARRATIVO: "O Apagão de Confiança de 2026"
**Data:** Outubro de 2026. O Recruta.AI faliu.
**A História:**
Crescemos rápido. Em agosto, um bug na integração com o Gemini começou a alucinar "Experiência na NASA" em 15% dos currículos reescritos. Como nossa UI era apenas "Mágica", os candidatos não revisavam. Os recrutadores (B2B) começaram a entrevistar fraudes.
Em setembro, um vazamento de logs expôs 50.000 telefones porque nossa IA estava logando o JSON bruto no console do servidor para debug.
**Causa Mortis:** Falta de validação humana no loop (Human-in-the-Loop) e logs com PII não sanitizados.
**Como Evitamos Hoje:**
1.  Job de Reescrita requer aprovação do candidato (diff side-by-side) antes de finalizar.
2.  Pipeline de logs sanitiza automaticamente campos `email` e `phone` antes de salvar.

## 5. Roadmap Tático (3 Sprints)

### Sprint 1: The Foundation (Governance)
*   Setup do Supabase e Auth.
*   Implementação do `ActionManager` (leitura do JSON de contratos).
*   Job simples: `tenant.create` e `candidate.upload`.

### Sprint 2: The Core Loop (AI + Jobs)
*   Worker para processar `candidate.analyze_cv` via Gemini.
*   UI de "Job Center" (usuário vê o progresso em tempo real).
*   Sistema de Créditos (Mock funcional).

### Sprint 3: The Lovable Experience (Chat UI)
*   Interface de chat que dispara Actions.
*   Widgets de aprovação dentro do chat.
*   Exportação final e "Magic Link" para recrutadores.
