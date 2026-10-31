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

## Database (Supabase)

Files in [`supabase/`](supabase/). Run them in **Supabase Dashboard → SQL Editor → New query**, one file per query,
in this order (each is safe to re-run):

1. `migrations/20261031000001_tables.sql` — tables, constraints, indexes
2. `migrations/20261031000002_admins_rls_views.sql` — `admins`, `is_admin()`, grants, RLS, `public_reviews` / `review_stats`
3. `migrations/20261031000003_storage.sql` — public `photos` bucket + admin-only write policies
4. `seed.sql` — Georgian placeholder content
5. `verify_rls.sql` — self-test; must end with `ALL RLS CHECKS PASSED` (rolls back, changes nothing)

The editor will warn that `public_reviews` and `review_stats` are security-definer views. That is intended:
anon reads approved reviews through them without any access to the `reviews` table or its hashes.

## Setup (to be completed)

1. Supabase project — Phase 2 (see "Database" above)
2. Admin user — Phase 4
3. Cloudflare Turnstile — Phase 6
4. Vercel deploy — Phase 8
5. Backups (GitHub Actions) — Phase 8
6. Go live (move solen.ge) — Phase 8
