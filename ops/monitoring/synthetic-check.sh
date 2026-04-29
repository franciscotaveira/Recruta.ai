#!/usr/bin/env bash
set -euo pipefail

# Synthetic monitor for institutional + app + API.
# Usage:
#   ./ops/monitoring/synthetic-check.sh https://recrutaria.com.br https://app.recrutaria.com.br [https://api.recrutaria.com.br]

SITE_URL="${1:-https://recrutaria.com.br}"
APP_URL="${2:-https://app.recrutaria.com.br}"
API_URL="${3:-}"

fail() {
  echo "[FAIL] $1" >&2
  exit 1
}

check_http_200() {
  local url="$1"
  local expected="$2"
  local body
  local status
  body="$(mktemp)"
  status="$(curl -sS -m 20 -o "$body" -w "%{http_code}" "$url" || true)"
  if [[ "$status" != "200" ]]; then
    rm -f "$body"
    fail "status $status for $url"
  fi
  if ! grep -qi "$expected" "$body"; then
    rm -f "$body"
    fail "expected content '$expected' not found in $url"
  fi
  rm -f "$body"
  echo "[OK] $url"
}

check_json_health() {
  local url="$1"
  local status body
  body="$(mktemp)"
  status="$(curl -sS -m 20 -o "$body" -w "%{http_code}" "$url" || true)"
  if [[ "$status" != "200" ]]; then
    rm -f "$body"
    fail "status $status for $url"
  fi
  if ! grep -q '"status":"ok"' "$body"; then
    rm -f "$body"
    fail "health payload missing status ok in $url"
  fi
  rm -f "$body"
  echo "[OK] $url"
}

check_optional_api_subdomain() {
  local api_base="$1"
  local url="${api_base%/}/api/health"
  local status body
  body="$(mktemp)"
  status="$(curl -sS -m 20 -o "$body" -w "%{http_code}" "$url" || true)"
  if [[ "$status" != "200" ]]; then
    rm -f "$body"
    fail "optional API subdomain check failed: status $status for $url"
  fi
  if ! grep -q '"status":"ok"' "$body"; then
    rm -f "$body"
    fail "optional API subdomain payload missing status ok in $url"
  fi
  rm -f "$body"
  echo "[OK] $url"
}

echo "[INFO] Running synthetic checks at $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
check_http_200 "$SITE_URL/" "Recruta.AI"
check_http_200 "$SITE_URL/precos/" "Recruta.AI"
check_http_200 "$APP_URL/" "Recruta.AI"
check_json_health "$APP_URL/api/health"
if [[ -n "$API_URL" ]]; then
  check_optional_api_subdomain "$API_URL"
fi
echo "[INFO] synthetic checks passed"
