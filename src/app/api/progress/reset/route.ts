import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { resetProgress } from "@/lib/server/db";
import { unauthorized, serverError } from "@/lib/server/auth";

export async function POST(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  try {
    return NextResponse.json(await resetProgress(auth.supabase, auth.userId));
  } catch (cause) {
    return serverError(cause, "Failed to reset progress");
  }
}
