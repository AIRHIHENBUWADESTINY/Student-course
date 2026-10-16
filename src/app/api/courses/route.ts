import { NextResponse } from "next/server";
import { createSupabaseClient, getAuthContext } from "@/lib/supabase/server";
import { createCourse, listCourses } from "@/lib/server/db";
import { parseCourseInput } from "@/lib/server/courses";
import { serverError, unauthorized } from "@/lib/server/auth";
import type { CourseInput } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const supabase = auth?.supabase ?? createSupabaseClient();
    return NextResponse.json(await listCourses(supabase));
  } catch (cause) {
    return serverError(cause, "Failed to load courses");
  }
}

export async function POST(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseCourseInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 422 });
  }

  try {
    const course = await createCourse(
      auth.supabase,
      auth.userId,
      parsed.value as CourseInput
    );
    return NextResponse.json(course, { status: 201 });
  } catch (cause) {
    return serverError(cause, "Failed to create course");
  }
}
