#!/bin/sh
# Dump the database to backups/ and keep the last 14 days.
# Run from the repository root, e.g. daily from cron:
#   0 3 * * * cd /opt/mierag && ./deploy/backup.sh >> backups/backup.log 2>&1
set -eu

cd "$(dirname "$0")/.."
. ./.env

mkdir -p backups
file="backups/mierag-$(date +%Y-%m-%d-%H%M).sql.gz"
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-mierag}" "${POSTGRES_DB:-mierag}" | gzip > "$file"
find backups -name 'mierag-*.sql.gz' -mtime +14 -delete
echo "Saved $file"
