#!/bin/bash
# Recruta.AI - Automated SQLite Backup Script
# Put this in a cron job: 0 3 * * * /path/to/backup-sqlite.sh >> /var/log/recruta-backup.log 2>&1

# Configuration
DATA_DIR="/Users/franciscotaveira.ads/Documents/Recrutaria/recruta.ai---recrutamento-inteligente/server/storage/data"
BACKUP_DIR="${DATA_DIR}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_FILE="recruta.db"
BACKUP_FILE="recruta_${TIMESTAMP}.db"

# Create backup dir if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting backup at $TIMESTAMP..."

# SQLite online backup (safely copies WAL database without locking)
sqlite3 "${DATA_DIR}/${DB_FILE}" ".backup '${BACKUP_DIR}/${BACKUP_FILE}'"

if [ $? -eq 0 ]; then
  # Compress backup
  gzip "${BACKUP_DIR}/${BACKUP_FILE}"
  echo "Backup successful: ${BACKUP_FILE}.gz"
  
  # Keep only the last 7 backups (prune old ones)
  ls -t "${BACKUP_DIR}"/recruta_*.db.gz | tail -n +8 | xargs -r rm --
  echo "Old backups pruned."
else
  echo "ERROR: Backup failed."
  exit 1
fi
