import { NextResponse } from "next/server";
import { createSupabaseClient, getAuthContext } from "@/lib/supabase/server";
import { deleteCourse, getCourseById, updateCourse } from "@/lib/server/db";
import { parseCourseInput } from "@/lib/server/courses";
import { serverError, unauthorized } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  try {
    const auth = await getAuthContext(request);
    const supabase = auth?.supabase ?? createSupabaseClient();
    const course = await getCourseById(supabase, courseId);
    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }
    // Lesson bodies are only served through the registration-gated endpoints.
    return NextResponse.json({
      ...course,
      lessons: course.lessons.map((lesson) => ({ ...lesson, content: [] })),
    });
  } catch (cause) {
    return serverError(cause, "Failed to load course");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const { courseId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseCourseInput(body, { partial: true });
  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 422 });
  }

  try {
    const course = await updateCourse(
      auth.supabase,
      auth.userId,
      courseId,
      parsed.value
    );
    if (!course) {
      return NextResponse.json(
        { message: "Course not found or you do not have permission to edit it" },
        { status: 404 }
      );
    }
    return NextResponse.json(course);
  } catch (cause) {
    return serverError(cause, "Failed to update course");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const { courseId } = await params;

  try {
    const removed = await deleteCourse(auth.supabase, auth.userId, courseId);
    if (!removed) {
      return NextResponse.json(
        { message: "Course not found or you do not have permission to delete it" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (cause) {
    return serverError(cause, "Failed to delete course");
  }
}
