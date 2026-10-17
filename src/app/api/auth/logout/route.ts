import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { apiHandler } from "@/lib/server/auth";

export const POST = apiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (auth) {
    try {
      await auth.supabase.auth.signOut();
    } catch {
      /* the access token still expires on its own */
    }
  }
  return NextResponse.json({ success: true });
});
