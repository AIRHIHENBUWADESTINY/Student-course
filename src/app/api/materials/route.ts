import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { listMaterialProgress, listRegistrations } from "@/lib/server/db";
import { getMaterialSummary } from "@/lib/server/materials";
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

      const manifest = getMaterialSummary(courseId);
      const lessonCount = manifest?.lessons.length ?? 0;
      const courseProgress = progress[courseId] ?? {};
      const completedCount = Object.values(courseProgress).filter(
        (status) => status === "completed"
      ).length;

      courses.push({
        courseId,
        title: registration.course?.title ?? manifest?.title ?? courseId,
        category: registration.course?.category ?? "General",
        department: registration.course?.department ?? manifest?.department ?? null,
        level: registration.course?.level ?? "",
        lessonCount,
        completedCount,
        percent:
          lessonCount > 0
            ? Math.round((completedCount / lessonCount) * 100)
            : 0,
        available: Boolean(manifest),
      });
    }

    courses.sort((a, b) => a.title.localeCompare(b.title));
    return NextResponse.json(courses);
  } catch (cause) {
    return serverError(cause, "Failed to load learning materials");
  }
}
