import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { getSettings, updateSettings } from "@/lib/server/db";
import { unauthorized, serverError } from "@/lib/server/auth";
import type { UserSettings } from "@/types";

export async function GET(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  try {
    return NextResponse.json(await getSettings(auth.supabase, auth.userId));
  } catch (cause) {
    return serverError(cause, "Failed to load settings");
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

  const input = (body ?? {}) as Partial<Record<keyof UserSettings, unknown>>;
  const updates: Partial<UserSettings> = {};

  if (input.emailNotifications !== undefined) {
    if (typeof input.emailNotifications !== "boolean") {
      return NextResponse.json(
        { message: "emailNotifications must be a boolean" },
        { status: 422 }
      );
    }
    updates.emailNotifications = input.emailNotifications;
  }

  if (input.weeklyReminder !== undefined) {
    if (typeof input.weeklyReminder !== "boolean") {
      return NextResponse.json(
        { message: "weeklyReminder must be a boolean" },
        { status: 422 }
      );
    }
    updates.weeklyReminder = input.weeklyReminder;
  }

  if (input.weeklyGoal !== undefined) {
    if (
      typeof input.weeklyGoal !== "number" ||
      !Number.isFinite(input.weeklyGoal) ||
      input.weeklyGoal < 1 ||
      input.weeklyGoal > 48
    ) {
      return NextResponse.json(
        { message: "weeklyGoal must be a number between 1 and 48" },
        { status: 422 }
      );
    }
    updates.weeklyGoal = Math.round(input.weeklyGoal);
  }

  try {
    return NextResponse.json(
      await updateSettings(auth.supabase, auth.userId, updates)
    );
  } catch (cause) {
    return serverError(cause, "Failed to update settings");
  }
}
