-- Pip's Midnight Nursery — optional shared backend.
--
-- The site is complete without this. Run it only if you want the guestbook to
-- be shared between visitors and the hit counter to be real. See the README
-- for the five-step setup.
--
-- Paste the whole file into Supabase → SQL Editor → Run.

-- ---------------------------------------------------------------- guestbook
create table if not exists guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 24),
  message text not null check (char_length(message) between 1 and 140),
  sticker text not null check (sticker in ('moon', 'star', 'ghost', 'teddy', 'bow', 'lantern')),
  created_at timestamptz default now()
);

create index if not exists guestbook_entries_created_at_idx
  on guestbook_entries (created_at desc);

alter table guestbook_entries enable row level security;

drop policy if exists "read" on guestbook_entries;
create policy "read" on guestbook_entries for select using (true);

drop policy if exists "write" on guestbook_entries;
create policy "write" on guestbook_entries for insert with check (true);

-- ------------------------------------------------------------------ counter
create table if not exists site_stats (
  id int primary key,
  visits bigint not null default 0
);

-- Starts at 0 so the number on screen is always true. (The brief suggested
-- seeding it at 1204 as an in-joke; if you'd rather have that, change the 0
-- below — but then say so somewhere, because it would otherwise be a
-- made-up visitor count.)
insert into site_stats (id, visits) values (1, 0) on conflict (id) do nothing;

alter table site_stats enable row level security;
-- No direct select policy: the number is only ever read through the two
-- functions below, which keeps the table itself from being written to.

create or replace function increment_visits() returns bigint
language sql security definer
set search_path = public
as $$
  update site_stats set visits = visits + 1 where id = 1 returning visits;
$$;

create or replace function visits() returns bigint
language sql security definer stable
set search_path = public
as $$
  select visits from site_stats where id = 1;
$$;

grant execute on function increment_visits() to anon;
grant execute on function visits() to anon;
