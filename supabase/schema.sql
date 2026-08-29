-- ============================================================
-- MindMate NER — Database Schema (Phase A: Auth Foundation)
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- ============================================================

-- ------------------------------------------------------------
-- 1. PROFILES
-- One row per authenticated user. Extends auth.users with app data.
-- The `role` decides which experience (elderly vs caregiver) loads.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'elderly' check (role in ('elderly', 'caregiver')),
  -- true once the user explicitly chose their role (email signup, or the
  -- post-login role picker for Google/OAuth users).
  role_confirmed boolean not null default false,
  avatar_url text,
  phone text,
  language text not null default 'en' check (language in ('en', 'hi', 'te', 'ta')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App-level user profile, linked 1:1 to auth.users';

-- ------------------------------------------------------------
-- 2. CAREGIVER ↔ ELDERLY LINKS
-- A caregiver can be linked to many elderly users, and vice-versa.
-- Links are created by redeeming an invite code (see step 3).
-- ------------------------------------------------------------
create table if not exists public.care_links (
  id uuid primary key default gen_random_uuid(),
  caregiver_id uuid not null references public.profiles (id) on delete cascade,
  elderly_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'pending', 'revoked')),
  created_at timestamptz not null default now(),
  unique (caregiver_id, elderly_id)
);

comment on table public.care_links is 'Connects caregiver accounts to the elderly users they support';

-- ------------------------------------------------------------
-- 3. INVITE CODES
-- An elderly user (or caregiver) generates a short code that the other
-- party enters to establish a care_link. Simple, elder-friendly linking.
-- ------------------------------------------------------------
create table if not exists public.invite_codes (
  code text primary key,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_by_role text not null check (created_by_role in ('elderly', 'caregiver')),
  used_by uuid references public.profiles (id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

comment on table public.invite_codes is 'Short-lived codes used to link caregivers and elderly users';

-- ------------------------------------------------------------
-- 4. AUTO-CREATE PROFILE ON SIGNUP
-- When a new auth user is created, insert a matching profile row.
-- Reads full_name / role from the signup metadata (raw_user_meta_data).
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, role_confirmed, phone)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    coalesce(new.raw_user_meta_data ->> 'role', 'elderly'),
    (new.raw_user_meta_data ? 'role'),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do update
    set phone = coalesce(excluded.phone, public.profiles.phone);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh on profile edits.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- Everything is locked down by default; policies grant precise access.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.care_links enable row level security;
alter table public.invite_codes enable row level security;

-- ---- PROFILES policies ----
-- A user can read & update their own profile.
drop policy if exists "own profile - select" on public.profiles;
create policy "own profile - select"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "own profile - update" on public.profiles;
create policy "own profile - update"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "own profile - insert" on public.profiles;
create policy "own profile - insert"
  on public.profiles for insert
  with check (auth.uid() = id);

-- A caregiver can read the profiles of elderly users they are linked to.
drop policy if exists "linked elderly - select" on public.profiles;
create policy "linked elderly - select"
  on public.profiles for select
  using (
    exists (
      select 1 from public.care_links cl
      where cl.elderly_id = public.profiles.id
        and cl.caregiver_id = auth.uid()
        and cl.status = 'active'
    )
  );

-- ---- CARE_LINKS policies ----
-- Either party in a link can read it.
drop policy if exists "care link - select" on public.care_links;
create policy "care link - select"
  on public.care_links for select
  using (auth.uid() = caregiver_id or auth.uid() = elderly_id);

-- Either party can create a link that includes themselves.
drop policy if exists "care link - insert" on public.care_links;
create policy "care link - insert"
  on public.care_links for insert
  with check (auth.uid() = caregiver_id or auth.uid() = elderly_id);

-- Either party can revoke (update) their own link.
drop policy if exists "care link - update" on public.care_links;
create policy "care link - update"
  on public.care_links for update
  using (auth.uid() = caregiver_id or auth.uid() = elderly_id);

-- ---- INVITE_CODES policies ----
-- Creator can see their own codes.
drop policy if exists "invite - select own" on public.invite_codes;
create policy "invite - select own"
  on public.invite_codes for select
  using (auth.uid() = created_by);

-- Any authenticated user can look up a code to redeem it.
drop policy if exists "invite - select for redeem" on public.invite_codes;
create policy "invite - select for redeem"
  on public.invite_codes for select
  to authenticated
  using (true);

-- Users can create their own invite codes.
drop policy if exists "invite - insert" on public.invite_codes;
create policy "invite - insert"
  on public.invite_codes for insert
  with check (auth.uid() = created_by);

-- Redeemer can mark a code as used.
drop policy if exists "invite - update redeem" on public.invite_codes;
create policy "invite - update redeem"
  on public.invite_codes for update
  to authenticated
  using (true);

-- ============================================================
-- NOTE: Game sessions, reminders, activity log, and voice
-- conversation tables come in Phase B (real data). Kept out of
-- Phase A to keep the auth foundation focused.
-- ============================================================
