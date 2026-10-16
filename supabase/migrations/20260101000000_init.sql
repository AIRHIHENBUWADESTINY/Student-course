-- LearnHub schema for Supabase.
-- Run this once in the Supabase SQL editor (or via the Supabase CLI).

create table if not exists public.courses (
  id text primary key,
  title text not null,
  description text not null,
  instructor text not null,
  category text not null,
  level text not null,
  accent text not null,
  icon text not null
);

create table if not exists public.lessons (
  id text primary key,
  course_id text not null references public.courses (id) on delete cascade,
  sort_order integer not null,
  title text not null,
  summary text not null,
  duration integer not null,
  content text[] not null default '{}'
);

create index if not exists lessons_course_id_idx
  on public.lessons (course_id, sort_order);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  bio text not null default '',
  goal text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email_notifications boolean not null default true,
  weekly_reminder boolean not null default false,
  weekly_goal integer not null default 5,
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.lessons (id) on delete cascade,
  status text not null check (status in ('in-progress', 'completed')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Row level security -------------------------------------------------------

alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.lesson_progress enable row level security;

drop policy if exists "courses are readable by everyone" on public.courses;
create policy "courses are readable by everyone"
  on public.courses for select
  using (true);

drop policy if exists "lessons are readable by everyone" on public.lessons;
create policy "lessons are readable by everyone"
  on public.lessons for select
  using (true);

drop policy if exists "own profile select" on public.profiles;
create policy "own profile select"
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "own settings select" on public.user_settings;
create policy "own settings select"
  on public.user_settings for select
  using ((select auth.uid()) = user_id);

drop policy if exists "own settings insert" on public.user_settings;
create policy "own settings insert"
  on public.user_settings for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "own settings update" on public.user_settings;
create policy "own settings update"
  on public.user_settings for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own progress select" on public.lesson_progress;
create policy "own progress select"
  on public.lesson_progress for select
  using ((select auth.uid()) = user_id);

drop policy if exists "own progress insert" on public.lesson_progress;
create policy "own progress insert"
  on public.lesson_progress for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "own progress update" on public.lesson_progress;
create policy "own progress update"
  on public.lesson_progress for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own progress delete" on public.lesson_progress;
create policy "own progress delete"
  on public.lesson_progress for delete
  using ((select auth.uid()) = user_id);

-- Grants -------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select on public.courses to anon, authenticated;
grant select on public.lessons to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.user_settings to authenticated;
grant select, insert, update, delete on public.lesson_progress to authenticated;

-- Create a profile and settings row for every new auth user -----------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, bio, goal)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    '',
    'Complete all six courses this semester'
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
