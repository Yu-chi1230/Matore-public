-- Run as postgres on the inquiry database. All changes are rolled back.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '15s';
lock table public.contact_inquiries, public.contact_rate_limits in share row exclusive mode;

do $$
declare
  fixture_ids uuid[];
  surviving_ids uuid[];
  expired_id uuid;
  inquiry_fingerprint text;
  removed_count integer;
  job_record record;
  rate_prefix text := 'retention-check-' || gen_random_uuid()::text;
begin
  select * into strict job_record from cron.job
  where jobname = 'matore-delete-expired-contact-data';
  if not job_record.active
    or job_record.schedule <> '17 18 * * *'
    or job_record.command <> 'select public.delete_expired_contact_data()'
    or job_record.database <> current_database()
    or job_record.username <> current_user then
    raise exception 'Unexpected retention job configuration';
  end if;

  -- Compare existing data inside the database; never return inquiry contents.
  select md5(coalesce(string_agg(row_to_json(i)::text, '' order by id), ''))
  into inquiry_fingerprint from public.contact_inquiries i;
  select count(*) into removed_count from public.contact_inquiries
  where status = 'completed' and completed_at < now() - interval '1 year';
  if removed_count <> 0 then
    raise exception 'Existing expired inquiries found; review before verification';
  end if;

  with cases(status, completed_at) as (values
    ('completed', now() - interval '1 year' - interval '1 second'),
    ('completed', now() - interval '1 year'),
    ('completed', now() - interval '1 year' + interval '1 second'),
    ('completed', now() + interval '1 day'),
    ('new', null::timestamptz),
    ('in_progress', null::timestamptz),
    ('out_of_scope', null::timestamptz)
  ), inserted as (
    insert into public.contact_inquiries
      (applicant_type, company, name, email, role, topic, message,
       consent_at, idempotency_key, status, completed_at,
       notification_sent_at, created_at)
    select 'individual', null, 'Retention verification', 'retention@example.invalid',
      null, 'その他・何から始めるか相談したい', 'Transaction-only retention verification',
      now(), gen_random_uuid(), status, completed_at, now(), now() - interval '2 years'
    from cases
    returning id, completed_at
  ) select array_agg(id), (array_agg(id) filter (
      where completed_at < now() - interval '1 year'))[1]
    into fixture_ids, expired_id from inserted;

  insert into public.contact_rate_limits (ip_hash, window_started_at) values
    (rate_prefix || '-expired', now() - interval '1 hour' - interval '1 second'),
    (rate_prefix || '-boundary', now() - interval '1 hour'),
    (rate_prefix || '-recent', now());

  -- Execute exactly the SQL stored in the production cron job, as its role.
  execute job_record.command into removed_count;
  if removed_count <> 1 then
    raise exception 'Expected one inquiry deleted, got %', removed_count;
  end if;
  select array_agg(id) into surviving_ids from public.contact_inquiries
  where id = any(fixture_ids);
  if cardinality(surviving_ids) <> 6 or expired_id = any(surviving_ids) then
    raise exception 'Inquiry retention boundary/status verification failed';
  end if;
  if exists (select 1 from public.contact_rate_limits where ip_hash = rate_prefix || '-expired')
    or (select count(*) from public.contact_rate_limits
        where ip_hash in (rate_prefix || '-boundary', rate_prefix || '-recent')) <> 2 then
    raise exception 'Rate-limit retention verification failed';
  end if;

  if inquiry_fingerprint is distinct from (
    select md5(coalesce(string_agg(row_to_json(i)::text, '' order by id), ''))
    from public.contact_inquiries i where not (id = any(fixture_ids))
  ) then
    raise exception 'Existing inquiries changed';
  end if;

  raise notice 'PASS: job configuration; 1 expired inquiry deleted; 6 inquiries retained; rate-limit boundaries; existing inquiries unchanged';
  -- Expired real rate-limit rows may be deleted by the function in this
  -- transaction, but ROLLBACK below restores them along with all test changes.
end
$$;

rollback;
