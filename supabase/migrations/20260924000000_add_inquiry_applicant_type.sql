alter table public.contact_inquiries
  add column applicant_type text;

update public.contact_inquiries
set applicant_type = 'corporate'
where applicant_type is null;

alter table public.contact_inquiries
  alter column applicant_type set not null,
  alter column company drop not null,
  alter column role drop not null,
  add constraint contact_inquiries_applicant_type_check
    check (applicant_type in ('individual', 'corporate')),
  add constraint contact_inquiries_applicant_details_check check (
    (applicant_type = 'individual' and company is null and role is null)
    or
    (applicant_type = 'corporate'
      and nullif(btrim(company), '') is not null
      and nullif(btrim(role), '') is not null)
  );

create or replace function public.consume_contact_rate_limit(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_record public.contact_rate_limits%rowtype;
begin
  select * into current_record
  from public.contact_rate_limits
  where ip_hash = p_ip_hash
  for update;

  if not found then
    insert into public.contact_rate_limits (ip_hash) values (p_ip_hash);
    return true;
  end if;

  if current_record.window_started_at < now() - interval '1 hour' then
    update public.contact_rate_limits
    set window_started_at = now(), attempt_count = 1
    where ip_hash = p_ip_hash;
    return true;
  end if;

  if current_record.attempt_count >= 5 then
    return false;
  end if;

  update public.contact_rate_limits
  set attempt_count = attempt_count + 1
  where ip_hash = p_ip_hash;
  return true;
end;
$$;

revoke all on function public.consume_contact_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_contact_rate_limit(text) to service_role;
