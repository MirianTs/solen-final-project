# Solen v2 — solen.ge

Website for Solen (heating, radiators, air conditioning — Tbilisi).
Next.js 16 · Tailwind CSS v4 · Supabase · Cloudflare Turnstile · Vercel (all free tiers).

> This README is a skeleton. The full setup, restore and "Go live" guide is written in Phase 8.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

Open http://localhost:3000. The admin panel is at `/admin`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build (check that `/` is static: ○) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Environment variables

See [`.env.example`](.env.example). Required vars are validated at startup in [`lib/env.ts`](lib/env.ts).

## Setup (to be completed)

1. Supabase project — Phase 2
2. Admin user — Phase 4
3. Cloudflare Turnstile — Phase 6
4. Vercel deploy — Phase 8
5. Backups (GitHub Actions) — Phase 8
6. Go live (move solen.ge) — Phase 8
