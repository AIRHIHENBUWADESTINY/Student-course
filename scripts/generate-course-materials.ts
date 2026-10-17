// Generates the self-study learning materials that power the
// "Read course material" feature.
//
// Source:  public/Materials.txt  (flat catalogue: Category -> note -> courses)
// Output:
//   content/course-materials/<department-slug>/<course-slug>.md
//   content/course-materials/index.json   (manifest: course id -> file + lessons)
//
// Run with: npm run seed:materials  (or: node scripts/generate-course-materials.ts)
//
// The materials are original, beginner-friendly study guides derived from the
// course catalogue descriptions. They are supplementary study notes, not an
// official curriculum or accreditation.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  composeCourseMaterial,
  slugify,
} from "../src/lib/material-builder.ts";

const FACULTY = "Faculty of Technology";
const LEVEL = "100L";

interface CatalogueCourse {
  category: string;
  note: string;
  title: string;
  description: string;
}

const NUMBERED = /^(\d+)\.\s+(.+?)\s*$/;

/**
 * Parses the flat catalogue into ordered courses. A numbered line followed by
 * "Category note:" starts a category; every other numbered line starts a course
 * whose description continues until the next numbered line.
 */
function parseCatalogue(text: string): CatalogueCourse[] {
  const lines = text.split(/\r?\n/);
  const courses: CatalogueCourse[] = [];
  let category = "";
  let note = "";

  let i = 0;
  while (i < lines.length) {
    const match = NUMBERED.exec(lines[i].trim());
    if (!match) {
      i += 1;
      continue;
    }

    const title = match[2].trim();
    let next = i + 1;
    while (next < lines.length && lines[next].trim() === "") next += 1;
    const nextLine = next < lines.length ? lines[next].trim() : "";

    if (/^category note:/i.test(nextLine)) {
      category = title;
      note = nextLine.replace(/^category note:\s*/i, "").trim();
      i = next + 1;
      continue;
    }

    const parts: string[] = [];
    let k = i + 1;
    while (k < lines.length) {
      const current = lines[k].trim();
      if (current === "" || /^course descriptions below/i.test(current)) {
        k += 1;
        continue;
      }
      if (NUMBERED.test(current)) break;
      parts.push(current);
      k += 1;
    }

    const description = parts.join(" ").trim();
    if (description) courses.push({ category, note, title, description });
    i = k;
  }

  return courses;
}

// ---------------------------------------------------------------------------

const rootDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const sourcePath = path.join(rootDir, "public", "Materials.txt");
const outDir = path.join(rootDir, "content", "course-materials");

const catalogue = parseCatalogue(readFileSync(sourcePath, "utf8"));
if (catalogue.length === 0) {
  throw new Error(`No courses found in ${sourcePath}`);
}

mkdirSync(outDir, { recursive: true });

const manifestCourses: Record<
  string,
  { file: string; title: string; department: string; lessons: { id: string; title: string }[] }
> = {};

const written = new Set<string>();
for (const course of catalogue) {
  const composed = composeCourseMaterial(
    {
      title: course.title,
      department: course.category,
      note: course.note,
      description: course.description,
    },
    { faculty: FACULTY, level: LEVEL }
  );

  const id = slugify(`${FACULTY}-${course.category}-${LEVEL}-${course.title}`);
  const file = `${slugify(course.category)}/${slugify(course.title)}.md`;
  const filePath = path.join(outDir, file);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, composed.markdown, "utf8");
  written.add(file);

  manifestCourses[id] = {
    file,
    title: course.title,
    department: course.category,
    lessons: composed.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
    })),
  };
}

const manifest = {
  faculty: FACULTY,
  level: LEVEL,
  generatedAt: new Date().toISOString(),
  courses: manifestCourses,
};

writeFileSync(
  path.join(outDir, "index.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8"
);

console.log(
  `Wrote ${Object.keys(manifestCourses).length} course material files (${written.size} unique files) + index.json from ${path.relative(
    rootDir,
    sourcePath
  )}`
);
