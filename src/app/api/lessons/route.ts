import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { getCourseAccess, listLessons } from "@/lib/server/db";
import { serverError, unauthorized } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  try {
    const [lessons, access] = await Promise.all([
      listLessons(auth.supabase),
      getCourseAccess(auth.supabase, auth.userId),
    ]);

    // Lesson metadata (titles, summaries) stays visible so the catalogue can
    // advertise courses, but the body is only sent for courses the user has
    // registered for or owns.
    const payload = lessons.map((lesson) =>
      access.all || access.ids.has(lesson.courseId)
        ? lesson
        : { ...lesson, content: [] }
    );
    return NextResponse.json(payload);
  } catch (cause) {
    return serverError(cause, "Failed to load lessons");
  }
}
