import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import {
  getCourseById,
  getMaterialProgress,
  hasRegistration,
  setMaterialLessonStatus,
} from "@/lib/server/db";
import { loadCourseMaterial } from "@/lib/server/materials";
import { serverError, unauthorized } from "@/lib/server/auth";
import type { MaterialDetail } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NOT_REGISTERED =
  "You must register for this course before you can read its learning materials.";
const NO_MATERIAL =
  "Learning materials are not available for this course yet.";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const { courseId } = await params;

  try {
    if (!(await hasRegistration(auth.supabase, auth.userId, courseId))) {
      return NextResponse.json({ message: NOT_REGISTERED }, { status: 403 });
    }

    const course = await getCourseById(auth.supabase, courseId);
    const material = await loadCourseMaterial(
      courseId,
      course
        ? {
            title: course.title,
            department: course.department,
            category: course.category,
            description: course.description,
          }
        : undefined
    );
    if (!material) {
      return NextResponse.json({ message: NO_MATERIAL }, { status: 404 });
    }

    const progress = await getMaterialProgress(
      auth.supabase,
      auth.userId,
      courseId
    );

    const payload: MaterialDetail = {
      courseId,
      title: course?.title ?? material.title,
      category: course?.category ?? "General",
      department: material.department,
      level: course?.level ?? "",
      overview: material.overview,
      lessons: material.lessons,
      progress,
    };
    return NextResponse.json(payload);
  } catch (cause) {
    return serverError(cause, "Failed to load course materials");
  }
}

export async function PATCH(
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

  const lessonId = (body as { lessonId?: unknown })?.lessonId;
  const completed = (body as { completed?: unknown })?.completed;
  if (typeof lessonId !== "string" || !lessonId || typeof completed !== "boolean") {
    return NextResponse.json(
      { message: "lessonId (string) and completed (boolean) are required" },
      { status: 422 }
    );
  }

  try {
    if (!(await hasRegistration(auth.supabase, auth.userId, courseId))) {
      return NextResponse.json({ message: NOT_REGISTERED }, { status: 403 });
    }

    const course = await getCourseById(auth.supabase, courseId);
    const material = await loadCourseMaterial(
      courseId,
      course
        ? {
            title: course.title,
            department: course.department,
            category: course.category,
            description: course.description,
          }
        : undefined
    );
    if (!material) {
      return NextResponse.json({ message: NO_MATERIAL }, { status: 404 });
    }
    if (!material.lessons.some((lesson) => lesson.id === lessonId)) {
      return NextResponse.json({ message: "Lesson not found" }, { status: 404 });
    }

    await setMaterialLessonStatus(
      auth.supabase,
      auth.userId,
      courseId,
      lessonId,
      completed
    );

    return NextResponse.json(
      await getMaterialProgress(auth.supabase, auth.userId, courseId)
    );
  } catch (cause) {
    return serverError(cause, "Failed to update material progress");
  }
}
