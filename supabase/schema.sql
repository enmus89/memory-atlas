-- Memory Atlas — database schema, row level security, and photo storage.
--
-- Run this once against a fresh Supabase project:
--   Supabase dashboard -> SQL Editor -> New query -> paste -> Run
--
-- It is written to be re-runnable: every object is created with
-- "if not exists" or dropped first, so applying it twice is harmless.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per signed-up user, created automatically by the trigger below.
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  email             text        not null,
  name              text        not null default 'Traveler',
  avatar            text        not null default '',
  avatar_color      text        not null default '#2563eb',
  bio               text        not null default '',
  home_country_code text        not null default 'US',
  traveler_level    text        not null default 'Novice Explorer',
  joined_date       date        not null default current_date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Travel memories. `id` is the client-generated string id the app already
-- uses; pairing it with user_id in the primary key keeps ids unique globally
-- without forcing the app to switch to uuids, and lets two users hold the
-- same demo/imported id without colliding.
create table if not exists public.memories (
  user_id      uuid        not null references auth.users (id) on delete cascade,
  id           text        not null,
  country_code text        not null,
  country_name text        not null,
  country_flag text        not null default '',
  continent    text        not null,
  city         text        not null default '',
  start_date   date        not null,
  end_date     date,
  title        text        not null default '',
  notes        text        not null default '',
  highlight    text,
  photos       jsonb       not null default '[]'::jsonb,
  tags         jsonb       not null default '[]'::jsonb,
  rating       int         not null default 5 check (rating between 1 and 5),
  weather      text,
  companions   text,
  is_favorite  boolean     not null default false,
  expenses     jsonb       not null default '[]'::jsonb,
  city_pins    jsonb       not null default '[]'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.wishlist_items (
  user_id          uuid        not null references auth.users (id) on delete cascade,
  id               text        not null,
  country_code     text        not null,
  country_name     text        not null,
  country_flag     text        not null default '',
  continent        text        not null,
  target_year      text,
  priority         text        not null default 'medium',
  estimated_budget numeric,
  currency         text,
  dream_activities jsonb       not null default '[]'::jsonb,
  notes            text,
  visited          boolean     not null default false,
  created_at       timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.city_pins (
  user_id      uuid        not null references auth.users (id) on delete cascade,
  id           text        not null,
  name         text        not null,
  country_code text        not null,
  lng          double precision not null,
  lat          double precision not null,
  category     text        not null default 'city',
  rating       int,
  notes        text,
  memory_id    text,
  photo_url    text,
  visited_date date,
  created_at   timestamptz not null default now(),
  primary key (user_id, id)
);

-- Listing a user's own rows newest-first is the only access pattern the app
-- has, so one index per table covers it.
create index if not exists memories_user_start_idx  on public.memories      (user_id, start_date desc);
create index if not exists wishlist_user_created_idx on public.wishlist_items (user_id, created_at desc);
create index if not exists city_pins_user_created_idx on public.city_pins    (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row level security
--
-- Every table is readable and writable only by the user who owns the row.
-- This is what makes it safe to ship the anon key in the browser bundle.
-- ---------------------------------------------------------------------------

alter table public.profiles       enable row level security;
alter table public.memories       enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.city_pins      enable row level security;

drop policy if exists "profiles are self-service" on public.profiles;
create policy "profiles are self-service" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "memories are private" on public.memories;
create policy "memories are private" on public.memories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "wishlist is private" on public.wishlist_items;
create policy "wishlist is private" on public.wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "city pins are private" on public.city_pins;
create policy "city pins are private" on public.city_pins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Profile bootstrap
--
-- Supabase writes signup form fields into raw_user_meta_data. Mirror them
-- into profiles so the app has a profile row the moment a user confirms.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar, avatar_color, home_country_code)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'avatar_color', ''), '#2563eb'),
    coalesce(nullif(new.raw_user_meta_data ->> 'home_country_code', ''), 'US')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at honest on the tables that expose it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists memories_touch_updated_at on public.memories;
create trigger memories_touch_updated_at
  before update on public.memories
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Photo storage
--
-- The bucket is private. Files live under a folder named for the owner's
-- user id, and the policies below only ever let a user touch their own
-- folder. The app reads photos through short-lived signed URLs.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-photos',
  'memory-photos',
  false,
  10485760, -- 10 MB ceiling; the client downscales well below this
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Supabase ships storage.objects with row level security already on, which is
-- what makes the policies below bite. Assert it rather than assume it — but
-- tolerate not owning the table, since storage.objects belongs to
-- supabase_storage_admin and the SQL editor may not be able to alter it.
do $$
begin
  execute 'alter table storage.objects enable row level security';
exception
  when insufficient_privilege or wrong_object_type then
    raise notice 'Could not alter storage.objects; relying on Supabase''s default (RLS on).';
end;
$$;

drop policy if exists "own photos readable"   on storage.objects;
drop policy if exists "own photos writable"   on storage.objects;
drop policy if exists "own photos updatable"  on storage.objects;
drop policy if exists "own photos deletable"  on storage.objects;

create policy "own photos readable" on storage.objects
  for select using (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own photos writable" on storage.objects
  for insert with check (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own photos updatable" on storage.objects
  for update using (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own photos deletable" on storage.objects
  for delete using (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
