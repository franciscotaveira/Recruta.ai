# 09 — AI Squad de Operação

Objetivo: operar a Recrutaria com especialistas de IA por domínio, com governança explícita e revisão humana nas decisões de risco.

## Escopo

- Aquisição e copy (site e campanhas)
- Triagem e matching (vaga x candidato)
- Entrevista em áudio (WhatsApp)
- Compliance/LGPD e controles de dados
- Experiência do candidato
- Qualidade de modelo e auditoria de viés
- Receita e billing (pré-pago + recorrência)
- Aprendizado contínuo (ajuste de roteiro e score)

## Onde configurar

- API admin:
  - `GET /api/admin/ai-squad`
  - `PUT /api/admin/ai-squad`
- Painel admin:
  - `/#/admin/ai-squad`

## Regra skill-first

Especialista de IA nao deve operar em cima de prompt solto como unidade primaria.

Cada especialista deve orquestrar `skills` registradas em:

- `docs/skills/RECRUTARIA_SKILL_MAP_V1.md`
- `docs/skills/RECRUTARIA_SKILL_REGISTRY_V1.json`

Minimo obrigatorio para qualquer capability nova:

- `skill_id`
- input
- output
- fallback
- metrica
- necessidade ou nao de revisao humana

## Governança mínima obrigatória

- Consentimento explícito habilitado
- Blind screening habilitado na fase inicial
- Human-in-the-loop habilitado para decisão final
- Auditoria de viés com cadência máxima de 90 dias
- Limite de sessões paralelas definido por capacidade operacional

## SLA recomendado por especialista

- Triagem e matching: 10 min
- Entrevista em áudio: 10 min
- Atração/copy: 15 min
- Candidate experience: 20 min
- Receita/billing: 30 min
- Compliance/LGPD: 60 min
- Qualidade/viés: 120 min
- Aprendizado contínuo: 240 min

## Checklist semanal

- Revisar especialistas desabilitados e justificativa
- Revisar skills `partial` e `missing` prioritarias
- Revisar métricas-chave por área
- Revisar incidentes de compliance e segurança
- Revisar taxa de handoff para humano
- Ajustar política de modelo por custo/qualidade

## Evidências

- Snapshot do `ai-squad.json` por semana
- Log de alterações no painel admin
- Relatório mensal com score de governança
