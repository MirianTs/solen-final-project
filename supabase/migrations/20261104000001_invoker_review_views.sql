-- Solen v2: public review views run with the caller's privileges (security_invoker).
-- Replaces the security-definer views flagged by the Supabase linter. Anon can now read
-- approved rows of public.reviews directly, but only the safe columns: device_hash and
-- ip_hash are not granted, so they stay unreadable. Re-runnable.

-- Column-level grant: anon may read only these columns of reviews.
revoke all on public.reviews from anon;
grant select (id, rating, name, comment, status, created_at) on public.reviews to anon;

-- Anon sees approved reviews only. Admins keep "reviews_admin_all".
drop policy if exists "reviews_public_read_approved" on public.reviews;
create policy "reviews_public_read_approved" on public.reviews
  for select to anon
  using (status = 'approved');

alter view public.public_reviews set (security_invoker = true);
alter view public.review_stats set (security_invoker = true);

comment on view public.public_reviews is
  'Approved reviews without hashes. security_invoker: anon reads through RLS + column grants on public.reviews.';
comment on view public.review_stats is
  'Average rating and count of approved reviews. security_invoker, see public_reviews.';
