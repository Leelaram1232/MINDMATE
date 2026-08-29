-- Migration 005 — Preferred language on profiles
-- Run in the Supabase SQL Editor. Safe to re-run.

alter table public.profiles
  add column if not exists language text not null default 'en';

alter table public.profiles
  drop constraint if exists profiles_language_check;

alter table public.profiles
  add constraint profiles_language_check
  check (language in ('en', 'hi', 'te', 'ta'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, role_confirmed, phone, language)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    coalesce(new.raw_user_meta_data ->> 'role', 'elderly'),
    (new.raw_user_meta_data ? 'role'),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'language', ''), 'en')
  )
  on conflict (id) do update
    set phone = coalesce(excluded.phone, public.profiles.phone),
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
        language = coalesce(nullif(excluded.language, ''), public.profiles.language);
  return new;
end;
$$;
