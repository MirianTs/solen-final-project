-- Solen v2: content and review tables.
-- Run first. Safe to re-run (IF NOT EXISTS / OR REPLACE).

-- Key/value contact settings (phone, viber, whatsapp, facebook_url, maps_url, google_review_url, address_text)
create table if not exists public.settings (
  key   text primary key,
  value text not null default ''
);

-- Key/value page texts (hero_slogan, section titles, p1..p4 title/text, contact_text, footer_text)
create table if not exists public.texts (
  key   text primary key,
  value text not null default ''
);

-- One row per image slot. path is the object path inside the `photos` storage bucket.
create table if not exists public.photos (
  slot       text primary key check (slot in ('banner', 'p1', 'p2', 'p3', 'p4', 'og')),
  path       text,
  alt        text not null default '',
  width      int check (width > 0),
  height     int check (height > 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.price_columns (
  id       uuid primary key default gen_random_uuid(),
  title    text not null check (char_length(title) <= 100),
  position int  not null default 0
);

create table if not exists public.services (
  id        uuid primary key default gen_random_uuid(),
  column_id uuid not null references public.price_columns (id) on delete cascade,
  name      text not null check (char_length(name) <= 200),
  price     text not null default '' check (char_length(price) <= 100),
  position  int  not null default 0
);

create index if not exists services_column_position_idx on public.services (column_id, position);
create index if not exists price_columns_position_idx on public.price_columns (position);

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  rating      int  not null check (rating between 1 and 5),
  name        text not null check (char_length(name) between 1 and 60),
  comment     text not null default '' check (char_length(comment) <= 1000),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  device_hash text,
  ip_hash     text,
  created_at  timestamptz not null default now()
);

create index if not exists reviews_status_created_idx on public.reviews (status, created_at desc);
create index if not exists reviews_device_hash_idx on public.reviews (device_hash);
create index if not exists reviews_ip_hash_idx on public.reviews (ip_hash);

-- Keep photos.updated_at current.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists photos_set_updated_at on public.photos;
create trigger photos_set_updated_at
  before update on public.photos
  for each row execute function public.set_updated_at();
