-- A concurrent first request must wait on the same IP's insert, not fail on its primary key.
create or replace function public.consume_contact_rate_limit(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.contact_rate_limits as limits (ip_hash, window_started_at, attempt_count)
  values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do update
  set window_started_at = case
        when limits.window_started_at < now() - interval '1 hour' then now()
        else limits.window_started_at
      end,
      attempt_count = case
        when limits.window_started_at < now() - interval '1 hour' then 1
        else limits.attempt_count + 1
      end
  where limits.window_started_at < now() - interval '1 hour'
     or limits.attempt_count < 5;

  -- No row is inserted/updated once an unexpired window has reached five attempts.
  return found;
end;
$$;

revoke all on function public.consume_contact_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_contact_rate_limit(text) to service_role;
