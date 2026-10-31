# PROGRESS — Solen v2 (solen.ge)

ახალი საიტი ნულიდან: Next.js 16 + Tailwind 4 + Supabase + Turnstile, მხოლოდ უფასო ტარიფებზე. სამუშაო 8 ფაზად მიდის, ყოველი ფაზის შემდეგ ვჩერდები და მომხმარებლის „continue“-ს ველოდები.

## გაკეთდა
- 2026-10-31 (NucBox_M8): ფაზა 1 — scaffold: git, Next.js 16.4.3, Tailwind 4.3, ESLint (flat), Noto Sans Georgian, ფერების token-ები, Supabase კლიენტები (public/server/client/admin), `lib/env.ts` (zod), CLAUDE.md, README, .env.example.
- 2026-10-31 (NucBox_M8): ფაზა 2 — ბაზა: 3 migration (ცხრილები; admins + is_admin + RLS + public_reviews/review_stats view-ები; photos bucket), seed.sql, verify_rls.sql, TS ტიპები. PGlite-ში შემოწმდა (ორჯერ გაშვება, RLS ტესტები, უარყოფითი ტესტიც).
- 2026-10-31 (NucBox_M8): ფაზა 3 — საჯარო გვერდი: header (მობილურზე hamburger + დარეკე), hero + რეიტინგის ზოლი, ფასები, P1–P4, შეფასებები („მეტის ნახვა“ server action-ით), კონტაქტი, footer, Viber modal QR-ით. შემოწმდა ბრაუზერში mock Supabase-ით (მობილური + desktop). `/` სტატიკურია (○, 1h).
- 2026-10-31 (NucBox_M8): ფაზა 4 — admin: proxy.ts (სესიის განახლება, /admin დაცვა), requireAdmin/assertAdmin (getUser + is_admin), შესვლის გვერდი ქართული შეცდომებით, layout + ნავიგაცია pending badge-ით, გასვლა. სექციები ჯერ placeholder-ებია. შემოწმდა mock auth-ით.
- 2026-10-31 (NucBox_M8): ფაზა 5 — admin სექციები: ფოტოები (ბრაუზერში WebP-ად შეკუმშვა, მაქს. 1600px, ახალი სახელი ყოველ ატვირთვაზე, ძველის წაშლა), ფასები (სვეტები/სერვისები, drag-and-drop მაუსით/თითით/კლავიატურით, რიგი ავტომატურად ინახება), ტექსტები, კონტაქტები (URL/ტელეფონის შემოწმება). ყველა action: admin check → zod → ჩაწერა → revalidatePath. შემოწმდა mock Supabase-ით.
- 2026-10-31 (NucBox_M8): ფაზა 6 — შეფასებები: საჯარო ფორმა (ვარსკვლავები radio-ებით, Turnstile მხოლოდ ფორმასთან მიახლოებისას იტვირთება), server action: zod → Turnstile → 30 დღეში 1 მოწყობილობიდან/IP-დან (SHA-256 + HASH_SALT) → pending. ადმინში ჩანართები (მოლოდინში/გამოქვეყნებული/დამალული), დადასტურება/დამალვა/წაშლა, badge ახლდება. შემოწმდა mock-ით და Cloudflare-ის ტესტ-გასაღებებით.

## დარჩა
- მომხმარებელმა SQL ფაილები Supabase-ის SQL Editor-ში უნდა გაუშვას (თანმიმდევრობა README-შია).
- ადმინის შექმნა Supabase-ში (SQL README-შია, „Admin user“).
- ფაზა 7: SEO, redirects, Lighthouse. ფაზა 8: backup workflow + სრული README + Go live.

## გადაწყვეტილებები
- 2026-10-31 (NucBox_M8): Cache Components გამორთულია — კლასიკური ISR (`revalidate = 3600` + `revalidatePath('/')`), მომხმარებლის არჩევანით.
- 2026-10-31 (NucBox_M8): შეფასების თარიღი სერვერზე ფორმატდება (dateLabel) — ზოგ ბრაუზერს ka-GE locale არ აქვს და hydration error-ს იძლეოდა.
- 2026-10-31 (NucBox_M8): browser-image-compression `useWebWorker: false` — სხვაგვარად worker-ს CDN-იდან ტვირთავს.

## ღია პრობლემები
