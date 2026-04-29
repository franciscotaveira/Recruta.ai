#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${1:-.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[FAIL] env file not found: $ENV_FILE"
  exit 1
fi

get_env() {
  local key="$1"
  local value
  value="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 | cut -d '=' -f2- || true)"
  echo "${value}"
}

require_key() {
  local key="$1"
  local value
  value="$(get_env "$key")"
  if [[ -z "${value// }" ]]; then
    echo "[MISSING] $key"
    return 1
  fi
  return 0
}

echo "[INFO] validating production env from $ENV_FILE"

failed=0

for key in JWT_SECRET SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY ABACATE_PAY_TOKEN ABACATE_WEBHOOK_SECRET; do
  require_key "$key" || failed=1
done

provider="$(get_env WHATSAPP_PROVIDER | tr '[:upper:]' '[:lower:]' | xargs || true)"
if [[ -z "$provider" ]]; then
  echo "[MISSING] WHATSAPP_PROVIDER"
  failed=1
elif [[ "$provider" == "meta" ]]; then
  for key in WHATSAPP_ACCESS_TOKEN WHATSAPP_PHONE_NUMBER_ID WHATSAPP_WEBHOOK_VERIFY_TOKEN WHATSAPP_APP_SECRET; do
    require_key "$key" || failed=1
  done
elif [[ "$provider" == "automatik" ]]; then
  for key in WHATSAPP_GATEWAY_ENDPOINT WHATSAPP_GATEWAY_API_KEY WHATSAPP_GATEWAY_WEBHOOK_SECRET; do
    require_key "$key" || failed=1
  done
else
  echo "[FAIL] WHATSAPP_PROVIDER invalid: $provider (use meta|automatik)"
  failed=1
fi

if [[ "$failed" -eq 1 ]]; then
  echo "[FAIL] production env validation failed"
  exit 1
fi

echo "[OK] production env validation passed"
