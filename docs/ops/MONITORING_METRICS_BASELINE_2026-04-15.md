# Monitoring & Metrics Baseline (2026-04-15)

## Scope

- Institutional: `https://recrutaria.com.br`
- Product app: `https://app.recrutaria.com.br`
- API padrão: `https://app.recrutaria.com.br/api/*`
- API subdomínio (opcional): `https://api.recrutaria.com.br/api/*` (somente com DNS + SSL válidos)

## Critical SLOs

1. Availability
- `api/health` monthly success rate >= 99.5%
- App root (`/`) success rate >= 99.5%

2. Latency
- `api/health` p95 <= 800ms
- `api/auth/login` p95 <= 1200ms
- `api/payment/credits` p95 <= 2000ms

3. Reliability
- Webhook signature failures < 1% of total webhook requests
- Payment webhook idempotency failures = 0

## Core Metrics

1. Business funnel
- `page_view` by page and source (`utm_*`)
- `cta_click` by area (`topbar`, `hero`, `pricing`)
- `register_success`
- `payment_checkout_created`
- `payment_paid`

2. API quality
- request count by route + status
- 5xx rate by route
- rate-limit hit count
- webhook verification failures

3. Operations
- deployment timestamp
- synthetic check status
- incident count and MTTR

## Alerts

1. P1 (immediate)
- API health down for 3 consecutive checks
- app domain returns non-200 for 3 consecutive checks
- payment webhook endpoint returns 5xx

2. P2 (15 min)
- login 5xx rate > 2% in 15 min
- payment create 5xx rate > 1% in 15 min

3. P3 (daily review)
- conversion drop > 30% day/day with same ad spend

## Implementation Notes

- Structured logs now include `correlationId`.
- Error payload now includes `details.correlationId`.
- Use synthetic monitor script:
  - padrão: `ops/monitoring/synthetic-check.sh https://recrutaria.com.br https://app.recrutaria.com.br`
  - com API subdomínio opcional: `ops/monitoring/synthetic-check.sh https://recrutaria.com.br https://app.recrutaria.com.br https://api.recrutaria.com.br`

## Daily Ops Cadence

1. 09:00: check synthetic monitor + error spikes.
2. 14:00: check funnel events and campaign quality.
3. 18:00: review incidents and next-day fixes.
