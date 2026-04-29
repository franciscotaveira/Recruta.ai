#!/usr/bin/env bash
set -euo pipefail

# Basic secret hygiene scan for env files and repository text.

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[INFO] scanning for placeholder or weak secrets"

check_pattern() {
  local pattern="$1"
  local label="$2"
  if rg -n --hidden \
    -g '!node_modules' \
    -g '!.git' \
    -g '!server/test/**' \
    -g '!ops/security/check-secrets.sh' \
    "$pattern" . >/tmp/recrutaria_secret_scan.out 2>/dev/null; then
    echo "[WARN] $label"
    cat /tmp/recrutaria_secret_scan.out
    return 1
  fi
  return 0
}

failed=0
check_pattern "super_seguro_mudar_em_prod|PLACEHOLDER_API_KEY" "placeholder values found (review before production env)" || true
check_pattern "JWT_SECRET=.*(123456|changeme|password|adminadmin)" "potential weak JWT secret pattern found" || failed=1
check_pattern "ABACATEPAY_API_KEY=.*(test|example)" "possible non-production payment key in env file" || true

echo "[INFO] scanning for high-risk key leaks"
check_pattern "sk_live_[A-Za-z0-9]{20,}|xoxb-[A-Za-z0-9-]{20,}|SUPABASE_SERVICE_ROLE_KEY=[A-Za-z0-9._-]{40,}" "possible sensitive key material found" || failed=1

rm -f /tmp/recrutaria_secret_scan.out

if [[ "$failed" -eq 1 ]]; then
  echo "[FAIL] security hygiene check failed"
  exit 1
fi

echo "[OK] no critical secret hygiene findings"
