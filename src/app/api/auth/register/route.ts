import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { getProfile, mergeProfile } from "@/lib/server/db";
import { apiHandler } from "@/lib/server/auth";
import { DEFAULT_PROFILE } from "@/lib/storage";
import {
  EMAIL_PATTERN,
  MAX_AGE,
  MIN_AGE,
  ageInYears,
  isValidDateOfBirth,
} from "@/lib/validation";
import type { StudentProfile } from "@/types";

interface RegisterBody {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  dateOfBirth?: unknown;
}

const MIN_PASSWORD_LENGTH = 6;

export const POST = apiHandler(async (request: Request) => {
  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const dateOfBirth =
    typeof body.dateOfBirth === "string" ? body.dateOfBirth.trim() : "";

  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 422 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { message: "Please provide a valid email address" },
      { status: 422 }
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 422 }
    );
  }
  if (!dateOfBirth) {
    return NextResponse.json(
      { message: "Date of birth is required" },
      { status: 422 }
    );
  }
  if (!isValidDateOfBirth(dateOfBirth)) {
    return NextResponse.json(
      { message: "Please provide a valid date of birth" },
      { status: 422 }
    );
  }

  const age = ageInYears(dateOfBirth);
  if (age < MIN_AGE) {
    return NextResponse.json(
      { message: `You must be at least ${MIN_AGE} years old to register` },
      { status: 422 }
    );
  }
  if (age > MAX_AGE) {
    return NextResponse.json(
      { message: "Please provide a valid date of birth" },
      { status: 422 }
    );
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, date_of_birth: dateOfBirth } },
  });

  if (error) {
    const status = /already|registered|exists/i.test(error.message) ? 409 : 400;
    return NextResponse.json({ message: error.message }, { status });
  }

  if (!data.session || !data.user) {
    return NextResponse.json(
      {
        message:
          "Account created. Check your email to confirm it, then sign in.",
      },
      { status: 400 }
    );
  }

  let profile: StudentProfile = {
    ...DEFAULT_PROFILE,
    name,
    email,
    dateOfBirth,
  };
  try {
    profile = await getProfile(
      createSupabaseClient(data.session.access_token),
      data.user.id
    );
  } catch {
    /* fall back to the submitted profile */
  }

  return NextResponse.json(
    {
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: mergeProfile(profile, data.user),
    },
    { status: 201 }
  );
});
