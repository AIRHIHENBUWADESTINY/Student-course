import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Private bucket that holds lesson bodies as plain-text (.txt) objects. Objects
 * are laid out as "<course_id>/<file>.txt" so Storage RLS can map a file back
 * to its course. Override with the LESSON_STORAGE_BUCKET env var.
 */
export const LESSON_STORAGE_BUCKET =
  process.env.LESSON_STORAGE_BUCKET?.trim() || "course-lessons";

/** Raised when the lesson object is missing from the bucket. */
export class LessonFileNotFoundError extends Error {
  constructor(path: string) {
    super(`Lesson file "${path}" was not found in storage.`);
    this.name = "LessonFileNotFoundError";
  }
}

/** Raised when Storage rejects the request or is otherwise unreachable. */
export class LessonStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LessonStorageError";
  }
}

interface StorageErrorLike {
  message?: string;
  status?: number;
  statusCode?: string;
}

/**
 * Downloads a lesson .txt object using the caller's Supabase client so Storage
 * Row Level Security evaluates as that user. The bucket stays private; content
 * is only reachable through the authenticated lesson route.
 */
export async function readLessonFile(
  supabase: SupabaseClient,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(LESSON_STORAGE_BUCKET)
    .download(path);

  if (error) {
    const detail = error as StorageErrorLike;
    const message = detail.message ?? "Unable to read the lesson file.";
    const missing =
      detail.status === 404 ||
      detail.statusCode === "404" ||
      /not found/i.test(message);
    if (missing) throw new LessonFileNotFoundError(path);
    throw new LessonStorageError(message);
  }

  const text = await data.text();
  if (!text.trim()) {
    throw new LessonStorageError("The lesson file is empty.");
  }
  return text;
}
