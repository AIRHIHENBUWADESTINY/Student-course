import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { getCourseAccess, getCourseById } from "@/lib/server/db";
import { serverError, unauthorized } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

const NOT_REGISTERED =
  "You must register for this course before you can read its lessons.";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const { courseId } = await params;

  try {
    const course = await getCourseById(auth.supabase, courseId);
    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    const access = await getCourseAccess(auth.supabase, auth.userId);
    if (!access.all && !access.ids.has(courseId)) {
      return NextResponse.json({ message: NOT_REGISTERED }, { status: 403 });
    }

    return NextResponse.json(course.lessons);
  } catch (cause) {
    return serverError(cause, "Failed to load lessons");
  }
}
