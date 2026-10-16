-- Adds the school course-registration domain:
--   * academic metadata on courses (semester, credit units, type, status)
--   * academic profile fields for students (matric number, faculty, etc.)
--   * course registrations (a student's registration basket)
--   * portal settings controlling the registration window
--   * administrator-managed departments
-- Run after 20260105000000_add_course_code.sql.

-- Courses -------------------------------------------------------------------

alter table public.courses
  add column if not exists semester text not null default 'First Semester',
  add column if not exists credit_units integer not null default 3,
  add column if not exists course_type text not null default 'Core',
  add column if not exists registration_status text not null default 'Available';

-- Student academic profile --------------------------------------------------

alter table public.profiles
  add column if not exists matric_number text,
  add column if not exists faculty text,
  add column if not exists department text,
  add column if not exists level text,
  add column if not exists session text,
  add column if not exists role text not null default 'student';

-- Registrations -------------------------------------------------------------

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null references public.courses (id) on delete cascade,
  session text not null,
  semester text not null,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id, session, semester)
);

create index if not exists registrations_user_idx
  on public.registrations (user_id, session, semester);

create index if not exists registrations_course_idx
  on public.registrations (course_id);

-- Portal settings (single row) ----------------------------------------------

create table if not exists public.portal_settings (
  id text primary key default 'default',
  registration_open boolean not null default true,
  session text not null default '2026/2027',
  deadline timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.portal_settings (id)
values ('default')
on conflict (id) do nothing;

-- Departments (administrator managed) ---------------------------------------

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  faculty text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (faculty, name)
);

-- Helper used by RLS policies. SECURITY DEFINER avoids recursive policy checks
-- when policies on other tables need to know whether the caller is an admin.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

-- Row level security --------------------------------------------------------

alter table public.registrations enable row level security;
alter table public.portal_settings enable row level security;
alter table public.departments enable row level security;

-- Students manage their own registrations.
drop policy if exists "own registrations select" on public.registrations;
create policy "own registrations select"
  on public.registrations for select
  using ((select auth.uid()) = user_id or public.is_admin((select auth.uid())));

drop policy if exists "own registrations insert" on public.registrations;
create policy "own registrations insert"
  on public.registrations for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "own registrations update" on public.registrations;
create policy "own registrations update"
  on public.registrations for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own registrations delete" on public.registrations;
create policy "own registrations delete"
  on public.registrations for delete
  using ((select auth.uid()) = user_id);

-- Portal settings are readable by any signed-in user, editable by admins.
drop policy if exists "portal settings select" on public.portal_settings;
create policy "portal settings select"
  on public.portal_settings for select
  using (true);

drop policy if exists "portal settings admin update" on public.portal_settings;
create policy "portal settings admin update"
  on public.portal_settings for update
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

-- Departments are readable by everyone, managed by admins.
drop policy if exists "departments select" on public.departments;
create policy "departments select"
  on public.departments for select
  using (true);

drop policy if exists "departments admin insert" on public.departments;
create policy "departments admin insert"
  on public.departments for insert
  with check (public.is_admin((select auth.uid())));

drop policy if exists "departments admin update" on public.departments;
create policy "departments admin update"
  on public.departments for update
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

drop policy if exists "departments admin delete" on public.departments;
create policy "departments admin delete"
  on public.departments for delete
  using (public.is_admin((select auth.uid())));

-- Administrators can read every profile (for the student roster).
drop policy if exists "admin read profiles" on public.profiles;
create policy "admin read profiles"
  on public.profiles for select
  using (public.is_admin((select auth.uid())));

-- Grants --------------------------------------------------------------------

grant select, insert, update, delete on public.registrations to authenticated;
grant select, update on public.portal_settings to authenticated;
grant select, insert, update, delete on public.departments to authenticated;
grant update on public.profiles to authenticated;

-- The registration window and department list are read with the anonymous key
-- (the portal endpoint is public so the catalogue can show the open/closed state).
grant select on public.portal_settings to anon;
grant select on public.departments to anon;
