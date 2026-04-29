# Release Checklist

## Build and Test Gates
- [ ] Frontend build passes: `npm run build`
- [ ] Backend build passes: `cd server && npm run build`
- [ ] Backend tests pass: `cd server && npm test`
- [ ] Lint passes: `npm run lint`

## Environment
- [ ] `JWT_SECRET` configured
- [ ] `SUPABASE_URL` configured
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configured
- [ ] `WHATSAPP_WEBHOOK_VERIFY_TOKEN` configured
- [ ] `WHATSAPP_APP_SECRET` configured
- [ ] `ABACATE_WEBHOOK_SECRET` configured

## Smoke Scenarios
- [ ] Candidate register/login works
- [ ] Recruiter creates a job
- [ ] Recruiter sends WhatsApp invite
- [ ] Candidate analysis endpoint returns result
- [ ] Payment checkout creates URL
- [ ] Health endpoint returns healthy/degraded payload

## Rollback
- [ ] Previous backend image/tag available
- [ ] Previous frontend build available
- [ ] DB migrations are backward compatible or reversible
- [ ] Rollback runbook tested for last release

## Observability
- [ ] Error logs available for auth/payment/webhook domains
- [ ] Alert configured for webhook signature failures spike
- [ ] Alert configured for payment webhook processing failures
