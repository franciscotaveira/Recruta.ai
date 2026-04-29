# Backlog Executavel — Inicio 2026-04-15

Objetivo: acelerar execução da empresa com sequência diária/semanal, dono e critério de aceite.

## Regras de execução

1. Limite de WIP: no máximo 3 itens `in_progress`.
2. Cada item precisa de evidência (link de doc, commit, log, ou métrica).
3. Todo item crítico precisa de critério de aceite objetivo.

## Sprint 1 (2026-04-15 a 2026-04-21) — Fundacao Operacional

### Itens

1. `P1` — Ritual semanal e daily fixos
- Skill: `project-orchestration`
- Dono: Founder
- Aceite: agenda semanal publicada + ata da primeira semana em `docs/PROJECT_CONTEXT.md`.

2. `P1` — Ciclo padrão de execução com agentes
- Skill: `ai-first-engineering`, `agentic-engineering`
- Dono: Founder + Dev
- Aceite: fluxo `objetivo -> implementação -> eval -> decisão` documentado e aplicado em 1 entrega real.

3. `P1` — Gate de qualidade pré-release
- Skill: `verification-loop`
- Dono: Dev
- Aceite: checklist de release executado 1x com evidência (build/test/lint/health).

4. `P2` — Base de métricas semanais
- Skill: `monitoring-metrics`
- Dono: Founder
- Aceite: planilha com 5 KPIs (lead time, regressão, disponibilidade, conversão, receita).

## Sprint 2 (2026-04-22 a 2026-04-28) — Produto e Engenharia

1. `P1` — Modularização backend por domínio
- Skill: `backend-patterns`
- Dono: Dev
- Aceite: rotas separadas por domínio e `index.ts` apenas composição.

2. `P1` — Padrão único de estado e erro no frontend
- Skill: `frontend-patterns`
- Dono: Dev
- Aceite: telas críticas com loading/error/retry consistente.

3. `P1` — Regressão mínima de fluxos críticos no CI
- Skill: `testing-automation`
- Dono: Dev
- Aceite: suíte executa verde em CI e bloqueia merge em falha.

4. `P1` — Revisão de risco em auth/webhook/payment
- Skill: `security-review`
- Dono: Dev
- Aceite: checklist de segurança com ações abertas/fechadas.

## Sprint 3 (2026-04-29 a 2026-05-05) — Operação de Produção

1. `P1` — Padronização de deploy e rollback
- Skill: `deployment-patterns`
- Dono: Dev
- Aceite: runbook validado com rollback testado.

2. `P1` — Alertas e logs por domínio
- Skill: `monitoring-metrics`
- Dono: Dev
- Aceite: alertas para auth, webhook e payment com dono de resposta.

3. `P2` — Teste de incidente controlado
- Skill: `verification-loop`
- Dono: Founder + Dev
- Aceite: simulação de falha + tempo de recuperação registrado.

## Sprint 4 (2026-05-06 a 2026-05-12) — GTM

1. `P1` — Matriz competitiva e recomendação GTM
- Skill: `market-research`
- Dono: Founder
- Aceite: documento único com segmento, oferta, preço e canal para 90 dias.

2. `P1` — Pipeline comercial instrumentado
- Skill: `project-orchestration`
- Dono: Founder
- Aceite: funil com etapas, taxa por etapa e motivo de perda.

3. `P2` — Script comercial validado
- Skill: `market-research`
- Dono: Founder
- Aceite: 10+ conversas registradas com padrão de objeções.

## Sprint 5 (2026-05-13 a 2026-05-19) — Melhoria Contínua

1. `P1` — Loop contínuo com eval
- Skill: `continuous-agent-loop`
- Dono: Founder + Dev
- Aceite: ciclo semanal rodando com melhoria medida (antes/depois).

2. `P1` — Otimização de custo e rota de tarefas
- Skill: `agentic-engineering`
- Dono: Dev
- Aceite: redução de custo/tempo por tarefa com evidência.

## Sprint 6 (2026-05-20 a 2026-05-26) — Consolidação

1. `P1` — Auditoria final de operação
- Skill: `verification-loop`
- Dono: Founder + Dev
- Aceite: relatório final com gaps e plano de correção.

2. `P1` — Fechamento de baseline v1
- Skill: `project-orchestration`
- Dono: Founder
- Aceite: decisão formal de baseline + backlog v2 priorizado.

## Kanban sugerido

- `Backlog`
- `Ready`
- `In Progress`
- `Review`
- `Done`

