import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { getProfile } from "@/lib/server/db";
import { unauthorized } from "@/lib/server/auth";

export async function GET(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const profile = await getProfile(auth.supabase, auth.userId);
  return NextResponse.json({
    authenticated: true,
    user: {
      ...profile,
      email: auth.email ?? profile.email,
    },
  });
}
