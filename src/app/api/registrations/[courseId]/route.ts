import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import {
  deleteRegistration,
  getPortalSettings,
} from "@/lib/server/db";
import { parseRegistrationQuery } from "@/lib/server/registrations";
import { serverError, unauthorized } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const { courseId } = await params;
  const { session, semester } = parseRegistrationQuery(request.url);

  if (!session || !semester) {
    return NextResponse.json(
      { message: "session and semester are required" },
      { status: 422 }
    );
  }

  try {
    const portal = await getPortalSettings(auth.supabase);
    if (!portal.registrationOpen) {
      return NextResponse.json(
        { message: "Course registration is currently closed." },
        { status: 403 }
      );
    }

    const removed = await deleteRegistration(
      auth.supabase,
      auth.userId,
      courseId,
      session,
      semester
    );
    if (!removed) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (cause) {
    return serverError(cause, "Failed to remove the course");
  }
}
