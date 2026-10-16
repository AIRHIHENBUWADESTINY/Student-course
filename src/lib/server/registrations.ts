import { SEMESTERS } from "@/lib/academics";
import type { Semester } from "@/types";

export interface RegistrationInput {
  courseId: string;
  session?: string;
  semester?: Semester;
}

export type RegistrationParseResult =
  | { ok: true; value: RegistrationInput }
  | { ok: false; message: string };

const MAX_SESSION = 32;

/** Validates and normalises a registration request body. */
export function parseRegistrationInput(
  raw: unknown
): RegistrationParseResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, message: "Invalid request body" };
  }
  const body = raw as Record<string, unknown>;

  const courseId =
    typeof body.courseId === "string" ? body.courseId.trim() : "";
  if (!courseId) {
    return { ok: false, message: "courseId is required" };
  }

  const value: RegistrationInput = { courseId };

  if (body.session !== undefined) {
    const session = typeof body.session === "string" ? body.session.trim() : "";
    if (!session) return { ok: false, message: "Invalid session" };
    if (session.length > MAX_SESSION) {
      return { ok: false, message: "Invalid session" };
    }
    value.session = session;
  }

  if (body.semester !== undefined) {
    const semester =
      typeof body.semester === "string" ? body.semester.trim() : "";
    if (!SEMESTERS.includes(semester as Semester)) {
      return { ok: false, message: "Invalid semester" };
    }
    value.semester = semester as Semester;
  }

  return { ok: true, value };
}

/** Reads a session/semester pair from URL query parameters. */
export function parseRegistrationQuery(url: string): {
  session?: string;
  semester?: Semester;
} {
  const params = new URL(url).searchParams;
  const session = params.get("session")?.trim() || undefined;
  const semesterParam = params.get("semester")?.trim() ?? "";
  const semester = SEMESTERS.includes(semesterParam as Semester)
    ? (semesterParam as Semester)
    : undefined;
  return { session, semester };
}
