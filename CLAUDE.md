@AGENTS.md

# Solen v2 — solen.ge

Website for Solen, a heating / radiator / air-conditioning service company in Tbilisi.
One public page (`/`) + an admin panel (`/admin`). All content comes from Supabase.

## Stack
- Next.js 16 (App Router, TypeScript strict, Server Components, Server Actions). Middleware file is `proxy.ts`.
- Classic ISR caching: `cacheComponents` is **off**. Public page uses `export const revalidate = 3600`
  and is revalidated by `revalidatePath('/')` after every admin save. `/` must stay static (○) in build output.
- Tailwind CSS v4 — tokens in `app/globals.css` (`@theme`): `bg`, `card`, `card-raised`, `line`, `accent`,
  `accent-hover`, `accent-ink`, `fg`, `muted`. Use these, not raw hex values. `accent` is a fill (behind black
  text); use `accent-ink` for accent-colored text, icons and borders so they stay readable in light mode.
- Light/dark: public page only. Every visit starts dark; a switch to light lasts for the tab (sessionStorage).
  `THEME_SCRIPT` (`lib/theme.ts`) sets `<html data-theme>` before paint; light values
  live in `globals.css`, `.theme-dark` keeps a block dark, `light:` variant for theme-specific classes. Admin stays dark.
- Supabase (Postgres + Auth for admin only + Storage bucket `photos`), zod, Cloudflare Turnstile.
- Font: Noto Sans Georgian via `next/font/google`.

## Hard rules
- Free tiers only (Vercel Hobby, Supabase Free, Turnstile, GitHub Actions). No paid services.
- `images.unoptimized = true` — never enable Vercel Image Optimization. Images are compressed in the browser.
- All UI text (public + admin) is Georgian. Code, comments, commit messages in English.
- Never commit secrets. `.env.example` documents all vars; `lib/env.ts` validates them with zod.
- Mobile-first. Accessible: semantic HTML, visible yellow focus rings, aria-labels on icon buttons,
  `prefers-reduced-motion` respected.

## Supabase clients (`lib/supabase/`)
- `public.ts` — anon key, no cookies. Public page only (keeps it static).
- `server.ts` / `client.ts` — `@supabase/ssr` clients for the admin area.
- `admin.ts` — service role, `server-only`. Only for the review submit server action.

## Security model
- RLS on every table. Content tables: public SELECT, writes only for `is_admin()`.
- `reviews`: anon may read approved rows only (RLS) and only safe columns (column grants, no `device_hash`/`ip_hash`).
  Public reads go through the `security_invoker` views `public_reviews` / `review_stats`.
- Every admin page and server action re-checks the user AND `is_admin()` — never rely on `proxy.ts` alone.
- Every mutation: check admin → zod validate → write → `revalidatePath('/')`.

## Layout
- `app/` routes · `components/public|admin|ui` · `lib/` helpers · `supabase/migrations` + `supabase/seed.sql`
- `scripts/` dependency-free Node scripts (`backup-photos.mjs`, `restore-photos.mjs`)
- `.github/workflows/backup.yml` — daily encrypted backup + Supabase keep-alive (`PG_MAJOR` must be >= Supabase Postgres major)
- Setup, restore and go-live steps live in README.md — keep them in sync with code changes.

## Commands
- `npm run dev` · `npm run build` · `npm run start`
- `npm run lint` (ESLint flat config, `eslint.config.mjs`) · `npm run typecheck`
- After each change: `npm run build` and `npm run lint` must pass with no errors or warnings.

## Context between laptops
Progress notes are in `PROGRESS.md` (Georgian). Read it at session start, update it at the end of each task.
