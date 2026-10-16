-- Per-student course ownership and editable course metadata.
-- Run after 20260101000000_init.sql and 20260102000000_add_date_of_birth.sql.
--
-- Catalog courses keep owner_id = null and stay world-readable. Courses created
-- by a student get owner_id = auth.uid() and are only visible/editable by them.

alter table public.courses
  add column if not exists owner_id uuid references auth.users (id) on delete cascade,
  add column if not exists image_url text,
  add column if not exists total_lessons integer,
  add column if not exists start_date date,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Student-created courses do not provide level/accent/icon, so give defaults.
alter table public.courses alter column level set default 'Beginner';
alter table public.courses alter column accent set default 'indigo';
alter table public.courses alter column icon set default 'code';

alter table public.courses
  drop constraint if exists courses_total_lessons_check;
alter table public.courses
  add constraint courses_total_lessons_check
  check (total_lessons is null or total_lessons between 0 and 1000);

create index if not exists courses_owner_id_idx on public.courses (owner_id);

-- Ownership-aware row level security ---------------------------------------

drop policy if exists "courses are readable by everyone" on public.courses;

drop policy if exists "courses are readable by catalog or owner" on public.courses;
create policy "courses are readable by catalog or owner"
  on public.courses for select
  using (owner_id is null or (select auth.uid()) = owner_id);

drop policy if exists "owners can insert courses" on public.courses;
create policy "owners can insert courses"
  on public.courses for insert
  with check ((select auth.uid()) = owner_id);

drop policy if exists "owners can update courses" on public.courses;
create policy "owners can update courses"
  on public.courses for update
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "owners can delete courses" on public.courses;
create policy "owners can delete courses"
  on public.courses for delete
  using ((select auth.uid()) = owner_id);

-- Grants -------------------------------------------------------------------

grant insert, update, delete on public.courses to authenticated;
