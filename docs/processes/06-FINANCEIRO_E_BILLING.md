# Processo 06 — Financeiro e Billing

## Objetivo
Garantir cobranca correta, previsao de caixa e controle de inadimplencia.

## Dono
- Founder

## Cadencia
- conciliacao: diaria
- fechamento: semanal
- DRE simplificada: mensal

## Entradas
- pagamentos via AbacatePay
- extrato bancario
- custos fixos e variaveis

## Saidas
- relatorio de receita por produto
- relatorio de inadimplencia
- previsao de caixa 30 dias

## Controles minimos
- status de pagamento sincronizado (`pending`, `paid`, `failed`)
- idempotencia de webhook de pagamento
- registro de credito no wallet com trilha de auditoria

## Checklist semanal
- [ ] pagamentos conciliados
- [ ] divergencias tratadas
- [ ] previsao de caixa atualizada
- [ ] custos extraordinarios registrados

