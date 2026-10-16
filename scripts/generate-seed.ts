// Generates supabase/seed.sql from the course catalog in src/lib/data.ts.
// Run with: node scripts/generate-seed.ts
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { courses } from "../src/lib/data.ts";

function sqlText(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

const courseValues = courses
  .map((course) =>
    `  (${[
      sqlText(course.id),
      sqlText(course.title),
      sqlText(course.description),
      sqlText(course.instructor),
      sqlText(course.category),
      sqlText(course.level),
      sqlText(course.accent),
      sqlText(course.icon),
      String(course.price ?? 0),
    ].join(", ")})`
  )
  .join(",\n");

const lessonValues = courses
  .flatMap((course) => course.lessons)
  .map(
    (lesson) =>
      `  (${[
        sqlText(lesson.id),
        sqlText(lesson.courseId),
        String(lesson.order),
        sqlText(lesson.title),
        sqlText(lesson.summary),
        String(lesson.duration),
        `array[${lesson.content.map(sqlText).join(", ")}]::text[]`,
      ].join(", ")})`
  )
  .join(",\n");

const sql = `-- Generated from src/lib/data.ts. Do not edit by hand.
-- Run after 20260107000000_course_price.sql.

insert into public.courses (id, title, description, instructor, category, level, accent, icon, price)
values
${courseValues}
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  instructor = excluded.instructor,
  category = excluded.category,
  level = excluded.level,
  accent = excluded.accent,
  icon = excluded.icon,
  price = excluded.price;

insert into public.lessons (id, course_id, sort_order, title, summary, duration, content)
values
${lessonValues}
on conflict (id) do update set
  course_id = excluded.course_id,
  sort_order = excluded.sort_order,
  title = excluded.title,
  summary = excluded.summary,
  duration = excluded.duration,
  content = excluded.content;
`;

const outputPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "supabase",
  "seed.sql"
);

writeFileSync(outputPath, sql, "utf8");
console.log(`Wrote ${outputPath} (${courses.length} courses, ${courses.reduce(
  (sum, course) => sum + course.lessons.length,
  0
)} lessons)`);
