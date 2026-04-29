# Processo 07 — Seguranca e Incidentes

## Objetivo
Prevenir incidente grave e responder rapidamente quando acontecer.

## Donos
- Dev: resposta tecnica
- Founder: comunicacao e decisao de negocio

## Escopo critico
- credenciais e segredos
- webhook signature validation
- acesso administrativo (VPS, Supabase, Hostinger)
- dados pessoais de candidatos/recrutadores

## Playbook de incidente
1. Detectar
2. Conter
3. Erradicar causa
4. Recuperar servico
5. Postmortem com acao preventiva

## Regras obrigatorias
- segredo exposto => rotacao imediata
- acesso suspeito => revogar token/chave/sessao
- downtime > 15 min => comunicacao para clientes afetados

## Checklist mensal
- [ ] revisar usuarios/admins em VPS e provedores
- [ ] revisar chaves e tokens ativos
- [ ] testar restore basico
- [ ] revisar alertas de erro

