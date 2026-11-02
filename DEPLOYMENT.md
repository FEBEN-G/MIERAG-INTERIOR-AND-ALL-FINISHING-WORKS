# Deploying on a VPS

The whole platform runs on one server with Docker Compose:

```
Internet ──► Caddy :80/:443 (HTTPS, certificates renewed automatically)
               ├── /api/*  ──► backend  (Express API, port 4000)
               └── /*      ──► frontend (Next.js site, port 3000)
                               backend ──► postgres (not reachable from outside)
```

Everything is served from one domain, so the admin login cookie works and the API sees each visitor's real address for rate limiting.

## 1. Server requirements

- Ubuntu 22.04/24.04 or Debian 12, with at least 2 GB RAM (building the website needs it; add swap on a 1 GB server)
- A domain whose **A record** (and AAAA, if the server has IPv6) points at the server's IP
- Ports **80** and **443** open in the firewall

## 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out and back in afterwards
```

Firewall (if you use ufw):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 3. Get the code

```bash
sudo mkdir -p /opt/mierag && sudo chown $USER /opt/mierag
git clone https://github.com/FEBEN-G/MIERAG-INTERIOR-AND-ALL-FINISHING-WORKS.git /opt/mierag
cd /opt/mierag
```

## 4. Configure

```bash
cp .env.production.example .env
openssl rand -hex 24   # use as POSTGRES_PASSWORD
openssl rand -hex 32   # use as JWT_SECRET
nano .env
```

Fill in every value: `DOMAIN` (without `https://`), `ACME_EMAIL`, the two generated secrets, the admin email and a strong admin password, and the notification email. SMTP settings are optional; without them, applications and messages are still saved and shown in the admin studio.

Keep `POSTGRES_PASSWORD` to letters and digits (the `openssl rand -hex` output is fine), because it is placed inside the database URL.

## 5. Start

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

The first build takes a few minutes. The API applies database migrations automatically every time it starts.

## 6. Create the admin account and base data

With the preview projects and gallery photos (useful until real content is ready):

```bash
docker compose -f docker-compose.prod.yml exec backend npm run db:seed
```

Or only the skill categories and the admin account, for a site that starts empty:

```bash
docker compose -f docker-compose.prod.yml exec -e SEED_PREVIEW=false backend npm run db:seed
```

Then open `https://YOUR_DOMAIN/admin/login` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Running the seed again keeps your admin password and any photo you edited in the studio, but it resets the preview projects and brings back preview photos you removed.

Forgot the admin password? Set a new `ADMIN_PASSWORD` in `.env`, then:

```bash
docker compose -f docker-compose.prod.yml up -d backend
docker compose -f docker-compose.prod.yml exec -e SEED_RESET_ADMIN=true -e SEED_PREVIEW=false backend npm run db:seed
```

## 7. Check it works

```bash
curl https://YOUR_DOMAIN/api/health        # {"status":"ok"}
docker compose -f docker-compose.prod.yml logs -f --tail=100
```

## Updating

Back up first: an update can change the database structure, and the API applies those changes automatically when it starts.

```bash
cd /opt/mierag
./deploy/backup.sh
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f
```

## Security checks at startup

In production the API refuses to start with a `JWT_SECRET` shorter than 32 characters or still set to the example value, or with `ADMIN_PASSWORD` set to `change-me`. Generate the secrets as shown in step 4.

## Backups

`deploy/backup.sh` saves a compressed database dump and all uploaded photos to `backups/` and keeps 14 days. Run it daily with cron (`crontab -e`):

```
0 3 * * * cd /opt/mierag && ./deploy/backup.sh >> backups/backup.log 2>&1
```

Copy the `backups/` folder off the server regularly (for example with `rsync` or your VPS provider's snapshots). A backup that stays on the same server is lost with that server.

Test a restore at least once before going live, so you know it works before you need it.

Restore the database:

```bash
gunzip -c backups/mierag-YYYY-MM-DD-HHMM.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres psql -U mierag -d mierag
```

Restore uploaded photos:

```bash
docker compose -f docker-compose.prod.yml exec -T backend tar -xzf - -C /app < backups/uploads-YYYY-MM-DD-HHMM.tar.gz
```

## Useful commands

| Task | Command |
| --- | --- |
| Status | `docker compose -f docker-compose.prod.yml ps` |
| Logs of one service | `docker compose -f docker-compose.prod.yml logs -f backend` |
| Restart | `docker compose -f docker-compose.prod.yml restart` |
| Stop everything | `docker compose -f docker-compose.prod.yml down` (data volumes are kept) |
| Database shell | `docker compose -f docker-compose.prod.yml exec postgres psql -U mierag -d mierag` |

## Notes

- **Photos:** upload them in the admin studio (JPG, PNG, or WebP, up to 10 MB). They are stored in the `uploads` Docker volume, so they survive updates. They are served at full size, so resize very large photos (around 2000 px wide is plenty) before uploading. Removing or replacing a photo in the studio does not delete the old file from the server.
- **www:** to redirect `www.YOUR_DOMAIN`, add a DNS record for it and uncomment the block at the end of `deploy/Caddyfile`.
- **API docs:** Swagger is available at `/api/docs`. It only describes the API; admin endpoints still require a login.
- **Changing the domain:** update `DOMAIN` in `.env` and rebuild, because the site address is built into the website.
