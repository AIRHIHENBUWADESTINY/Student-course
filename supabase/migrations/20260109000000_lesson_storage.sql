-- Stores each lesson body as a plain-text (.txt) file in a private Supabase
-- Storage bucket instead of (or in addition to) the inline `content` array.
--
-- * `lessons.storage_path` points at the object inside the private bucket.
-- * Objects are laid out as "<course_id>/<file>.txt" so the Storage policy can
--   map a file back to its course and only allow enrolled students, the course
--   owner, or an administrator to read it.
-- * The bucket is private; content is streamed through the authenticated
--   /api/lessons/[lessonId] route which also verifies enrollment server-side.
--
-- Run after 20260108000000_material_progress.sql.

-- Lesson file pointer -------------------------------------------------------

alter table public.lessons
  add column if not exists storage_path text;

-- Private bucket ------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('course-lessons', 'course-lessons', false)
on conflict (id) do nothing;

-- Row level security on storage.objects -------------------------------------
-- A file is readable by a student registered for the course named by the first
-- path segment, by the course owner, or by an administrator. Writes are limited
-- to the course owner and administrators.

drop policy if exists "lesson files readable by enrolled students" on storage.objects;
create policy "lesson files readable by enrolled students"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'course-lessons'
    and (
      public.is_admin((select auth.uid()))
      or exists (
        select 1 from public.courses c
        where c.id = split_part(name, '/', 1)
          and c.owner_id = (select auth.uid())
      )
      or exists (
        select 1 from public.registrations r
        where r.user_id = (select auth.uid())
          and r.course_id = split_part(name, '/', 1)
      )
    )
  );

drop policy if exists "lesson files writable by course owners" on storage.objects;
create policy "lesson files writable by course owners"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'course-lessons'
    and (
      public.is_admin((select auth.uid()))
      or exists (
        select 1 from public.courses c
        where c.id = split_part(name, '/', 1)
          and c.owner_id = (select auth.uid())
      )
    )
  );

drop policy if exists "lesson files updatable by course owners" on storage.objects;
create policy "lesson files updatable by course owners"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'course-lessons'
    and (
      public.is_admin((select auth.uid()))
      or exists (
        select 1 from public.courses c
        where c.id = split_part(name, '/', 1)
          and c.owner_id = (select auth.uid())
      )
    )
  )
  with check (
    bucket_id = 'course-lessons'
    and (
      public.is_admin((select auth.uid()))
      or exists (
        select 1 from public.courses c
        where c.id = split_part(name, '/', 1)
          and c.owner_id = (select auth.uid())
      )
    )
  );

drop policy if exists "lesson files removable by course owners" on storage.objects;
create policy "lesson files removable by course owners"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'course-lessons'
    and (
      public.is_admin((select auth.uid()))
      or exists (
        select 1 from public.courses c
        where c.id = split_part(name, '/', 1)
          and c.owner_id = (select auth.uid())
      )
    )
  );
