-- Solen v2: starter content (texts and service prices; no reviews). Run after the migrations.
-- Safe to re-run: existing rows are left untouched (ON CONFLICT DO NOTHING).

insert into public.settings (key, value) values
  ('phone',             '+995568883279'),
  ('viber',             '+995568883279'),
  ('whatsapp',          '+995568883279'),
  ('facebook_url',      'https://www.facebook.com/profile.php?id=100085867923367'),
  ('maps_url',          ''),
  ('google_review_url', ''),
  ('address_text',      'თბილისი')
on conflict (key) do nothing;

insert into public.texts (key, value) values
  ('hero_slogan',    'ცენტრალური გათბობის მონტაჟი თქვენი სახლისთვის'),
  ('services_title', 'სერვისები და ფასები'),
  ('prices_note',    'ფასები საწყისია. საბოლოო ღირებულება დამოკიდებულია სამუშაოს სირთულესა და მოცულობაზე.'),
  ('reviews_title',  'შეფასებები'),
  ('contact_title',  'დაგვიკავშირდით'),
  ('contact_text', 'დაგვირეკეთ უფასო კონსულტაციისთვის — 24/7 მომსახურება.'),
  ('footer_text',  'Solen — ცენტრალური გათბობის სისტემების მონტაჟი, დიაგნოსტიკა და შეკეთება.')
on conflict (key) do nothing;

insert into public.photos (slot, alt) values
  ('banner', 'Solen — ცენტრალური გათბობის მონტაჟი'),
  ('og', 'Solen')
on conflict (slot) do nothing;

-- Fixed ids keep the seed idempotent.
insert into public.price_columns (id, title, position) values
  ('00000000-0000-4000-8000-000000000001', 'მომსახურება', 0)
on conflict (id) do nothing;

insert into public.services (id, column_id, name, price, position) values
  ('00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000001', 'ცენტრალური გათბობის ქვაბის მონტაჟი', '200₾-დან', 0),
  ('00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000001', 'კოლექტორის მონტაჟი', '100₾-დან', 1),
  ('00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000001', 'რადიატორის მონტაჟი', '60₾-დან', 2),
  ('00000000-0000-4000-8000-000000000114', '00000000-0000-4000-8000-000000000001', 'მაგისტრალური მილგაყვანილობის მოწყობა', '120₾-დან', 3),
  ('00000000-0000-4000-8000-000000000115', '00000000-0000-4000-8000-000000000001', 'ჩასაშენებელი უნიტაზის მექანიზმის ინსტალაცია', '300₾-დან', 4),
  ('00000000-0000-4000-8000-000000000116', '00000000-0000-4000-8000-000000000001', 'ჩასაშენებელი ონკანის მექანიზმის ინსტალაცია', '300₾-დან', 5),
  ('00000000-0000-4000-8000-000000000117', '00000000-0000-4000-8000-000000000001', 'კონდიციონერის მონტაჟი', '250₾-დან', 6)
on conflict (id) do nothing;
