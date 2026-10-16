import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const auth = await getAuthContext(request);
  if (auth) {
    try {
      await auth.supabase.auth.signOut();
    } catch {
      /* the access token still expires on its own */
    }
  }
  return NextResponse.json({ success: true });
}
