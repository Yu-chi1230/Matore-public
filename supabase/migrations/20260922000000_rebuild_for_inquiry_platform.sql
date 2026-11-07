-- Initial schema for the Matore inquiry platform.

create table public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  company text not null check (char_length(company) between 1 and 120),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 1 and 254),
  role text not null check (char_length(role) between 1 and 200),
  topic text not null check (topic in (
    '退職後のアクセスを残さない',
    '日々の対応に追われない',
    '担当者ひとりに頼らない',
    'その他・何から始めるか相談したい'
  )),
  message text not null check (char_length(message) between 1 and 3000),
  consent_at timestamptz not null,
  idempotency_key uuid not null unique,
  status text not null default 'new' check (
    status in ('new', 'in_progress', 'completed', 'out_of_scope')
  ),
  completed_at timestamptz,
  notification_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_inquiries_completed_at_check check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed' and completed_at is null)
  )
);

create table public.contact_rate_limits (
  ip_hash text primary key,
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 1 check (attempt_count between 1 and 5)
);

create index contact_inquiries_status_created_at_idx
  on public.contact_inquiries (status, created_at desc);
create index contact_inquiries_pending_notification_idx
  on public.contact_inquiries (created_at)
  where notification_sent_at is null;
create index contact_inquiries_completed_cleanup_idx
  on public.contact_inquiries (completed_at)
  where status = 'completed';
create index contact_rate_limits_window_idx
  on public.contact_rate_limits (window_started_at);

create function public.set_contact_inquiry_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.status = 'completed' and old.status is distinct from 'completed' then
    new.completed_at := now();
  elsif new.status <> 'completed' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create trigger set_contact_inquiry_timestamps
before update on public.contact_inquiries
for each row execute function public.set_contact_inquiry_timestamps();

create function public.delete_expired_contact_data()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  delete from public.contact_inquiries
  where status = 'completed'
    and completed_at < now() - interval '1 year';
  get diagnostics deleted_count = row_count;

  delete from public.contact_rate_limits
  where window_started_at < now() - interval '1 hour';

  return deleted_count;
end;
$$;

alter table public.contact_inquiries enable row level security;
alter table public.contact_inquiries force row level security;
alter table public.contact_rate_limits enable row level security;
alter table public.contact_rate_limits force row level security;

revoke all on table public.contact_inquiries from anon, authenticated;
revoke all on table public.contact_rate_limits from anon, authenticated;
revoke all on function public.delete_expired_contact_data() from public, anon, authenticated;
grant all on table public.contact_inquiries to service_role;
grant all on table public.contact_rate_limits to service_role;
grant execute on function public.delete_expired_contact_data() to service_role;

-- pg_cron is available in hosted Supabase and in the local stack.
create extension if not exists pg_cron with schema pg_catalog;
do $$
begin
  perform cron.schedule(
    'matore-delete-expired-contact-data',
    '17 18 * * *', -- 03:17 JST
    'select public.delete_expired_contact_data()'
  );
end
$$;
