import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/server";
import { getPortalSettings, listRegistrations, submitRegistrations } from "@/lib/server/db";
import { parseRegistrationQuery } from "@/lib/server/registrations";
import { serverError, unauthorized } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

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

    const existing = await listRegistrations(auth.supabase, auth.userId, {
      session,
      semester,
    });
    if (existing.length === 0) {
      return NextResponse.json(
        { message: "Add at least one course before submitting." },
        { status: 422 }
      );
    }

    const registrations = await submitRegistrations(
      auth.supabase,
      auth.userId,
      session,
      semester
    );
    return NextResponse.json(registrations);
  } catch (cause) {
    return serverError(cause, "Failed to submit registration");
  }
}
