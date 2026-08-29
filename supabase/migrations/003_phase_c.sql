-- ============================================================
-- Migration 003 — Phase C: AI companion conversation history
-- Run in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

create table if not exists public.voice_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  sender text not null check (sender in ('user', 'assistant')),
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists voice_messages_user_id_idx on public.voice_messages (user_id, created_at);

alter table public.voice_messages enable row level security;

drop policy if exists "voice_messages - owner all" on public.voice_messages;
create policy "voice_messages - owner all"
  on public.voice_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
