# PROGRESS — Solen v2 (solen.ge)

ახალი საიტი ნულიდან: Next.js 16 + Tailwind 4 + Supabase + Turnstile, მხოლოდ უფასო ტარიფებზე. სამუშაო 8 ფაზად მიდის, ყოველი ფაზის შემდეგ ვჩერდები და მომხმარებლის „continue“-ს ველოდები.

## გაკეთდა
- 2026-10-31 (NucBox_M8): ფაზა 1 — scaffold: git, Next.js 16.4.3, Tailwind 4.3, ESLint (flat), Noto Sans Georgian, ფერების token-ები, Supabase კლიენტები (public/server/client/admin), `lib/env.ts` (zod), CLAUDE.md, README, .env.example.

## დარჩა
- ფაზა 2: ბაზა (migrations, RLS, is_admin, views, storage, seed).
- ფაზა 3: საჯარო გვერდი. ფაზა 4: admin auth + proxy. ფაზა 5: admin სექციები. ფაზა 6: შეფასებები + Turnstile.
- ფაზა 7: SEO, redirects, Lighthouse. ფაზა 8: backup workflow + სრული README + Go live.

## გადაწყვეტილებები
- 2026-10-31 (NucBox_M8): Cache Components გამორთულია — კლასიკური ISR (`revalidate = 3600` + `revalidatePath('/')`), მომხმარებლის არჩევანით.

## ღია პრობლემები
