-- ============================================================
-- Migration 002 — Phase B: real data (reminders + game sessions)
-- Run this in the Supabase SQL Editor. Safe to re-run.
-- Assumes 001 (profiles, care_links, invite_codes) already ran.
-- ============================================================

-- ------------------------------------------------------------
-- REMINDERS
-- Owned by an elderly user. A linked caregiver can also read,
-- create, and update them (so caregiver edits sync to the elder).
-- ------------------------------------------------------------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade, -- the elderly owner
  created_by uuid references public.profiles (id) on delete set null,
  title text not null,
  description text,
  icon text default '🔔',
  type text not null default 'activity' check (type in ('medicine', 'hydration', 'activity', 'appointment', 'other')),
  time_label text,
  status text not null default 'pending' check (status in ('completed', 'pending', 'upcoming')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reminders_user_id_idx on public.reminders (user_id);

drop trigger if exists reminders_set_updated_at on public.reminders;
create trigger reminders_set_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- GAME SESSIONS
-- One row per completed game. Powers progress charts + streaks.
-- ------------------------------------------------------------
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id text not null,
  game_title text,
  accuracy int check (accuracy between 0 and 100),
  score int,
  duration_seconds int,
  created_at timestamptz not null default now()
);

create index if not exists game_sessions_user_id_idx on public.game_sessions (user_id);
create index if not exists game_sessions_created_at_idx on public.game_sessions (created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.reminders enable row level security;
alter table public.game_sessions enable row level security;

-- Helper: is the current user a caregiver linked to :elderly_id ?
create or replace function public.is_linked_caregiver(elderly uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.care_links cl
    where cl.elderly_id = elderly
      and cl.caregiver_id = auth.uid()
      and cl.status = 'active'
  );
$$;

-- ---- REMINDERS policies ----
drop policy if exists "reminders - owner all" on public.reminders;
create policy "reminders - owner all"
  on public.reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reminders - caregiver select" on public.reminders;
create policy "reminders - caregiver select"
  on public.reminders for select
  using (public.is_linked_caregiver(user_id));

drop policy if exists "reminders - caregiver insert" on public.reminders;
create policy "reminders - caregiver insert"
  on public.reminders for insert
  with check (public.is_linked_caregiver(user_id));

drop policy if exists "reminders - caregiver update" on public.reminders;
create policy "reminders - caregiver update"
  on public.reminders for update
  using (public.is_linked_caregiver(user_id));

-- ---- GAME_SESSIONS policies ----
drop policy if exists "game_sessions - owner all" on public.game_sessions;
create policy "game_sessions - owner all"
  on public.game_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "game_sessions - caregiver select" on public.game_sessions;
create policy "game_sessions - caregiver select"
  on public.game_sessions for select
  using (public.is_linked_caregiver(user_id));

-- Elderly users can read the profiles of caregivers they are linked to
-- (used on Home → "Your Caregiver").
drop policy if exists "linked caregiver - select" on public.profiles;
create policy "linked caregiver - select"
  on public.profiles for select
  using (
    exists (
      select 1 from public.care_links cl
      where cl.caregiver_id = public.profiles.id
        and cl.elderly_id = auth.uid()
        and cl.status = 'active'
    )
  );

-- ============================================================
-- REALTIME
-- Add tables to the realtime publication so the caregiver and
-- elderly stay in sync live.
-- ============================================================
do $$
begin
  begin
    alter publication supabase_realtime add table public.reminders;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.game_sessions;
  exception when duplicate_object then null;
  end;
end $$;
