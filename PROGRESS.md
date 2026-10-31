# PROGRESS — Solen v2 (solen.ge)

ახალი საიტი ნულიდან: Next.js 16 + Tailwind 4 + Supabase + Turnstile, მხოლოდ უფასო ტარიფებზე. სამუშაო 8 ფაზად მიდის, ყოველი ფაზის შემდეგ ვჩერდები და მომხმარებლის „continue“-ს ველოდები.

## გაკეთდა
- 2026-10-31 (NucBox_M8): ფაზა 1 — scaffold: git, Next.js 16.4.3, Tailwind 4.3, ESLint (flat), Noto Sans Georgian, ფერების token-ები, Supabase კლიენტები (public/server/client/admin), `lib/env.ts` (zod), CLAUDE.md, README, .env.example.
- 2026-10-31 (NucBox_M8): ფაზა 2 — ბაზა: 3 migration (ცხრილები; admins + is_admin + RLS + public_reviews/review_stats view-ები; photos bucket), seed.sql, verify_rls.sql, TS ტიპები. PGlite-ში შემოწმდა (ორჯერ გაშვება, RLS ტესტები, უარყოფითი ტესტიც).
- 2026-10-31 (NucBox_M8): ფაზა 3 — საჯარო გვერდი: header (მობილურზე hamburger + დარეკე), hero + რეიტინგის ზოლი, ფასები, P1–P4, შეფასებები („მეტის ნახვა“ server action-ით), კონტაქტი, footer, Viber modal QR-ით. შემოწმდა ბრაუზერში mock Supabase-ით (მობილური + desktop). `/` სტატიკურია (○, 1h).
- 2026-10-31 (NucBox_M8): ფაზა 4 — admin: proxy.ts (სესიის განახლება, /admin დაცვა), requireAdmin/assertAdmin (getUser + is_admin), შესვლის გვერდი ქართული შეცდომებით, layout + ნავიგაცია pending badge-ით, გასვლა. სექციები ჯერ placeholder-ებია. შემოწმდა mock auth-ით.
- 2026-10-31 (NucBox_M8): ფაზა 5 — admin სექციები: ფოტოები (ბრაუზერში WebP-ად შეკუმშვა, მაქს. 1600px, ახალი სახელი ყოველ ატვირთვაზე, ძველის წაშლა), ფასები (სვეტები/სერვისები, drag-and-drop მაუსით/თითით/კლავიატურით, რიგი ავტომატურად ინახება), ტექსტები, კონტაქტები (URL/ტელეფონის შემოწმება). ყველა action: admin check → zod → ჩაწერა → revalidatePath. შემოწმდა mock Supabase-ით.
- 2026-10-31 (NucBox_M8): ფაზა 6 — შეფასებები: საჯარო ფორმა (ვარსკვლავები radio-ებით, Turnstile მხოლოდ ფორმასთან მიახლოებისას იტვირთება), server action: zod → Turnstile → 30 დღეში 1 მოწყობილობიდან/IP-დან (SHA-256 + HASH_SALT) → pending. ადმინში ჩანართები (მოლოდინში/გამოქვეყნებული/დამალული), დადასტურება/დამალვა/წაშლა, badge ახლდება. შემოწმდა mock-ით და Cloudflare-ის ტესტ-გასაღებებით.
- 2026-10-31 (NucBox_M8): ფაზა 7 — SEO: ქართული metadata, OG/Twitter (og ფოტო → ბანერი), JSON-LD HVACBusiness (+aggregateRating), robots.txt, sitemap.xml, icon/apple-icon placeholder, 301 redirect-ები (/inventory, /gallery), preconnect Supabase-ზე. Lighthouse mobile: 96–97 / 100 / 100 / 100.
- 2026-10-31 (NucBox_M8): ფაზა 8 — backup workflow (ყოველდღე 02:17 UTC + ხელით): keep-alive, pg_dump (PGDG client 17, Session pooler), photos ჩამოტვირთვა, gpg AES-256, artifact 30 დღე. restore სკრიპტი. README დასრულდა: setup ნულიდან, restore, Go live. ფოტოების backup/restore და gpg ლოკალურად შემოწმდა; pg_dump ნაწილი — მხოლოდ რეალურ Supabase-ზე პირველი გაშვებისას.
- 2026-10-31 (NucBox_M8): Supabase პროექტი `solen` (Frankfurt, Postgres 17.11) შეიქმნა. 3 migration + seed გაეშვა SQL Editor-ში, verify_rls.sql: ALL RLS CHECKS PASSED. მონაცემები: 7 settings, 15 texts, 6 photo slot, 3 სვეტი, 8 სერვისი, 3 შეფასება, photos bucket.
- 2026-10-31 (NucBox_M8): ადმინი შეიქმნა (1 მომხმარებელი, admins-ში ჩაწერილი, დადასტურებული). Sign-up და anonymous sign-in გამორთულია.
- 2026-10-31 (NucBox_M8): Turnstile widget `solen.ge` (Managed; localhost, solen.ge, www.solen.ge). Vercel პროექტი `solen-v2-website-setup` შეიქმნა, 7 env ცვლადი შემოწმდა (მნიშვნელობების წაკითხვის გარეშე), deploy Ready → https://solen-v2-website-setup.vercel.app — შიგთავსი Supabase-იდან, redirect-ები, robots, JSON-LD მუშაობს. Supabase Site URL + redirect URL-ები დაყენდა, Vercel function region → fra1.
- 2026-10-31 (NucBox_M8): Turnstile-ს დაემატა `solen-v2-website-setup.vercel.app` (4 hostname). ადმინში შესვლა ცოცხალ საიტზე მუშაობს (request log-ით შემოწმდა).
- 2026-10-31 (NucBox_M8): დიზაინი: ანიმაციები (hero ტექსტი/ღილაკი, ყვითელი „glow“ ფოტოს გარეშე, ბანერის zoom, ღილაკის pulse, ბარათები scroll-ზე ჩნდება და hover-ზე იწევა — მხოლოდ CSS, reduced-motion-ზე გამორთულია); დიდ ეკრანზე container 1280/1440px, უფრო დიდი hero და ტიპოგრაფია; მობილურზე hero-ს გრძელი სიტყვა აღარ იჭრება (320–1280px შემოწმდა). Lighthouse mobile: 96/100/100/100.
- 2026-10-31 (NucBox_M8): ცოცხალ საიტზე ტესტი გაიარა: ფოტოს ატვირთვა (WebP 1600px, Storage, og:image revalidate-ით, წაშლა) და შეფასება Chrome-ში (Turnstile → hash-ები → pending → დადასტურება → საიტზე → წაშლა). ტესტური მონაცემები წაიშალა.
- 2026-11-01 (NucBox_M8): ღია/მუქი რეჟიმი საჯარო გვერდზე: პირველად სისტემის პარამეტრით, header-ში მზე/მთვარის ღილაკი, არჩევანი ინახება (localStorage). hero ბარათი ორივე რეჟიმში მუქია. ადმინი ყოველთვის მუქია. 320px-ზე „დარეკე“ მხოლოდ ხატულაა. შემოწმდა mock-ით 320–1280px.

## დარჩა
- Backup: GitHub-ში უკვე არის SUPABASE_URL და BACKUP_PASSPHRASE (ეს გაგრძელებისას თავიდან დავაგენერიროთ და მომხმარებელს მივცეთ შესანახად — ძველი არსად ინახება). დასამატებელია SUPABASE_DB_URL (Session pooler: postgres.kepsxmraelydmitsekjx@aws-1-eu-central-1.pooler.supabase.com:5432 + DB პაროლი) და SUPABASE_SERVICE_ROLE_KEY — `gh secret set NAME -R MirianTs/solen-v2-website-setup`. შემდეგ workflow-ს ხელით გაშვება და artifact-ის გახსნის ტესტი. შემდეგ დომეინი solen.ge + „Go-live checklist“ (README). რეალური შიგთავსი/ფოტოები ადმინიდან.
- ლოგოს ფაილი (icon/apple-icon და header-ში „SOLEN“ ტექსტი ჯერ placeholder-ია).

## გადაწყვეტილებები
- 2026-10-31 (NucBox_M8): Cache Components გამორთულია — კლასიკური ISR (`revalidate = 3600` + `revalidatePath('/')`), მომხმარებლის არჩევანით.
- 2026-10-31 (NucBox_M8): შეფასების თარიღი სერვერზე ფორმატდება (dateLabel) — ზოგ ბრაუზერს ka-GE locale არ აქვს და hydration error-ს იძლეოდა.
- 2026-10-31 (NucBox_M8): redirect-ები `statusCode: 301` (Next-ის `permanent` 308-ს აბრუნებს, სპეციფიკაცია 301-ს ითხოვს).
- 2026-10-31 (NucBox_M8): browser-image-compression `useWebWorker: false` — სხვაგვარად worker-ს CDN-იდან ტვირთავს.
- 2026-11-01 (NucBox_M8): თემა — `data-theme` html-ზე, inline script (`lib/theme.ts`) მხოლოდ `/`-ზე, paint-მდე; ღია რეჟიმში ყვითელი ტექსტად ცუდად იკითხება, ამიტომ ტექსტ/ხაზ/ხატულებისთვის ახალი token `accent-ink` (მუქი ქარვისფერი).

## ღია პრობლემები
- 2026-10-31 (NucBox_M8): აპის ჩაშენებულ ბრაუზერში Turnstile დასტურს არ იძლევა (Chrome-ში მუშაობს) — ვიზიტორებზე გავლენა არ აქვს.
