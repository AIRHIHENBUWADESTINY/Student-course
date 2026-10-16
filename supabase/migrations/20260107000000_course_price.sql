-- Adds the course list price (in naira) shown alongside credit units.
-- Run after 20260106000000_course_registration.sql.

alter table public.courses
  add column if not exists price integer not null default 0 check (price >= 0);
