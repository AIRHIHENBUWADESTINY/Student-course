import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { listLessons } from "@/lib/server/db";
import { serverError } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    return NextResponse.json(await listLessons(supabase));
  } catch (cause) {
    return serverError(cause, "Failed to load lessons");
  }
}
