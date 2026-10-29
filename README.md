# MIERAG INTERIOR AND ALL FINISHING WORKS

Premium architectural website and skilled-worker recruitment platform.

**Slogan:** IN TO THE INFINITE HEIGHT

## Repository layout

```
.
├── frontend/            Next.js website and admin studio (deployed on Vercel)
│   ├── app/             Routes: public site, /gallery, /projects, /admin
│   ├── components/      UI by feature (home, gallery, projects, hire, admin, layout, ui)
│   ├── lib/             API client, preview data, i18n dictionary, helpers
│   ├── hooks/           Shared React hooks
│   ├── types/           Shared TypeScript types
│   └── public/assets/   Brand mark and preview photography
├── backend/             Express + Prisma API (hosted separately, with Postgres)
│   ├── src/config/      Environment, CORS, Prisma client
│   ├── src/middleware/  Auth, errors, rate limits
│   ├── src/modules/     One folder per feature: routes → controller → service
│   ├── src/docs/        OpenAPI spec and Swagger UI (/api/docs)
│   ├── prisma/          Schema, migrations, seed data
│   └── tests/           Vitest unit tests
├── docker-compose.yml   Local PostgreSQL
└── .github/workflows/   CI: lint, type check and tests for both apps
```

## What is implemented

- Cinematic homepage: logo intro, full-screen hero, editorial services, about, layered portfolio, before/after slider, project opportunities, and a closing contact sequence.
- Design Hub at `/gallery` with category filters, comparison slider, and lightbox.
- Project Matrix at `/projects` with search, filters, detail pages, and HIRE / ቅጥር applications.
- Amharic-first interface with an English toggle, plus light and dark themes.
- Admin studio at `/admin` for photos, projects, applications, and messages.
- Express + Prisma API for sites, skills, posts, inquiries, applications, admin auth, and email notifications.
- Palette extracted from the supplied mark: red `#C8102E`, gold `#D4A017` / `#E8C547`, used as accents on warm ivory surfaces.

## Preview content

Photography and project records are **development previews**, not live MIERAG commissions. Replace them with commissioned site photography and real project data before publication. Service categories should be verified with the company.

## Local development

Requirements: Node.js 20+, and Docker (or an existing PostgreSQL 16 database).

### 1. Database and API

```bash
docker compose up -d
cd backend
cp .env.example .env        # Windows cmd: copy .env.example .env
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

The API runs on [http://localhost:4000](http://localhost:4000), with Swagger docs at `/api/docs`.

### 2. Website

```bash
cd frontend
cp .env.example .env.local  # Windows cmd: copy .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With `NEXT_PUBLIC_API_URL` present but empty, the site calls `/api` on its own address and Next.js forwards it to the API on port 4000. Without the variable at all, listings and applications use a clearly labelled preview data layer.

Default admin from the seed (change immediately): `admin@example.com` / `change-me`, at `/admin/login`.

### Checks

```bash
cd backend && npx tsc --noEmit && npm test
cd frontend && npm run lint && npx tsc --noEmit
```

The same checks run on every push and pull request through GitHub Actions.

## Email notifications

Applications are saved first. If SMTP is not configured, a `notification_failures` row is recorded and the applicant still receives success. Configure `SMTP_*` and `ADMIN_NOTIFICATION_EMAIL` to enable delivery.

## Deployment

**Website (Vercel):** import this repository and set the project **Root Directory** to `frontend`. Set `NEXT_PUBLIC_SITE_URL` to the public address. To connect the API, set `NEXT_PUBLIC_API_URL` to an empty value and `API_PROXY_URL` to the hosted API's address, so browser requests stay on the site's own domain (the admin login cookie depends on this).

**API:** host `backend/` separately with PostgreSQL (`npm run build`, then `npm start`, after `npx prisma migrate deploy`). Set `FRONTEND_URL`, a strong `JWT_SECRET`, admin credentials, SMTP settings, and `TRUST_PROXY` to the number of proxies in front of the API.

## Assets still needed from the company

- Official contact telephone, email, and studio address
- Commissioned project photography (replace Unsplash preview images)
- Verified service list
- Real site records to replace `[PREVIEW RECORD]` seed data
- Production SMTP, JWT secret, and admin credentials
