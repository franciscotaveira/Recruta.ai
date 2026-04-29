# Deployment & Rollback Playbook (2026-04-15)

## Preconditions

1. `npm run build` passes.
2. `npm run test:server` passes.
3. `ops/security/check-secrets.sh` passes.
4. Environment variables validated on VPS.

## Deployment Sequence

1. Frontend/App bundle
- build locally
- deploy dist to `/var/www/recruta-app` with `rsync --delete`

2. Institutional site
- deploy with:
  - `VPS_HOST=... VPS_USER=... VPS_PASS=... ./ops/deploy-institutional-site.sh`

3. Backend
- restart service/process manager
- verify logs for boot errors

4. Post-deploy smoke
- run:
  - `ops/monitoring/synthetic-check.sh`

## Rollback Strategy

1. Frontend rollback
- restore previous dist snapshot on VPS
- reload nginx

2. Backend rollback
- restart previous image/release tag
- validate `api/health`

3. DNS rollback
- only if infra route changed

## Hard Stop Conditions

1. `api/health` returns non-200 for > 5 min.
2. login or register fail rate > 5%.
3. payment checkout creation fails > 2%.

## Evidence to record after each release

1. deploy timestamp (UTC)
2. git commit hash
3. smoke-check output
4. incident notes (if any)

