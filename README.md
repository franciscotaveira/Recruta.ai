# Recruta.AI — Recrutamento Inteligente

Wedge atual do produto:
- empresa cria a vaga
- empresa convida no WhatsApp
- candidato responde triagem por áudio
- recrutador recebe diagnóstico estruturado
- empresa paga por uso

Superfícies principais:
- Site institucional: `https://recrutaria.com.br`
- Página para empresas: `/para-empresas`
- Página para candidatos: `/para-candidatos`
- App do produto (`/login`, `/recruiter`, `/candidate`)

## Stack
- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript
- Banco: Supabase (Postgres)
- Integrações: WhatsApp Cloud API, Gemini/OpenRouter/OpenAI, AbacatePay

## Portas e execução local
- Frontend: `http://localhost:4050`
- Backend: `http://localhost:3456`

```bash
npm install
cd server && npm install && cd ..

# terminal 1
cd server && npm run dev

# terminal 2
npm run dev
```

Ou com script:
```bash
./start.sh
```

## Domínios de produção
- Site institucional: `https://recrutaria.com.br`
- App do produto: `https://app.recrutaria.com.br`
- API padrão: `https://app.recrutaria.com.br/api/*` (same-origin)
- API subdomínio opcional: `https://api.recrutaria.com.br/api/*` (somente com DNS + SSL válidos)

## Variáveis de ambiente
Defina no backend (`server/.env` ou `.env` na raiz):

Obrigatórias em produção:
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `ABACATE_WEBHOOK_SECRET`

Comportamento de produção:
- o backend falha no boot se variáveis críticas não estiverem definidas.
- webhooks exigem assinatura válida.
- frontend usa `/api` por padrão; fallback para `api.<dominio>` só com `VITE_ENABLE_API_SUBDOMAIN_FALLBACK=true`.

## Webhooks
- WhatsApp:
  - `GET /api/whatsapp/webhook` (verificação)
  - `POST /api/whatsapp/webhook` (eventos com assinatura)
- Pagamentos:
  - `POST /api/payment/webhook` (assinatura obrigatória em produção)

## Áudio e transcrição
- `POST /api/transcribe` (áudio binário autenticado, retorno em texto)
- `GET /api/whatsapp/sessions/:sessionId/audios` (lista áudios da sessão para recrutador)
- `GET /api/whatsapp/audio/:audioId/stream` (stream seguro do áudio original)

## Testes e build
Backend:
```bash
cd server
npm run build
npm test
```

Frontend:
```bash
npm run build
npm run test
npm run lint:ci
```

Validação completa:
```bash
npm run test:all
```

Smoke de produção:
```bash
./ops/monitoring/synthetic-check.sh https://recrutaria.com.br https://app.recrutaria.com.br
# opcional (somente se api.<dominio> estiver com SSL válido):
./ops/monitoring/synthetic-check.sh https://recrutaria.com.br https://app.recrutaria.com.br https://api.recrutaria.com.br
```

## Documentos de referência
- Contratos de API: `docs/API_CONTRACTS_V1.md`
- Mapa de skills: `docs/skills/RECRUTARIA_SKILL_MAP_V1.md`
- Registry de skills: `docs/skills/RECRUTARIA_SKILL_REGISTRY_V1.json`
- Checklist de release: `docs/RELEASE_CHECKLIST.md`
- Estratégia de testes: `docs/testing/TEST_STRATEGY.md`
- Manual de processos operacionais: `docs/processes/README.md`
- Status dos processos: `docs/processes/PROCESSOS_STATUS.md`
- Research GTM: `docs/research/GTM_DECISION_MEMO_2026Q2.md`
- Script de entrevistas: `docs/research/INTERVIEW_SCRIPT_AND_SCORECARD.md`
- Runbook de domínio/site/app/api: `docs/ops/DOMAIN_SPLIT_RUNBOOK_2026-04-16.md`
- Plano executivo do wedge: `docs/ops/CEO_WEDGE_AND_PRODUCTION_PLAN_2026-04-21.md`

## Observações
- Endpoint de pagamento aceita `customer` explícito (`name`, `email`, `phone`, `taxId`).
- Em ambiente não-prod, existe fallback controlado para não bloquear desenvolvimento local.
