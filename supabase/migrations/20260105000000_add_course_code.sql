-- Adds an optional course code (e.g. "SWE 201") to courses.
-- Run after 20260104000000_course_faculty_department.sql.
--
-- Catalog courses may leave this null; student-created courses can set it.

alter table public.courses
  add column if not exists course_code text;
