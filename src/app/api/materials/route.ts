import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { listMaterialProgress, listRegistrations } from "@/lib/server/db";
import { loadCourseMaterial } from "@/lib/server/materials";
import { serverError, unauthorized } from "@/lib/server/auth";
import type { MaterialCourseSummary } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  try {
    const registrations = await listRegistrations(auth.supabase, auth.userId);
    const progress = await listMaterialProgress(auth.supabase, auth.userId);

    const seen = new Set<string>();
    const courses: MaterialCourseSummary[] = [];

    for (const registration of registrations) {
      const courseId = registration.courseId;
      if (seen.has(courseId)) continue;
      seen.add(courseId);

      const material = await loadCourseMaterial(
        courseId,
        registration.course
          ? {
              title: registration.course.title,
              department: registration.course.department,
              category: registration.course.category,
              description: registration.course.description,
            }
          : undefined
      );
      const lessonCount = material?.lessons.length ?? 0;
      const courseProgress = progress[courseId] ?? {};
      const completedCount = Object.values(courseProgress).filter(
        (status) => status === "completed"
      ).length;

      courses.push({
        courseId,
        title: registration.course?.title ?? material?.title ?? courseId,
        category: registration.course?.category ?? "General",
        department:
          registration.course?.department ?? material?.department ?? null,
        level: registration.course?.level ?? "",
        lessonCount,
        completedCount,
        percent:
          lessonCount > 0
            ? Math.round((completedCount / lessonCount) * 100)
            : 0,
        available: Boolean(material),
      });
    }

    courses.sort((a, b) => a.title.localeCompare(b.title));
    return NextResponse.json(courses);
  } catch (cause) {
    return serverError(cause, "Failed to load learning materials");
  }
}
