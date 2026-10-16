import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { clearProgress, getProgress } from "@/lib/server/db";
import { unauthorized, serverError } from "@/lib/server/auth";

export async function GET(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  try {
    return NextResponse.json(await getProgress(auth.supabase, auth.userId));
  } catch (cause) {
    return serverError(cause, "Failed to load progress");
  }
}

export async function DELETE(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  try {
    return NextResponse.json(await clearProgress(auth.supabase, auth.userId));
  } catch (cause) {
    return serverError(cause, "Failed to clear progress");
  }
}
