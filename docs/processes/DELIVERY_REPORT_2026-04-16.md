# Delivery Report — 2026-04-16

## Escopo concluído
- Triagem WhatsApp evoluída para método estruturado por vaga (KSAO/BARS + Knockout).
- Contratos API/frontend atualizados para expor diagnóstico por competência e resultado de knockout.
- Formulário de vaga atualizado para requisitos estruturados com compatibilidade legada.
- Normalização de payload de requisitos no backend para evitar drift entre frontend e processamento de conversa.

## Validação executada
- `npm run test:server` ✅ (26/26)
- `cd server && npm run build` ✅
- `npm run build` ✅
- `npm test` ✅
- `npm run lint:ci` ✅ (sem erros, warnings de estilo/tipagem já existentes)

## Melhorias técnicas entregues
- Knockout com três estados no runtime (`pass`, `unclear`, `fail`) e encerramento seguro com motivo explícito.
- Persistência de metadados por resposta (`questionType`, `requirementId`, `requirementText`, `weight`).
- Codec de resumo evoluído para `triage_v2` com retrocompatibilidade (`triage_v1` e texto legado).
- Cálculo de `competencyScores` por competência (score, peso, BARS, evidência, rationale).
- Exposição e renderização em UI de:
  - `competency_scores`
  - `knockout`
- Fortalecimento de atualização de sessão declinada com verificação explícita de erro em banco.

## Riscos residuais
1. Ambiente local de testes sem chaves completas (`JWT_SECRET`, WhatsApp, Gemini) gera warnings esperados.
2. Pipeline de lint ainda com muitos warnings de estilo/tipagem fora do escopo crítico desta entrega.
3. Necessário validar em ambiente real de webhook com payloads de produção (Meta/AbacatePay) após deploy.

## Próximo sprint recomendado (curto)
1. Adicionar testes de integração para `/api/jobs` cobrindo normalização de requirements e persistência.
2. Incluir dashboard de qualidade de triagem:
   - taxa de knockout
   - distribuição BARS por requisito
   - taxa de handoff humano
3. Instrumentar eventos analíticos para funil completo de triagem em produção.
4. Ativar smoke E2E de fluxo: convite -> consentimento -> áudio -> análise -> leitura no painel RH.

---

## Ciclo complementar (16/04/2026 — tarde)

### Escopo concluído
- Home institucional revisada para venda dual-audience com evidência de método científico.
- Páginas segmentadas (`/para-empresas/` e `/para-candidatos/`) reescritas com copy de conversão e CTA separado por público.
- Implementação do **AI Squad Especialista** com governança operacional:
  - endpoint `GET /api/admin/ai-squad`
  - endpoint `PUT /api/admin/ai-squad`
  - resumo do squad embutido em `GET /api/admin/overview`
  - painel admin com edição de especialistas, SLA e políticas.
- Processo formalizado em `09-AI_SQUAD_OPERACAO.md`.

### Validação executada
- `npm run lint` ✅ (sem erros)
- `npm test` ✅
- `npm run test:server` ✅ (28/28)
- `npm run build` ✅
- `cd server && npm run build` ✅
- `./ops/monitoring/synthetic-check.sh` ✅

### Deploy executado
- Data/hora UTC: `2026-04-16T16:26:23Z`
- Destino: `root@187.127.9.92:/var/www/recrutaria-site`
- Comando de release institucional: `./ops/deploy-institutional-site.sh`
- Pós-deploy:
  - `https://recrutaria.com.br/` ✅
  - `https://recrutaria.com.br/para-empresas/` ✅
  - `https://recrutaria.com.br/para-candidatos/` ✅

---

## Ciclo complementar (16/04/2026 — noite)

### Problema raiz tratado
- API em produção rejeitando origem válida (`https://app.recrutaria.com.br`) por variação de configuração CORS.
- Risco de resposta HTML em endpoints de API sem rota (causando erro de parse JSON no frontend: `Unexpected token '<'`).

### Correções implementadas
- Hardening de CORS no backend:
  - normalização de origem (`protocol + host`, sem trailing slash)
  - allowlist com baseline de produção (`app.recrutaria.com.br` e `recrutaria.com.br`)
  - merge seguro com `FRONTEND_URL` e `ALLOWED_ORIGINS`
- Fallback JSON para rotas desconhecidas em `/api/*`:
  - `404 API_ROUTE_NOT_FOUND` em vez de fallback para `index.html`
- Error handler global para API:
  - converte erros não tratados para JSON consistente
  - CORS bloqueado agora retorna `403 CORS_ORIGIN_NOT_ALLOWED`
- Teste de regressão adicionado:
  - `server/test/cors.contract.test.ts`
  - cobre origem permitida e bloqueada.

### Validação executada
- `cd server && npm run build` ✅
- `cd server && npm test` ✅ (30/30)
- `./ops/monitoring/synthetic-check.sh https://recrutaria.com.br https://app.recrutaria.com.br` ✅
- Smoke HTTP em produção:
  - `GET /api/health` com origin do app retorna `Access-Control-Allow-Origin` ✅
  - `GET /api/nao-existe` retorna JSON `404 API_ROUTE_NOT_FOUND` ✅
  - origem inválida retorna JSON `403 CORS_ORIGIN_NOT_ALLOWED` ✅

### Deploy executado
- Data/hora UTC aproximada: `2026-04-16T17:04:00Z`
- Destino backend: `root@187.127.9.92:/srv/recruta-ai/server/index.ts`
- Serviço reiniciado: `systemctl restart recruta-ai.service` ✅

---

## Ciclo complementar (16/04/2026 — domínio e fallback de API)

### Problema raiz tratado
- Necessidade de separar institucional/app sem quebrar integração de API.
- `api.recrutaria.com.br` ainda sem SSL válido para o hostname (erro de certificado/SAN).

### Correções implementadas
- Frontend roteado por host:
  - `recrutaria.com.br` entra em `/landing`
  - `app.recrutaria.com.br` entra em `/login`
- Cliente API ajustado para estratégia resiliente:
  - base padrão `/api` (same-origin)
  - fallback para `https://api.<dominio>/api` **apenas** se `VITE_ENABLE_API_SUBDOMAIN_FALLBACK=true`
- Landing atualizada para CTAs direcionarem para `app.<dominio>`.
- Smoke monitor atualizado para aceitar 3º argumento opcional de API subdomínio.

### Validação executada
- `npm run test` ✅ (13/13)
- `npm run build` ✅
- `npm run test:server` ✅ (38/38)
- `./ops/monitoring/synthetic-check.sh https://recrutaria.com.br https://app.recrutaria.com.br` ✅
- `./ops/monitoring/synthetic-check.sh ... https://api.recrutaria.com.br` ❌ (SSL hostname mismatch)

### Ação pendente de infraestrutura
- Emitir/renovar certificado incluindo `api.recrutaria.com.br` e apontar host para backend.
- Só depois habilitar `VITE_ENABLE_API_SUBDOMAIN_FALLBACK=true` em produção.
