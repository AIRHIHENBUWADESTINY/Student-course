import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { getCourseAccess, getLessonSource } from "@/lib/server/db";
import {
  LessonFileNotFoundError,
  LessonStorageError,
  readLessonFile,
} from "@/lib/server/lesson-storage";
import { serverError, unauthorized } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

const NOT_REGISTERED =
  "You must register for this course before you can read its lessons.";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const { lessonId } = await params;

  try {
    const source = await getLessonSource(auth.supabase, lessonId);
    if (!source) {
      return NextResponse.json({ message: "Lesson not found" }, { status: 404 });
    }

    const { lesson, storagePath } = source;

    // Server-side authorization: the body is only released to students enrolled
    // in (or owning) the course, or to administrators.
    const access = await getCourseAccess(auth.supabase, auth.userId);
    if (!access.all && !access.ids.has(lesson.courseId)) {
      return NextResponse.json({ message: NOT_REGISTERED }, { status: 403 });
    }

    if (!storagePath) {
      return NextResponse.json({ ...lesson, source: "inline" });
    }

    // Stream the .txt body from private Storage using the caller's token so
    // Storage RLS is enforced as well.
    try {
      const text = await readLessonFile(auth.supabase, storagePath);
      return NextResponse.json({ ...lesson, text, source: "storage" });
    } catch (cause) {
      if (cause instanceof LessonFileNotFoundError) {
        return NextResponse.json(
          { message: "This lesson's file could not be found in storage." },
          { status: 404 }
        );
      }
      if (cause instanceof LessonStorageError) {
        return NextResponse.json({ message: cause.message }, { status: 502 });
      }
      throw cause;
    }
  } catch (cause) {
    return serverError(cause, "Failed to load lesson");
  }
}
