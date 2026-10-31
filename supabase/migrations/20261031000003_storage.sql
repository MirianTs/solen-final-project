-- Solen v2: public `photos` storage bucket + admin-only write policies.
-- Run third.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "photos_public_read" on storage.objects;
drop policy if exists "photos_admin_insert" on storage.objects;
drop policy if exists "photos_admin_update" on storage.objects;
drop policy if exists "photos_admin_delete" on storage.objects;

-- Public read (public URLs work without this; the policy also allows listing).
create policy "photos_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'photos');

create policy "photos_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (select public.is_admin()));

create policy "photos_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and (select public.is_admin()))
  with check (bucket_id = 'photos' and (select public.is_admin()));

create policy "photos_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and (select public.is_admin()));
