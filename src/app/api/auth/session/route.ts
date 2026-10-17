import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { getProfile } from "@/lib/server/db";
import { apiHandler, unauthorized } from "@/lib/server/auth";
import { DEFAULT_PROFILE } from "@/lib/storage";
import type { StudentProfile } from "@/types";

export const GET = apiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  let profile: StudentProfile = { ...DEFAULT_PROFILE };
  try {
    profile = await getProfile(auth.supabase, auth.userId);
  } catch {
    /* the auth user is still valid; fall back to a default profile */
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      ...profile,
      email: auth.email ?? profile.email,
    },
  });
});
