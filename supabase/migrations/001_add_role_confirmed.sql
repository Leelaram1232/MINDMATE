-- ============================================================
-- Migration 001 — Google/OAuth role selection support
-- Run this in the Supabase SQL Editor if you already ran the
-- original schema.sql (adds the role_confirmed column + updates
-- the signup trigger). Safe to re-run.
-- ============================================================

-- 1. Add the role_confirmed column to existing profiles.
alter table public.profiles
  add column if not exists role_confirmed boolean not null default false;

-- Existing rows created via email signup already picked a role, so treat
-- them as confirmed (avoids forcing your current test users to re-pick).
update public.profiles set role_confirmed = true where role_confirmed = false;

-- 2. Update the signup trigger to populate role_confirmed and to read the
--    display name from Google's metadata ('name') as well.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, role_confirmed)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    coalesce(new.raw_user_meta_data ->> 'role', 'elderly'),
    (new.raw_user_meta_data ? 'role')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
