import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";

interface RefreshBody {
  refreshToken?: unknown;
}

export async function POST(request: Request) {
  let body: RefreshBody;
  try {
    body = (await request.json()) as RefreshBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const refreshToken =
    typeof body.refreshToken === "string" ? body.refreshToken : "";

  if (!refreshToken) {
    return NextResponse.json(
      { message: "refreshToken is required" },
      { status: 422 }
    );
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    return NextResponse.json(
      { message: "Session expired. Please sign in again." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
  });
}
