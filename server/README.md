# Recruta.AI Server

## Scripts
- `npm run dev`: sobe API em `:3456`
- `npm run build`: type-check com `tsc`
- `npm test`: smoke tests de health e assinatura de webhooks
- `npm run seed`: seed manual de demo

## Segurança aplicada
- JWT com validação de role
- Fail-fast de configuração em produção
- Verificação de assinatura para:
  - WhatsApp Meta (`x-hub-signature-256`)
  - WhatsApp Gateway/Automatik (`x-webhook-secret` ou `?token=...`)
  - AbacatePay (`x-abacate-signature`)

## Endpoints principais
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Jobs: `/api/jobs`, `/api/recruiter/jobs`
- Candidate: `/api/candidate/*`
- Recruiter: `/api/recruiter/*`
- Payments: `/api/payment/*`
- WhatsApp: `/api/whatsapp/*`

## Ambiente
Em produção, o processo exige:
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ABACATE_PAY_TOKEN`
- `ABACATE_WEBHOOK_SECRET`

### WhatsApp (Meta Cloud API direto)
- `WHATSAPP_PROVIDER=meta`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- Opcional para ambiente de teste (quando template principal ainda não está aprovado):
  - `WHATSAPP_FALLBACK_TEMPLATE_NAME=hello_world`
  - `WHATSAPP_FALLBACK_TEMPLATE_LANG=en_US`

### WhatsApp via Gateway (Automatik/Tomik)
- `WHATSAPP_PROVIDER=automatik`
- `WHATSAPP_GATEWAY_ENDPOINT`
- `WHATSAPP_GATEWAY_API_KEY`
- `WHATSAPP_GATEWAY_WEBHOOK_SECRET`
