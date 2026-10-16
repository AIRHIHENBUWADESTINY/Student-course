import { NextResponse } from "next/server";
import { createSupabaseClient, getAuthContext } from "@/lib/supabase/server";
import { getCourseById } from "@/lib/server/db";
import { serverError } from "@/lib/server/auth";

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
    return NextResponse.json(course.lessons);
  } catch (cause) {
    return serverError(cause, "Failed to load lessons");
  }
}
