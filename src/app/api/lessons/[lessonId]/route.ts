import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { getLessonById } from "@/lib/server/db";
import { serverError } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  try {
    const supabase = createSupabaseClient();
    const lesson = await getLessonById(supabase, lessonId);
    if (!lesson) {
      return NextResponse.json({ message: "Lesson not found" }, { status: 404 });
    }
    return NextResponse.json(lesson);
  } catch (cause) {
    return serverError(cause, "Failed to load lesson");
  }
}
