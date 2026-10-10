# MIERAG frontend

Next.js App Router site for MIERAG INTERIOR AND ALL FINISHING WORKS.

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` when the Express API is running.

## Deploy on Vercel

Import this repository. The Next.js app is the repository root, so Vercel can build it with `npm run build`.

Leave `NEXT_PUBLIC_API_URL` unset to keep the labelled preview projects. Set `NEXT_PUBLIC_SITE_URL` to the public Vercel address. The Express API has to be hosted separately before live applications are connected.
