import type { MaterialLesson } from "@/types";

/** URL/file-safe slug used for course folders, files and lesson ids. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface ParsedMaterial {
  overview: string;
  lessons: MaterialLesson[];
}

/**
 * Parses a generated course material file into a course overview and an ordered
 * list of lessons. Lessons are delimited by "## Lesson N: Title" headings; any
 * other `##` section that appears after the lessons (for example the course
 * summary) is appended to the final lesson so it stays in reading order.
 */
export function parseMaterial(markdown: string): {
  overview: string;
  lessons: MaterialLesson[];
} {
  const lines = markdown.split(/\r?\n/);
  const lessonHeading = /^##\s+Lesson\s+\d+:\s*(.+?)\s*$/i;
  const sectionHeading = /^##\s+(.+?)\s*$/;

  const overviewLines: string[] = [];
  const closingLines: string[] = [];
  const drafts: { title: string; lines: string[] }[] = [];

  let state: "pre" | "lesson" | "closing" = "pre";
  let current: { title: string; lines: string[] } | null = null;

  const flushLesson = () => {
    if (current) {
      drafts.push(current);
      current = null;
    }
  };

  for (const line of lines) {
    const lessonMatch = line.match(lessonHeading);
    if (lessonMatch) {
      flushLesson();
      current = { title: lessonMatch[1].trim(), lines: [] };
      state = "lesson";
      continue;
    }

    if (sectionHeading.test(line)) {
      if (state === "lesson") {
        flushLesson();
        state = "closing";
      }
      if (state === "closing") closingLines.push(line);
      else overviewLines.push(line);
      continue;
    }

    if (state === "lesson" && current) current.lines.push(line);
    else if (state === "closing") closingLines.push(line);
    else overviewLines.push(line);
  }
  flushLesson();

  const clean = (value: string) =>
    value.replace(/\n{3,}/g, "\n\n").trim();

  const overview = clean(
    overviewLines
      .filter((line) => !/^#\s+/.test(line) && !/^_.*_$/.test(line.trim()))
      .join("\n")
  );

  const closing = clean(closingLines.join("\n"));

  const lessons: MaterialLesson[] = drafts.map((draft, index) => {
    const id = `lesson-${index + 1}-${slugify(draft.title)}`;
    const body = clean(draft.lines.join("\n"));
    const content =
      index === drafts.length - 1 && closing ? `${body}\n\n${closing}` : body;
    return { id, title: draft.title, content };
  });

  return { overview, lessons };
}
