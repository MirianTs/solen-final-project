-- Solen v2: RLS self-test. Run in the Supabase SQL editor AFTER migrations + seed.
-- It changes nothing (everything is rolled back) and raises an error on the first failed check.
-- Expected result: a notice / message "ALL RLS CHECKS PASSED".

begin;

do $$
declare
  n int;
begin
  -- One approved review to read through the public view (rolled back with everything else).
  insert into public.reviews (rating, name, status) values (5, 'rls-test', 'approved');

  -- ---------------- anon ----------------
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);

  select count(*) into n from public.settings;
  if n = 0 then raise exception 'FAIL: anon cannot read settings'; end if;

  select count(*) into n from public.public_reviews;
  if n = 0 then raise exception 'FAIL: anon cannot read public_reviews'; end if;

  perform * from public.review_stats;

  begin
    perform count(*) from public.reviews;
    raise exception 'FAIL: anon can read reviews base table';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.reviews (rating, name) values (5, 'spam');
    raise exception 'FAIL: anon can insert reviews';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.texts set value = 'hacked' where key = 'hero_slogan';
    raise exception 'FAIL: anon can update texts';
  exception when insufficient_privilege then null;
  end;

  begin
    perform device_hash from public.public_reviews;
    raise exception 'FAIL: public_reviews exposes device_hash';
  exception when undefined_column then null;
  end;

  -- ------- signed-in user who is NOT an admin -------
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
    '{"role":"authenticated","sub":"11111111-1111-4111-8111-111111111111"}', true);

  if public.is_admin() then raise exception 'FAIL: random user is admin'; end if;

  update public.texts set value = 'hacked' where key = 'hero_slogan';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: non-admin updated texts'; end if;

  begin
    insert into public.texts (key, value) values ('evil', 'x');
    raise exception 'FAIL: non-admin inserted texts';
  exception when insufficient_privilege then null;
  end;

  select count(*) into n from public.reviews;
  if n <> 0 then raise exception 'FAIL: non-admin can see reviews base table'; end if;

  raise notice 'ALL RLS CHECKS PASSED';
end;
$$;

rollback;

select 'ALL RLS CHECKS PASSED (if you see this, no FAIL error was raised)' as result;
