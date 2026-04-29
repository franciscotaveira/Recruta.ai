# Security Review Snapshot (2026-04-15)

## Changes applied

1. Webhook hardening
- WhatsApp verification on `GET /api/whatsapp/webhook`
- WhatsApp event processing on `POST /api/whatsapp/webhook`
- Payment webhook signature verification on `POST /api/payment/webhook`

2. Production fail-fast
- mandatory env vars in production startup:
  - `JWT_SECRET`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
  - `WHATSAPP_APP_SECRET`
  - `ABACATE_WEBHOOK_SECRET`

3. Traceability
- response header: `x-correlation-id`
- error payload includes `details.correlationId`

## Residual risks

1. Secrets may still be exposed in local ad-hoc files.
2. No WAF/rate policy per route yet (global + auth only).
3. No managed secret rotation workflow documented.

## Mandatory controls for next iteration

1. Add route-level rate limits for payment and webhook endpoints.
2. Add IP allowlist option for trusted webhook providers.
3. Store secrets only in VPS environment manager, never in repo.
4. Run `ops/security/check-secrets.sh` before every release.

## Verification commands

1. `npm run test:server`
2. `ops/security/check-secrets.sh`
3. `curl -I https://app.recrutaria.com.br/api/health`

