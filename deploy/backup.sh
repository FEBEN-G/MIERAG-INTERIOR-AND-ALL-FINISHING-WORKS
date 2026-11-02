#!/bin/sh
# Save the database and uploaded photos to backups/ and keep the last 14 days.
# Run from the repository root, e.g. daily from cron:
#   0 3 * * * cd /opt/mierag && ./deploy/backup.sh >> backups/backup.log 2>&1
set -eu

cd "$(dirname "$0")/.."
. ./.env

mkdir -p backups
stamp="$(date +%Y-%m-%d-%H%M)"
file="backups/mierag-$stamp.sql.gz"
uploads="backups/uploads-$stamp.tar.gz"
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-mierag}" "${POSTGRES_DB:-mierag}" | gzip > "$file"
docker compose -f docker-compose.prod.yml exec -T backend tar -czf - -C /app uploads > "$uploads"
find backups \( -name 'mierag-*.sql.gz' -o -name 'uploads-*.tar.gz' \) -mtime +14 -delete
echo "Saved $file and $uploads"
