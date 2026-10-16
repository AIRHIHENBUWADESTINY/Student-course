import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import {
  deleteDepartment,
  getProfile,
  updateDepartment,
} from "@/lib/server/db";
import { forbidden, serverError, unauthorized } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

const MAX_FACULTY = 120;
const MAX_NAME = 120;

async function assertAdmin(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return { error: unauthorized() as NextResponse };
  const profile = await getProfile(auth.supabase, auth.userId);
  if (profile.role !== "admin") {
    return { error: forbidden("Only administrators can manage departments") };
  }
  return { auth };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await assertAdmin(request);
  if ("error" in admin) return admin.error;
  const { auth } = admin;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const input = (body ?? {}) as { faculty?: unknown; name?: unknown };
  const updates: { faculty?: string; name?: string } = {};

  if (input.faculty !== undefined) {
    if (typeof input.faculty !== "string" || !input.faculty.trim()) {
      return NextResponse.json(
        { message: "Faculty must be a non-empty string" },
        { status: 422 }
      );
    }
    if (input.faculty.trim().length > MAX_FACULTY) {
      return NextResponse.json(
        { message: `Faculty must be ${MAX_FACULTY} characters or fewer` },
        { status: 422 }
      );
    }
    updates.faculty = input.faculty.trim();
  }

  if (input.name !== undefined) {
    if (typeof input.name !== "string" || !input.name.trim()) {
      return NextResponse.json(
        { message: "Department must be a non-empty string" },
        { status: 422 }
      );
    }
    if (input.name.trim().length > MAX_NAME) {
      return NextResponse.json(
        { message: `Department must be ${MAX_NAME} characters or fewer` },
        { status: 422 }
      );
    }
    updates.name = input.name.trim();
  }

  try {
    const department = await updateDepartment(auth.supabase, id, updates);
    if (!department) {
      return NextResponse.json(
        { message: "Department not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(department);
  } catch (cause) {
    return serverError(cause, "Failed to update the department");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await assertAdmin(request);
  if ("error" in admin) return admin.error;
  const { auth } = admin;

  const { id } = await params;

  try {
    const removed = await deleteDepartment(auth.supabase, id);
    if (!removed) {
      return NextResponse.json(
        { message: "Department not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (cause) {
    return serverError(cause, "Failed to delete the department");
  }
}
