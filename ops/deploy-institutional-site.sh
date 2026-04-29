#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   VPS_HOST=187.127.9.92 VPS_USER=root VPS_PASS='***' ./ops/deploy-institutional-site.sh

if [[ -z "${VPS_HOST:-}" || -z "${VPS_USER:-}" || -z "${VPS_PASS:-}" ]]; then
  echo "Missing env vars: VPS_HOST, VPS_USER, VPS_PASS"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$ROOT_DIR/ops/recrutaria-site"
DST_DIR="/var/www/recrutaria-site"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Source directory not found: $SRC_DIR"
  exit 1
fi

sshpass -p "$VPS_PASS" rsync -az --delete \
  -e "ssh -o StrictHostKeyChecking=no" \
  "$SRC_DIR/" "$VPS_USER@$VPS_HOST:$DST_DIR/"

sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" \
  "chown -R root:root $DST_DIR && find $DST_DIR -type d -exec chmod 755 {} \\; && find $DST_DIR -type f -exec chmod 644 {} \\; && nginx -t && systemctl reload nginx"

echo "Institutional site deployed to $VPS_USER@$VPS_HOST:$DST_DIR"
