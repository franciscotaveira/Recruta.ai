# Test Strategy (TypeScript adaptation of C++ testing discipline)

## Principles
- Red -> Green -> Refactor for every critical bug/feature.
- Deterministic tests only (no sleep, no timing race reliance).
- Isolate external dependencies (webhooks, providers, payment gateways).
- Keep tests close to behavior contracts, not implementation details.

## Test Pyramid
- Unit:
  - auth helpers (`hashPassword`, `verifyPassword`, `requireAuth`)
  - frontend utility hooks (state/error handling)
- Integration:
  - API route behavior with signed/unsigned webhook requests
  - endpoint semantics for auth/payment/whatsapp flows
- Contract:
  - webhook payload/signature acceptance and rejection
  - paginated response shape (`data`, `total`, `limit`, `offset`)
- Smoke/E2E:
  - health endpoint + core route accessibility
  - minimal end-to-end checks in CI

## Current Automated Gates
- Frontend: `npm run lint`, `npm run build`, `npm run test`
- Backend: `npm run build`, `npm test`

## Regression Priorities
1. Webhook authenticity and idempotency
2. Role-based endpoint access
3. Payment customer contract and checkout creation
4. Bulk analysis credit spend/refund behavior
5. Candidate analyze/apply path

## Flake Prevention
- Mock or short-circuit external providers in test environment.
- Use fixed signatures/payloads for webhook contract tests.
- No network dependency in unit tests.
