-- Client request 2026-11-03: drop the boiler catalog and the P1–P4 blocks; the site shows one
-- "services and prices" section. Data only, no schema change. Safe to re-run.
-- Boiler photo files in Storage (svc-*.webp) are not removed here: delete them in the Storage UI.

begin;

-- Boiler columns (Italy / Turkey / China); their items go with them (ON DELETE CASCADE).
delete from public.price_columns where id <> '00000000-0000-4000-8000-000000000001';

insert into public.price_columns (id, title, position)
values ('00000000-0000-4000-8000-000000000001', 'მომსახურება', 0)
on conflict (id) do update set position = 0;

delete from public.services where column_id = '00000000-0000-4000-8000-000000000001';

insert into public.services (id, column_id, name, price, position) values
  ('00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000001', 'ცენტრალური გათბობის ქვაბის მონტაჟი', '200₾-დან', 0),
  ('00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000001', 'კოლექტორის მონტაჟი', '100₾-დან', 1),
  ('00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000001', 'რადიატორის მონტაჟი', '60₾-დან', 2),
  ('00000000-0000-4000-8000-000000000114', '00000000-0000-4000-8000-000000000001', 'მაგისტრალური მილგაყვანილობის მოწყობა', '120₾-დან', 3),
  ('00000000-0000-4000-8000-000000000115', '00000000-0000-4000-8000-000000000001', 'ჩასაშენებელი უნიტაზის მექანიზმის ინსტალაცია', '300₾-დან', 4),
  ('00000000-0000-4000-8000-000000000116', '00000000-0000-4000-8000-000000000001', 'ჩასაშენებელი ონკანის მექანიზმის ინსტალაცია', '300₾-დან', 5),
  ('00000000-0000-4000-8000-000000000117', '00000000-0000-4000-8000-000000000001', 'კონდიციონერის მონტაჟი', '250₾-დან', 6);

insert into public.texts (key, value) values
  ('services_title', 'სერვისები და ფასები'),
  ('prices_note', 'ფასები საწყისია. საბოლოო ღირებულება დამოკიდებულია სამუშაოს სირთულესა და მოცულობაზე.')
on conflict (key) do update set value = excluded.value;

delete from public.texts where key in ('prices_title', 'p1_title', 'p1_text', 'p2_title', 'p2_text', 'p3_title', 'p3_text', 'p4_title', 'p4_text');

commit;
