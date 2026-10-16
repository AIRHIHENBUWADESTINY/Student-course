import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { getProfile, listStudents } from "@/lib/server/db";
import { forbidden, serverError, unauthorized } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const profile = await getProfile(auth.supabase, auth.userId);
  if (profile.role !== "admin") {
    return forbidden("Only administrators can view students");
  }

  try {
    return NextResponse.json(await listStudents(auth.supabase));
  } catch (cause) {
    return serverError(cause, "Failed to load students");
  }
}
