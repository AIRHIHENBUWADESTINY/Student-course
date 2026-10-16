import { NextResponse } from "next/server";
import { createSupabaseClient, getAuthContext } from "@/lib/supabase/server";
import {
  createDepartment,
  getProfile,
  listDepartments,
} from "@/lib/server/db";
import { forbidden, serverError, unauthorized } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

const MAX_FACULTY = 120;
const MAX_NAME = 120;

export async function GET() {
  try {
    return NextResponse.json(await listDepartments(createSupabaseClient()));
  } catch (cause) {
    return serverError(cause, "Failed to load departments");
  }
}

export async function POST(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const profile = await getProfile(auth.supabase, auth.userId);
  if (profile.role !== "admin") {
    return forbidden("Only administrators can manage departments");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const input = (body ?? {}) as { faculty?: unknown; name?: unknown };
  const faculty = typeof input.faculty === "string" ? input.faculty.trim() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";

  if (!faculty) {
    return NextResponse.json({ message: "Faculty is required" }, { status: 422 });
  }
  if (faculty.length > MAX_FACULTY) {
    return NextResponse.json(
      { message: `Faculty must be ${MAX_FACULTY} characters or fewer` },
      { status: 422 }
    );
  }
  if (!name) {
    return NextResponse.json(
      { message: "Department name is required" },
      { status: 422 }
    );
  }
  if (name.length > MAX_NAME) {
    return NextResponse.json(
      { message: `Department must be ${MAX_NAME} characters or fewer` },
      { status: 422 }
    );
  }

  try {
    return NextResponse.json(
      await createDepartment(auth.supabase, faculty, name),
      { status: 201 }
    );
  } catch (cause) {
    return serverError(cause, "Failed to create the department");
  }
}
