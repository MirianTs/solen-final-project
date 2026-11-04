# Solen v2 — solen.ge

Website for **Solen** (heating, radiators, air conditioning — Tbilisi): one public page and an admin panel.
Next.js 16 · Tailwind CSS v4 · Supabase · Cloudflare Turnstile · Vercel · GitHub Actions — **all free tiers**.

- Public page `/` — header, banner + rating, prices, P1–P4 blocks, reviews + review form, contacts.
  All content comes from the database; the page is static (ISR) and rebuilt on every admin save.
- Admin panel `/admin` — photos, prices (drag-and-drop), texts, contacts, review moderation. Georgian, mobile-friendly.
- Daily encrypted backup of the database and photos (GitHub Actions), which also keeps Supabase awake.

Contents: [Local development](#local-development) · [Setup from zero](#setup-from-zero) ·
[Database](#database) · [Admin user](#admin-user) · [Reviews and anti-spam](#reviews-and-anti-spam) ·
[SEO and performance](#seo-and-performance) · [Backups and restore](#backups-and-restore) · [Go live](#go-live-checklist)

---

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

Open http://localhost:3000 (admin: http://localhost:3000/admin).

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build — `/` must show as `○` (static) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | TypeScript check |

### Environment variables

| Variable | Where it comes from | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | no |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API keys → `anon` (or the *publishable* key) | no |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API keys → `service_role` (or a *secret* key) | **yes** |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare → Turnstile → widget | no |
| `TURNSTILE_SECRET_KEY` | Cloudflare → Turnstile → widget | **yes** |
| `HASH_SALT` | random, 32+ chars: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | **yes** |
| `NEXT_PUBLIC_SITE_URL` | `https://solen.ge` in production, `http://localhost:3000` locally | no |

All are validated at startup by [`lib/env.ts`](lib/env.ts). Never commit `.env.local`.

---

## Setup from zero

Do these once, in order. Each step links to the detailed section.

### 1. Supabase project
1. https://supabase.com → **New project**. Region: **Central EU (Frankfurt)** (closest to Georgia).
   Save the database password in your password manager.
2. **Settings → Infrastructure**: note the Postgres major version (e.g. 17). If it is higher than
   `PG_MAJOR` in [`.github/workflows/backup.yml`](.github/workflows/backup.yml), update that value.
3. Run the SQL files — see [Database](#database).
4. Create the admin user — see [Admin user](#admin-user).

### 2. Cloudflare Turnstile
Cloudflare dashboard → **Turnstile → Add widget**: name `solen.ge`, hostnames `solen.ge`, `www.solen.ge`
(add `localhost` for local tests), widget mode **Managed**. Copy the site key and the secret key.

### 3. Vercel (from your personal GitHub)
1. https://vercel.com → **Add New → Project** → import `MirianTs/solen-v2-website-setup`
   (Hobby plan; give Vercel access to this private repo when GitHub asks).
2. Framework preset: **Next.js**. Leave build/output settings at their defaults.
3. **Environment Variables**: add all 7 variables from the table above for *Production* (and *Preview*).
   For now `NEXT_PUBLIC_SITE_URL` can be the `https://<project>.vercel.app` address; change it to
   `https://solen.ge` when going live.
4. **Settings → Functions → Function Region**: choose **Frankfurt (fra1)** to sit next to the database.
5. Deploy. Open the `.vercel.app` URL and `/admin`, log in, change a text, check the public page updates.

> Image Optimization is not used (`images.unoptimized = true`), so it never counts against the Hobby quota.

### 4. Supabase Auth URLs
**Authentication → URL Configuration**: *Site URL* = the Vercel URL for now (later `https://solen.ge`);
*Redirect URLs*: add the Vercel URL and `http://localhost:3000/**`.

### 5. GitHub Actions secrets (backups)
Repository → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
| --- | --- |
| `SUPABASE_DB_URL` | Supabase → **Connect** → **Session pooler** → URI, with your DB password filled in (URL-encode special characters). Looks like `postgresql://postgres.<ref>:<password>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`. Use the *Session pooler*, **not** the direct connection: GitHub runners have no IPv6. |
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | same as in Vercel |
| `BACKUP_PASSPHRASE` | a long random passphrase — **also store it in your password manager**; without it backups cannot be opened |

Then **Actions → Backup → Run workflow** once and check that it succeeds (see [Backups](#backups-and-restore)).

---

## Database

Files in [`supabase/`](supabase/). Run them in **Supabase Dashboard → SQL Editor → New query**, one file per query,
in this order (each is safe to re-run):

1. `migrations/20261031000001_tables.sql` — tables, constraints, indexes
2. `migrations/20261031000002_admins_rls_views.sql` — `admins`, `is_admin()`, grants, RLS, `public_reviews` / `review_stats`
3. `migrations/20261031000003_storage.sql` — public `photos` bucket + admin-only write policies
4. `migrations/20261101000001_service_photos.sql` — optional photo per price item (product cards)
5. `migrations/20261103000001_services_only.sql` — one "services and prices" section
6. `migrations/20261104000001_invoker_review_views.sql` — review views run as the caller (`security_invoker`)
7. `seed.sql` — starter content: texts and prices from the old solen.ge (skip this when restoring a backup)
8. `verify_rls.sql` — self-test; must end with `ALL RLS CHECKS PASSED` (rolls back, changes nothing)

Security model: RLS on every table; everyone may read content tables; only `is_admin()` may write.
`reviews`: anon may SELECT only approved rows (RLS) and only the safe columns (column grants — `device_hash` and
`ip_hash` are not granted). `public_reviews` / `review_stats` are `security_invoker` views on top of that.
New reviews are inserted only by the server action with the service-role key.

---

## Admin user

The admin panel is at `/admin` (email + password, Supabase Auth). There is no public sign-up.

1. **Authentication → Sign In / Providers → Email**: keep Email enabled, turn **Allow new users to sign up** OFF.
2. **Authentication → Users → Add user → Create new user**: enter the admin email + a strong password,
   tick **Auto Confirm User**.
3. **SQL Editor** — make that user an admin (replace the email):

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'admin@example.com'
   on conflict (user_id) do nothing;

   -- check: should return one row
   select a.user_id, u.email from public.admins a join auth.users u on u.id = a.user_id;
   ```

To remove an admin: `delete from public.admins where user_id = (select id from auth.users where email = '...');`

**Passwords.** Signed-in admins change their password at `/admin/account` («პაროლი»). A forgotten password is
reset from the login page («პაროლი დაგავიწყდა?» → `/admin/forgot`): Supabase emails a link to
`/admin/auth/confirm`, which signs the user in and opens `/admin/reset`. Needs:
- **Authentication → Emails → SMTP Settings**: a custom SMTP (e.g. the Solen Gmail with an App Password:
  host `smtp.gmail.com`, port `465`). Without it Supabase only emails members of the Supabase organization,
  max ~2 per hour.
- Recommended — **Emails → Templates → Reset password**: link
  `{{ .SiteURL }}/admin/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`, so the link works on any device.
  With the default template the link only works in the browser where the reset was requested.
- Redirect URLs must include `<site>/**` (see *Supabase Auth URLs*).

Security: `proxy.ts` refreshes the session and redirects signed-out users to `/admin/login`, but every admin
page and server action also re-checks the user **and** `is_admin()` on the server.

---

## Reviews and anti-spam

Visitors leave reviews on the public page. Each one is stored as `pending` and appears on the site
only after an admin approves it in **/admin → შეფასებები**.

The submit server action ([`app/actions/submit-review.ts`](app/actions/submit-review.ts)) does, in order:
1. zod validation (rating 1–5, name ≤ 60, comment ≤ 1000, HTML tags stripped);
2. Cloudflare Turnstile verification on the server (`TURNSTILE_SECRET_KEY` + visitor IP);
3. one review per device **and** per IP per 30 days — a random httpOnly cookie id (1 year) and the IP
   are stored only as salted SHA-256 hashes (`HASH_SALT`);
4. insert with the service-role key (anon has no access to the `reviews` table).

For development, `.env.example` contains Cloudflare's official always-pass Turnstile test keys.

---

## SEO and performance

- Georgian title/description, `lang="ka"`, canonical URL and Open Graph/Twitter tags; the share image is the
  **og** photo slot (falls back to the banner). `metadataBase` = `NEXT_PUBLIC_SITE_URL`.
- JSON-LD `HVACBusiness` (name, phone, address, area served, image, Facebook, `aggregateRating` only when
  there are approved reviews).
- `/robots.txt` (blocks `/admin`), `/sitemap.xml`, admin pages send `noindex` (meta + `X-Robots-Tag`).
- 301 redirects from the old site: `/inventory`, `/inventory/*`, `/gallery`, `/gallery/*` → `/`.
- `/` is static (ISR): rebuilt on every admin save and at most hourly otherwise.
- Placeholder icon: `app/icon.svg` and `app/apple-icon.tsx` (replace when a logo exists).

Lighthouse (mobile, `npm run build && npm run start`, local test data), 3 runs on 2026-10-31:
Performance 96–97 · Accessibility 100 · Best Practices 100 · SEO 100 (LCP ≈ 2.7 s simulated, CLS 0, TBT ≈ 65 ms).

```bash
npx lighthouse http://localhost:3000/ --chrome-flags="--headless=new" --view
```

---

## Backups and restore

[`.github/workflows/backup.yml`](.github/workflows/backup.yml) runs **daily at 02:17 UTC** and on demand
(**Actions → Backup → Run workflow**). It:

1. sends a REST request to the Supabase API (keep-alive — free projects pause after a week without activity);
2. installs the PostgreSQL client from the official PGDG apt repo and checks it matches the server version;
3. dumps the database with `pg_dump` (via the Session pooler):
   - `db/public_data.sql` — data of all site tables (restored on top of the migrations),
   - `db/auth_users.sql` — admin login accounts (`auth.users`, `auth.identities`),
   - `db/public_full.sql` — full `public` schema + data, for reference;
4. downloads every file of the `photos` bucket ([`scripts/backup-photos.mjs`](scripts/backup-photos.mjs));
5. packs everything into `solen-backup-<date>.tar.gz`, encrypts it with `gpg --symmetric` (AES-256,
   `BACKUP_PASSPHRASE`) and uploads it as a workflow artifact kept **30 days**.

Only the encrypted file leaves the runner. The repository must stay **private**. Free-tier usage is tiny
(≈ 2 Actions minutes per run, a few MB of artifact storage).

### Download and decrypt

1. GitHub → **Actions → Backup** → a successful run → **Artifacts** → download (you get a `.zip`); unzip it.
2. In **Git Bash** (Git for Windows includes `gpg` and `tar`) or any Linux/macOS shell:

   ```bash
   gpg --decrypt --output backup.tar.gz solen-backup-YYYY-MM-DD_HHMM.tar.gz.gpg   # asks for BACKUP_PASSPHRASE
   mkdir backup && tar -xzf backup.tar.gz -C backup
   ```

   You get `backup/db/*.sql` and `backup/photos/` (with `_manifest.json`).

### Restore into a NEW Supabase project (full disaster)

Needs `psql` 17 (Windows: install PostgreSQL 17 from postgresql.org — only *Command Line Tools* are needed)
and Node.js.

1. Create the new project and run the 4 migrations (**not** `seed.sql`) — see [Database](#database).
2. Restore admin accounts, then the site data (use the new project's *Session pooler* URI):

   ```bash
   psql "$NEW_DB_URL" -v ON_ERROR_STOP=1 -f backup/db/auth_users.sql
   psql "$NEW_DB_URL" -v ON_ERROR_STOP=1 -f backup/db/public_data.sql
   ```
3. Restore the photos:

   ```bash
   SUPABASE_URL=https://<new-ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<new key> \
     node scripts/restore-photos.mjs backup/photos
   ```
4. Disable sign-ups again, update the Supabase env vars in Vercel and the GitHub secrets, redeploy.
5. Run `supabase/verify_rls.sql` and check the site and `/admin`.

### Restore data into the SAME project (e.g. something was deleted by mistake)

Admin accounts still exist, so skip `auth_users.sql`. Empty the site tables first, then load the data:

```sql
truncate public.services, public.price_columns, public.reviews, public.settings,
         public.texts, public.photos, public.admins;
```

```bash
psql "$DB_URL" -v ON_ERROR_STOP=1 -f backup/db/public_data.sql
node scripts/restore-photos.mjs backup/photos   # only if photos were lost
```

Then save anything in the admin panel (or redeploy) so the public page is rebuilt.

---

## Go-live checklist

Moving **solen.ge** from the old Vercel project to this one:

- [ ] Everything in [Setup from zero](#setup-from-zero) is done and the `.vercel.app` deployment works
      (public page, admin login, a review submitted and approved, a photo uploaded).
- [ ] Real content entered in the admin panel (texts, prices, photos incl. the **og** share photo, contacts).
- [ ] Old Vercel project → **Settings → Domains** → remove `solen.ge` and `www.solen.ge`.
- [ ] This project → **Settings → Domains** → add `solen.ge` and `www.solen.ge`
      (make `solen.ge` primary; `www` redirects to it).
- [ ] **domeinebi.ge** DNS:
  - update the **`www` CNAME** to the exact value Vercel shows for `www.solen.ge`;
  - **keep** the **A record `76.76.21.21`** for `solen.ge`;
  - **keep** the **`google-site-verification` TXT** record.
- [ ] Wait until Vercel shows both domains as *Valid Configuration* (HTTPS certificate issued).
- [ ] Vercel env: `NEXT_PUBLIC_SITE_URL=https://solen.ge` → **redeploy** (canonical URL, sitemap, JSON-LD use it).
- [ ] Supabase → **Authentication → URL Configuration**: Site URL `https://solen.ge`; add `https://solen.ge/**`
      and `https://www.solen.ge/**` to Redirect URLs.
- [ ] Cloudflare Turnstile widget hostnames include `solen.ge` and `www.solen.ge`; Vercel uses the **real**
      Turnstile keys (not the test keys).
- [ ] Check: https://solen.ge loads, `/inventory` and `/gallery` redirect to `/`, `/robots.txt` and
      `/sitemap.xml` show `https://solen.ge`, the admin login works, a test review can be sent.
- [ ] Google Search Console → property `solen.ge` → **Sitemaps** → submit `https://solen.ge/sitemap.xml` again;
      **URL Inspection** → `https://solen.ge/` → *Request indexing*.
- [ ] GitHub → **Actions → Backup → Run workflow** once more and confirm the artifact can be decrypted.
