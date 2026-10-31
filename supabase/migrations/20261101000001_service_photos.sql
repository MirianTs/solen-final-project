-- Solen v2: optional photo per price-list item (e.g. a boiler model). Run after the first three.
-- Files live in the existing `photos` bucket as svc-<service id>-<timestamp>.webp.

alter table public.services add column if not exists photo_path   text;
alter table public.services add column if not exists photo_width  int;
alter table public.services add column if not exists photo_height int;

alter table public.services drop constraint if exists services_photo_check;
alter table public.services add constraint services_photo_check check (
  (photo_path is null and photo_width is null and photo_height is null)
  or (
    photo_path ~ '^svc-[0-9a-f-]{36}-[0-9]{10,16}\.webp$'
    and photo_width between 1 and 10000
    and photo_height between 1 and 10000
  )
);
