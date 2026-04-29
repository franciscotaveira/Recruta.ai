# Processo 03 — Produto e Roadmap

## Objetivo
Garantir evolucao do produto guiada por impacto real.

## Donos
- Founder: prioridade de negocio
- Dev: viabilidade e custo tecnico

## Cadencia
- triagem de backlog: semanal
- revisao de roadmap: quinzenal

## Regra de priorizacao
Score simples por item:
- impacto no negocio (1-5)
- urgencia (1-5)
- esforco tecnico (1-5, invertido)
- risco de regressao (1-5, invertido)

## Definicao de pronto (DoD)
- criterio de aceite escrito
- contrato de API definido/atualizado
- `skill_id` definido para toda feature de IA ou automacao
- testes minimos no dominio critico
- logs e erros padronizados
- documentacao atualizada

## Checklist
- [ ] Toda feature tem problema explicitado
- [ ] Toda feature tem metrica de sucesso
- [ ] Toda feature tem plano de rollback
- [ ] Toda feature de IA referencia skill existente ou cria nova entrada no registry
- [ ] Sem "feature sem dono"
