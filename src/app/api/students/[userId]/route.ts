import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { deleteStudent, getProfile, updateStudent } from "@/lib/server/db";
import { forbidden, serverError, unauthorized } from "@/lib/server/auth";
import type { StudentProfile, UserRole } from "@/types";

export const dynamic = "force-dynamic";

const EDITABLE = [
  "name",
  "matricNumber",
  "faculty",
  "department",
  "level",
  "session",
] as const;

async function assertAdmin(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return { error: unauthorized() as NextResponse };
  const profile = await getProfile(auth.supabase, auth.userId);
  if (profile.role !== "admin") {
    return { error: forbidden("Only administrators can manage students") };
  }
  return { auth, profile };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await assertAdmin(request);
  if ("error" in admin) return admin.error;
  const { auth } = admin;

  const { userId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const input = (body ?? {}) as Partial<Record<keyof StudentProfile, unknown>>;
  const updates: Partial<StudentProfile> = {};

  for (const key of EDITABLE) {
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

  if (input.role !== undefined) {
    if (input.role !== "student" && input.role !== "admin") {
      return NextResponse.json({ message: "Invalid role" }, { status: 422 });
    }
    updates.role = input.role as UserRole;
  }

  try {
    return NextResponse.json(
      await updateStudent(auth.supabase, userId, updates)
    );
  } catch (cause) {
    return serverError(cause, "Failed to update the student");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await assertAdmin(request);
  if ("error" in admin) return admin.error;
  const { auth } = admin;

  const { userId } = await params;

  if (userId === auth.userId) {
    return NextResponse.json(
      { message: "You cannot remove your own account." },
      { status: 422 }
    );
  }

  try {
    const removed = await deleteStudent(auth.supabase, userId);
    if (!removed) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (cause) {
    return serverError(cause, "Failed to remove the student");
  }
}
