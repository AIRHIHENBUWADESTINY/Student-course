import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { getLessonById, setLessonStatus } from "@/lib/server/db";
import { unauthorized, serverError } from "@/lib/server/auth";
import type { LessonStatus } from "@/types";

const VALID_STATUSES: LessonStatus[] = [
  "not-started",
  "in-progress",
  "completed",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const { lessonId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const status = (body as { status?: unknown })?.status;
  if (
    typeof status !== "string" ||
    !VALID_STATUSES.includes(status as LessonStatus)
  ) {
    return NextResponse.json(
      { message: "status must be one of: not-started, in-progress, completed" },
      { status: 422 }
    );
  }

  try {
    if (!(await getLessonById(auth.supabase, lessonId))) {
      return NextResponse.json({ message: "Lesson not found" }, { status: 404 });
    }
    return NextResponse.json(
      await setLessonStatus(
        auth.supabase,
        auth.userId,
        lessonId,
        status as LessonStatus
      )
    );
  } catch (cause) {
    return serverError(cause, "Failed to update progress");
  }
}
