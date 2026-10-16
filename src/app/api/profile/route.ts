import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { getProfile, updateProfile } from "@/lib/server/db";
import { unauthorized, serverError } from "@/lib/server/auth";
import type { StudentProfile } from "@/types";

export async function GET(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  try {
    return NextResponse.json(await getProfile(auth.supabase, auth.userId));
  } catch (cause) {
    return serverError(cause, "Failed to load profile");
  }
}

export async function PUT(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const input = (body ?? {}) as Partial<Record<keyof StudentProfile, unknown>>;
  const updates: Partial<StudentProfile> = {};

  // Role is intentionally excluded: only administrators may change it.
  const editable = [
    "name",
    "email",
    "bio",
    "goal",
    "dateOfBirth",
    "matricNumber",
    "faculty",
    "department",
    "level",
    "session",
  ] as const;

  for (const key of editable) {
    const value = input[key];
    if (value === undefined) continue;
    if (typeof value !== "string") {
      return NextResponse.json(
        { message: `Field "${key}" must be a string` },
        { status: 422 }
      );
    }
    updates[key] = value.trim();
  }

  if (updates.name !== undefined && !updates.name) {
    return NextResponse.json({ message: "Name cannot be empty" }, { status: 422 });
  }
  if (
    updates.email !== undefined &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)
  ) {
    return NextResponse.json(
      { message: "Please provide a valid email address" },
      { status: 422 }
    );
  }
  if (
    updates.dateOfBirth !== undefined &&
    updates.dateOfBirth !== "" &&
    !/^\d{4}-\d{2}-\d{2}$/.test(updates.dateOfBirth)
  ) {
    return NextResponse.json(
      { message: "Please provide a valid date of birth" },
      { status: 422 }
    );
  }

  try {
    return NextResponse.json(
      await updateProfile(auth.supabase, auth.userId, updates)
    );
  } catch (cause) {
    return serverError(cause, "Failed to update profile");
  }
}
