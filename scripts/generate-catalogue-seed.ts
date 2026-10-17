// Generates the optional demo catalogue supabase/seed_academic_catalogue.sql
// from the suggestions in src/lib/academics.ts.
// Run with: node scripts/generate-catalogue-seed.ts
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { COURSE_SUGGESTIONS, LEVEL_START_DATES } from "../src/lib/academics.ts";

function sqlText(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Every catalogue course is advertised at the beginner level. Ids and start
// dates still derive from the academic level so existing course references
// (registrations, lessons, material files) stay stable.
const CATALOGUE_LEVEL = "Beginner";

const rows = COURSE_SUGGESTIONS.map((course) => {
  const id = slug(
    `${course.faculty}-${course.department}-${course.level}-${course.title}`
  );
  const startDate = LEVEL_START_DATES[course.level];
  return `  (${[
    sqlText(id),
    sqlText(course.title),
    sqlText(course.description),
    "''",
    sqlText(course.category),
    sqlText(CATALOGUE_LEVEL),
    sqlText("indigo"),
    sqlText("code"),
    sqlText(course.faculty),
    sqlText(course.department),
    startDate ? sqlText(startDate) : "null",
    String(course.price),
  ].join(", ")})`;
}).join(",\n");

const sql = `-- OPTIONAL sample academic catalogue (demo data).
-- Generated from src/lib/academics.ts COURSE_SUGGESTIONS. Do not edit by hand.
-- Run after 20260107000000_course_price.sql.
--
-- These rows have owner_id = null, so they are world-readable catalog courses
-- that appear for every user as a demo catalogue. Skip this file if you do not
-- want the demo data in your database.
--
-- This is illustrative starter data, not an official curriculum.

insert into public.courses
  (id, title, description, instructor, category, level, accent, icon, faculty, department, start_date, price)
values
${rows}
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  instructor = excluded.instructor,
  category = excluded.category,
  level = excluded.level,
  accent = excluded.accent,
  icon = excluded.icon,
  faculty = excluded.faculty,
  department = excluded.department,
  start_date = excluded.start_date,
  price = excluded.price;
`;

const outputPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "supabase",
  "seed_academic_catalogue.sql"
);

writeFileSync(outputPath, sql, "utf8");
console.log(
  `Wrote ${outputPath} (${COURSE_SUGGESTIONS.length} catalogue courses)`
);
