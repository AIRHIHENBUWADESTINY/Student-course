import { readFileSync } from "node:fs";
import path from "node:path";
import { parseMaterial } from "@/lib/materials";
import type { MaterialLesson } from "@/types";

export interface MaterialManifestCourse {
  file: string;
  title: string;
  department: string;
  lessons: { id: string; title: string }[];
}

interface MaterialManifest {
  faculty: string;
  level: string;
  generatedAt: string;
  courses: Record<string, MaterialManifestCourse>;
}

export interface LoadedMaterial {
  title: string;
  department: string;
  overview: string;
  lessons: MaterialLesson[];
}

const MATERIALS_DIR = path.join(process.cwd(), "content", "course-materials");

let manifestCache: MaterialManifest | null = null;

function loadManifest(): MaterialManifest {
  if (!manifestCache) {
    const raw = readFileSync(path.join(MATERIALS_DIR, "index.json"), "utf8");
    manifestCache = JSON.parse(raw) as MaterialManifest;
  }
  return manifestCache;
}

/** Returns the manifest entry for a course, or null when none exists. */
export function getMaterialEntry(
  courseId: string
): MaterialManifestCourse | null {
  try {
    return loadManifest().courses[courseId] ?? null;
  } catch {
    return null;
  }
}

/**
 * Reads and parses a course's Markdown material. Returns null when the course
 * has no material file or the file cannot be read, so callers can respond with
 * a friendly "not available yet" message instead of crashing.
 */
export function loadCourseMaterial(courseId: string): LoadedMaterial | null {
  const entry = loadManifest().courses[courseId];
  if (!entry) return null;

  try {
    const raw = readFileSync(path.join(MATERIALS_DIR, entry.file), "utf8");
    const parsed = parseMaterial(raw);
    return {
      title: entry.title,
      department: entry.department,
      overview: parsed.overview,
      lessons: parsed.lessons,
    };
  } catch {
    return null;
  }
}
