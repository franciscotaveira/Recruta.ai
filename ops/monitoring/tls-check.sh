#!/usr/bin/env bash
set -euo pipefail

# TLS sanity check for one or more hosts.
# Usage:
#   ./ops/monitoring/tls-check.sh recrutaria.com.br app.recrutaria.com.br api.recrutaria.com.br

if [[ "$#" -lt 1 ]]; then
  echo "Usage: $0 <host1> [host2 ...]" >&2
  exit 1
fi

fail_count=0

for host in "$@"; do
  echo "[INFO] Checking TLS for $host"

  if ! output="$(curl -sS -m 20 -I "https://${host}" 2>&1)"; then
    echo "[FAIL] ${host} -> TLS/HTTP check failed"
    echo "$output" | sed -n '1,4p'
    fail_count=$((fail_count + 1))
    continue
  fi

  status_line="$(echo "$output" | sed -n '1p')"
  server_line="$(echo "$output" | grep -i '^server:' | head -n 1 || true)"
  echo "[OK] ${host} -> ${status_line} ${server_line}"

done

if [[ "$fail_count" -gt 0 ]]; then
  echo "[FAIL] TLS check finished with ${fail_count} failure(s)." >&2
  exit 1
fi

echo "[INFO] TLS check passed for all hosts."
