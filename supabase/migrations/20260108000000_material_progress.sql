-- Adds per-student reading progress for the "Learning Materials" feature.
--
-- Course learning materials live as Markdown files in content/course-materials
-- and are served through authenticated API routes that first verify the student
-- is registered for the course. This table only stores completion state, keyed
-- by user + course + lesson, so a student can only ever read or write their own
-- rows (enforced by Row Level Security below).
--
-- Run after 20260107000000_course_price.sql.

create table if not exists public.material_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null references public.courses (id) on delete cascade,
  lesson_id text not null,
  status text not null default 'completed'
    check (status in ('in-progress', 'completed')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, lesson_id)
);

create index if not exists material_progress_user_course_idx
  on public.material_progress (user_id, course_id);

-- Row level security --------------------------------------------------------

alter table public.material_progress enable row level security;

drop policy if exists "own material progress select" on public.material_progress;
create policy "own material progress select"
  on public.material_progress for select
  using ((select auth.uid()) = user_id);

drop policy if exists "own material progress insert" on public.material_progress;
create policy "own material progress insert"
  on public.material_progress for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "own material progress update" on public.material_progress;
create policy "own material progress update"
  on public.material_progress for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own material progress delete" on public.material_progress;
create policy "own material progress delete"
  on public.material_progress for delete
  using ((select auth.uid()) = user_id);

-- Grants --------------------------------------------------------------------

grant select, insert, update, delete on public.material_progress to authenticated;
