-- Solen v2: admins, is_admin(), grants, row level security and public views.
-- Run second.

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so it can read `admins` regardless of the caller's RLS.
-- search_path is pinned to '' to prevent search_path hijacking.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Table privileges (explicit, so we do not depend on Supabase's default grants).
-- RLS below narrows these down row by row.
-- ---------------------------------------------------------------------------
revoke all on public.settings, public.texts, public.photos, public.price_columns,
  public.services, public.reviews, public.admins from anon, authenticated;

grant select on public.settings, public.texts, public.photos, public.price_columns, public.services
  to anon, authenticated;
grant insert, update, delete on public.settings, public.texts, public.photos, public.price_columns, public.services
  to authenticated;

-- reviews: nothing for anon. Admins (authenticated + is_admin()) manage them.
grant select, insert, update, delete on public.reviews to authenticated;
grant select on public.admins to authenticated;

grant all on public.settings, public.texts, public.photos, public.price_columns,
  public.services, public.reviews, public.admins to service_role;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.settings      enable row level security;
alter table public.texts         enable row level security;
alter table public.photos        enable row level security;
alter table public.price_columns enable row level security;
alter table public.services      enable row level security;
alter table public.reviews       enable row level security;
alter table public.admins        enable row level security;

-- Content tables: everyone reads, only admins write.
do $$
declare
  t text;
begin
  foreach t in array array['settings', 'texts', 'photos', 'price_columns', 'services'] loop
    execute format('drop policy if exists "%1$s_public_read" on public.%1$I', t);
    execute format('drop policy if exists "%1$s_admin_insert" on public.%1$I', t);
    execute format('drop policy if exists "%1$s_admin_update" on public.%1$I', t);
    execute format('drop policy if exists "%1$s_admin_delete" on public.%1$I', t);

    execute format(
      'create policy "%1$s_public_read" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format(
      'create policy "%1$s_admin_insert" on public.%1$I for insert to authenticated with check ((select public.is_admin()))', t);
    execute format(
      'create policy "%1$s_admin_update" on public.%1$I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format(
      'create policy "%1$s_admin_delete" on public.%1$I for delete to authenticated using ((select public.is_admin()))', t);
  end loop;
end;
$$;

-- reviews: NO policy for anon at all. Admins have full access.
-- Public inserts go through the server action with the service-role key (bypasses RLS).
drop policy if exists "reviews_admin_all" on public.reviews;
create policy "reviews_admin_all" on public.reviews
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- admins: a signed-in user may only see their own row. Rows are added via the SQL editor.
drop policy if exists "admins_read_self" on public.admins;
create policy "admins_read_self" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Public review views
-- ---------------------------------------------------------------------------
-- These views are INTENTIONALLY security-definer (no security_invoker). They run with
-- the owner's (postgres) privileges, so anon can read approved reviews even though anon
-- has no access to the base `reviews` table. They expose only safe columns: device_hash
-- and ip_hash are never selected, and only status = 'approved' rows are returned.
-- The Supabase linter warns about security-definer views; that warning is expected here.
create or replace view public.public_reviews as
  select id, rating, name, comment, created_at
  from public.reviews
  where status = 'approved';

comment on view public.public_reviews is
  'Approved reviews without hashes. Intentionally security-definer: anon has no access to public.reviews.';

create or replace view public.review_stats as
  select
    coalesce(round(avg(rating)::numeric, 1), 0)::numeric(2, 1) as average,
    count(*)::int as count
  from public.reviews
  where status = 'approved';

comment on view public.review_stats is
  'Average rating and count of approved reviews. Intentionally security-definer, see public_reviews.';

alter view public.public_reviews owner to postgres;
alter view public.review_stats owner to postgres;

revoke all on public.public_reviews, public.review_stats from anon, authenticated;
grant select on public.public_reviews, public.review_stats to anon, authenticated, service_role;
