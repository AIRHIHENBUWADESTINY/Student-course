import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { getProfile, mergeProfile } from "@/lib/server/db";
import { DEFAULT_PROFILE } from "@/lib/storage";
import type { StudentProfile } from "@/types";

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 422 }
    );
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (/invalid login credentials/i.test(error.message)) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }
    if (/email not confirmed/i.test(error.message)) {
      return NextResponse.json(
        { message: "Please confirm your email address, then sign in." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Unable to sign in" },
      { status: 400 }
    );
  }

  if (!data.session || !data.user) {
    return NextResponse.json(
      { message: "Unable to start a session. Please try again." },
      { status: 401 }
    );
  }

  let profile: StudentProfile = { ...DEFAULT_PROFILE };
  try {
    profile = await getProfile(
      createSupabaseClient(data.session.access_token),
      data.user.id
    );
  } catch {
    /* fall back to defaults; the auth user still authenticates */
  }

  return NextResponse.json({
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: mergeProfile(profile, data.user),
  });
}
