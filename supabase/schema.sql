create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  source text not null default 'chatbot',
  external_lead_id text,
  full_name text,
  email text,
  phone text,
  phone_normalized text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  source text not null default 'n8n_chatbot',
  source_session_id text not null,
  channel text not null default 'website',
  status text not null default 'open',
  summary text,
  message_count integer not null default 0,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  source text not null default 'n8n_chatbot',
  source_message_id text,
  role text not null,
  direction text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.voice_calls (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  source text not null default 'retell',
  retell_call_id text not null,
  retell_agent_id text,
  from_number text,
  to_number text,
  direction text,
  status text not null default 'in_progress',
  duration_seconds integer,
  duration_label text,
  summary text,
  transcript_text text,
  recording_url text,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voice_transcript_turns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  call_id uuid not null references public.voice_calls (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  source text not null default 'retell',
  sequence_number integer not null default 0,
  role text not null,
  speaker text,
  content text not null,
  start_seconds double precision,
  end_seconds double precision,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  source text not null,
  event_type text not null,
  external_event_id text,
  processing_status text not null default 'processed',
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.organizations add column if not exists owner_user_id uuid references auth.users (id) on delete set null;
alter table public.organizations add column if not exists updated_at timestamptz not null default now();
alter table public.profiles add column if not exists organization_id uuid references public.organizations (id) on delete cascade;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.leads add column if not exists source text not null default 'chatbot';
alter table public.leads add column if not exists external_lead_id text;
alter table public.leads add column if not exists full_name text;
alter table public.leads add column if not exists email text;
alter table public.leads add column if not exists phone text;
alter table public.leads add column if not exists phone_normalized text;
alter table public.leads add column if not exists notes text;
alter table public.leads add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.leads add column if not exists last_seen_at timestamptz not null default now();
alter table public.leads add column if not exists updated_at timestamptz not null default now();
alter table public.chat_sessions add column if not exists lead_id uuid references public.leads (id) on delete set null;
alter table public.chat_sessions add column if not exists source text not null default 'n8n_chatbot';
alter table public.chat_sessions add column if not exists source_session_id text;
alter table public.chat_sessions add column if not exists channel text not null default 'website';
alter table public.chat_sessions add column if not exists status text not null default 'open';
alter table public.chat_sessions add column if not exists summary text;
alter table public.chat_sessions add column if not exists message_count integer not null default 0;
alter table public.chat_sessions add column if not exists started_at timestamptz not null default now();
alter table public.chat_sessions add column if not exists last_message_at timestamptz not null default now();
alter table public.chat_sessions add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.chat_sessions add column if not exists updated_at timestamptz not null default now();
alter table public.chat_messages add column if not exists lead_id uuid references public.leads (id) on delete set null;
alter table public.chat_messages add column if not exists source text not null default 'n8n_chatbot';
alter table public.chat_messages add column if not exists source_message_id text;
alter table public.chat_messages add column if not exists role text;
alter table public.chat_messages add column if not exists direction text;
alter table public.chat_messages add column if not exists content text;
alter table public.chat_messages add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.chat_messages add column if not exists sent_at timestamptz not null default now();
alter table public.voice_calls add column if not exists lead_id uuid references public.leads (id) on delete set null;
alter table public.voice_calls add column if not exists source text not null default 'retell';
alter table public.voice_calls add column if not exists retell_call_id text;
alter table public.voice_calls add column if not exists retell_agent_id text;
alter table public.voice_calls add column if not exists from_number text;
alter table public.voice_calls add column if not exists to_number text;
alter table public.voice_calls add column if not exists direction text;
alter table public.voice_calls add column if not exists status text not null default 'in_progress';
alter table public.voice_calls add column if not exists duration_seconds integer;
alter table public.voice_calls add column if not exists duration_label text;
alter table public.voice_calls add column if not exists summary text;
alter table public.voice_calls add column if not exists transcript_text text;
alter table public.voice_calls add column if not exists recording_url text;
alter table public.voice_calls add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.voice_calls add column if not exists started_at timestamptz not null default now();
alter table public.voice_calls add column if not exists ended_at timestamptz;
alter table public.voice_calls add column if not exists updated_at timestamptz not null default now();
alter table public.voice_transcript_turns add column if not exists lead_id uuid references public.leads (id) on delete set null;
alter table public.voice_transcript_turns add column if not exists source text not null default 'retell';
alter table public.voice_transcript_turns add column if not exists sequence_number integer not null default 0;
alter table public.voice_transcript_turns add column if not exists role text;
alter table public.voice_transcript_turns add column if not exists speaker text;
alter table public.voice_transcript_turns add column if not exists content text;
alter table public.voice_transcript_turns add column if not exists start_seconds double precision;
alter table public.voice_transcript_turns add column if not exists end_seconds double precision;
alter table public.voice_transcript_turns add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.webhook_events add column if not exists organization_id uuid references public.organizations (id) on delete set null;
alter table public.webhook_events add column if not exists source text;
alter table public.webhook_events add column if not exists event_type text;
alter table public.webhook_events add column if not exists external_event_id text;
alter table public.webhook_events add column if not exists processing_status text not null default 'processed';
alter table public.webhook_events add column if not exists error_message text;
alter table public.webhook_events add column if not exists payload jsonb not null default '{}'::jsonb;
alter table public.webhook_events add column if not exists processed_at timestamptz;

create unique index if not exists organizations_owner_user_id_idx on public.organizations (owner_user_id) where owner_user_id is not null;
create index if not exists profiles_organization_id_idx on public.profiles (organization_id);
create unique index if not exists leads_external_source_idx on public.leads (organization_id, source, external_lead_id) where external_lead_id is not null;
create index if not exists leads_email_idx on public.leads (organization_id, email) where email is not null;
create index if not exists leads_phone_normalized_idx on public.leads (organization_id, phone_normalized) where phone_normalized is not null;
create unique index if not exists chat_sessions_source_idx on public.chat_sessions (organization_id, source, source_session_id);
create index if not exists chat_sessions_org_last_message_idx on public.chat_sessions (organization_id, last_message_at desc);
create unique index if not exists chat_messages_source_idx on public.chat_messages (organization_id, session_id, source_message_id) where source_message_id is not null;
create index if not exists chat_messages_session_sent_idx on public.chat_messages (session_id, sent_at asc);
create unique index if not exists voice_calls_retell_call_idx on public.voice_calls (organization_id, source, retell_call_id);
create index if not exists voice_calls_org_started_idx on public.voice_calls (organization_id, started_at desc);
create unique index if not exists voice_transcript_turns_sequence_idx on public.voice_transcript_turns (call_id, sequence_number);
create index if not exists voice_transcript_turns_call_idx on public.voice_transcript_turns (call_id, created_at asc);
create unique index if not exists webhook_events_source_event_idx on public.webhook_events (source, event_type, external_event_id) where external_event_id is not null;

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
before update on public.organizations
for each row
execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

drop trigger if exists set_chat_sessions_updated_at on public.chat_sessions;
create trigger set_chat_sessions_updated_at
before update on public.chat_sessions
for each row
execute function public.set_updated_at();

drop trigger if exists set_voice_calls_updated_at on public.voice_calls;
create trigger set_voice_calls_updated_at
before update on public.voice_calls
for each row
execute function public.set_updated_at();

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.profiles
  where user_id = auth.uid()
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  requested_org_name text;
  requested_full_name text;
  fallback_name text;
begin
  requested_org_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'organization_name', '')), '');
  requested_full_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')), '');
  fallback_name := nullif(split_part(coalesce(new.email, ''), '@', 1), '');

  insert into public.organizations (name, owner_user_id)
  values (
    coalesce(requested_org_name, concat(coalesce(fallback_name, 'New'), ' Organization')),
    new.id
  )
  returning id into new_org_id;

  insert into public.profiles (user_id, organization_id, full_name, email)
  values (
    new.id,
    new_org_id,
    coalesce(requested_full_name, fallback_name, 'User'),
    new.email
  )
  on conflict (user_id) do update
  set
    organization_id = excluded.organization_id,
    full_name = excluded.full_name,
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.voice_calls enable row level security;
alter table public.voice_transcript_turns enable row level security;
alter table public.webhook_events enable row level security;

drop policy if exists "Members can view their organization" on public.organizations;
create policy "Members can view their organization"
on public.organizations
for select
using (id = public.current_organization_id());

drop policy if exists "Organization owners can update their organization" on public.organizations;
create policy "Organization owners can update their organization"
on public.organizations
for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "Organization owners can view leads" on public.leads;
create policy "Organization owners can view leads"
on public.leads
for select
using (organization_id = public.current_organization_id());

drop policy if exists "Organization owners can view chat sessions" on public.chat_sessions;
create policy "Organization owners can view chat sessions"
on public.chat_sessions
for select
using (organization_id = public.current_organization_id());

drop policy if exists "Organization owners can view chat messages" on public.chat_messages;
create policy "Organization owners can view chat messages"
on public.chat_messages
for select
using (organization_id = public.current_organization_id());

drop policy if exists "Organization owners can view voice calls" on public.voice_calls;
create policy "Organization owners can view voice calls"
on public.voice_calls
for select
using (organization_id = public.current_organization_id());

drop policy if exists "Organization owners can view voice transcript turns" on public.voice_transcript_turns;
create policy "Organization owners can view voice transcript turns"
on public.voice_transcript_turns
for select
using (organization_id = public.current_organization_id());

drop policy if exists "Organization owners can view webhook events" on public.webhook_events;
create policy "Organization owners can view webhook events"
on public.webhook_events
for select
using (organization_id = public.current_organization_id());
