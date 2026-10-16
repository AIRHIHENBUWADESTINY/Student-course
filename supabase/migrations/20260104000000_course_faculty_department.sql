-- Adds academic grouping to courses: faculty and department.
-- Run after 20260103000000_user_courses.sql.
--
-- Catalog courses may leave these null; student-created courses set both.

alter table public.courses
  add column if not exists faculty text,
  add column if not exists department text;

create index if not exists courses_faculty_department_idx
  on public.courses (faculty, department);
