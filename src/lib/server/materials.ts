import { readFileSync } from "node:fs";
import path from "node:path";
import { parseMaterial } from "@/lib/materials";
import { buildMaterialFromDescription } from "@/lib/material-builder";
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

/** Remote catalogue used to build readable material when no local file exists. */
const REMOTE_MATERIALS_URL =
  process.env.MATERIALS_SOURCE_URL ??
  "https://odtublniztipvdantfpa.supabase.co/storage/v1/object/sign/Learning%20materials/Materials.txt?token=eyJraWQiOiIzN2VmMWNkNC05OTNhLTQ2NjctYWRjMi05ZDdlNDY1YjI2YmYiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJMZWFybmluZyBtYXRlcmlhbHMvTWF0ZXJpYWxzLnR4dCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTIyMTU5OTIsImV4cCI6MTgyMzc1MTk5Mn0.ahrKRusV4HcKXCGbhKAWSt8W9aygA-LgkYaO16ko22LHR-BTa-g39yqczoB5SUpgClb3GhBD7y7pOSEU0yyJEQ";

const REMOTE_CACHE_TTL_MS = 10 * 60 * 1000;

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

/** Reads a course's committed Markdown material file, if it exists. */
function loadLocalMaterial(courseId: string): LoadedMaterial | null {
  const entry = getMaterialEntry(courseId);
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

export interface MaterialContext {
  title: string;
  department?: string | null;
  category?: string | null;
  description?: string | null;
}

interface CatalogueEntry {
  category: string;
  title: string;
  description: string;
  note: string;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const NUMBERED = /^(\d+)\.\s+(.+?)\s*$/;

/**
 * Parses the flat catalogue ("N. Category / Category note / N. Course /
 * description") into a map keyed by the normalised course title.
 */
export function parseCatalogue(text: string): Map<string, CatalogueEntry> {
  const lines = text.split(/\r?\n/);
  const entries = new Map<string, CatalogueEntry>();
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
    let nextIndex = i + 1;
    while (nextIndex < lines.length && lines[nextIndex].trim() === "") {
      nextIndex += 1;
    }
    const nextLine =
      nextIndex < lines.length ? lines[nextIndex].trim() : "";

    if (/^category note:/i.test(nextLine)) {
      category = title;
      note = nextLine.replace(/^category note:\s*/i, "").trim();
      i = nextIndex + 1;
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
    if (description) {
      const entry: CatalogueEntry = { category, title, description, note };
      const bareKey = normalize(title);
      if (!entries.has(bareKey)) entries.set(bareKey, entry);
      if (category) entries.set(normalize(`${category} ${title}`), entry);
    }
    i = k;
  }

  return entries;
}

let catalogueCache: { at: number; entries: Map<string, CatalogueEntry> } | null =
  null;
let cataloguePending: Promise<Map<string, CatalogueEntry>> | null = null;

/** Local catalogue shipped with the app (public/Materials.txt). */
const LOCAL_MATERIALS_FILE = path.join(
  process.cwd(),
  "public",
  "Materials.txt"
);

let localCatalogueCache: Map<string, CatalogueEntry> | null = null;

function loadLocalCatalogue(): Map<string, CatalogueEntry> | null {
  if (localCatalogueCache) return localCatalogueCache;
  try {
    localCatalogueCache = parseCatalogue(
      readFileSync(LOCAL_MATERIALS_FILE, "utf8")
    );
    return localCatalogueCache;
  } catch {
    return null;
  }
}

async function loadRemoteCatalogue(): Promise<Map<string, CatalogueEntry>> {
  if (catalogueCache && Date.now() - catalogueCache.at < REMOTE_CACHE_TTL_MS) {
    return catalogueCache.entries;
  }
  if (!cataloguePending) {
    cataloguePending = (async () => {
      const response = await fetch(REMOTE_MATERIALS_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Material source responded with ${response.status}`);
      }
      const entries = parseCatalogue(await response.text());
      catalogueCache = { at: Date.now(), entries };
      return entries;
    })().finally(() => {
      cataloguePending = null;
    });
  }
  return cataloguePending;
}

function lookupCatalogue(
  catalogue: Map<string, CatalogueEntry>,
  context: MaterialContext
): CatalogueEntry | null {
  const area = context.category ?? context.department ?? "";
  return (
    (area ? catalogue.get(normalize(`${area} ${context.title}`)) : null) ??
    catalogue.get(normalize(context.title)) ??
    null
  );
}

/**
 * Builds readable material from the local catalogue (public/Materials.txt),
 * falling back to the remote catalogue, and finally the course row itself.
 */
async function loadCatalogueMaterial(
  context: MaterialContext
): Promise<LoadedMaterial | null> {
  let entry: CatalogueEntry | null = null;
  const local = loadLocalCatalogue();
  if (local) {
    entry = lookupCatalogue(local, context);
  } else {
    try {
      entry = lookupCatalogue(await loadRemoteCatalogue(), context);
    } catch {
      entry = null;
    }
  }

  const description = (entry?.description ?? context.description ?? "").trim();
  const note = entry?.note ?? "";
  if (!description && !note) return null;

  const department =
    entry?.category ?? context.department ?? context.category ?? "General";

  const built = buildMaterialFromDescription({
    title: context.title,
    department,
    note,
    description,
  });

  return {
    title: context.title,
    department,
    overview: built.overview,
    lessons: built.lessons,
  };
}

/**
 * Resolves a course's readable material. Prefers the committed local file and
 * falls back to building content from the remote catalogue / course row, so
 * every registered course stays readable.
 */
export async function loadCourseMaterial(
  courseId: string,
  context?: MaterialContext
): Promise<LoadedMaterial | null> {
  const local = loadLocalMaterial(courseId);
  if (local) return local;
  if (context?.title) return loadCatalogueMaterial(context);
  return null;
}
