import { NextResponse } from "next/server";
import { createSupabaseClient, getAuthContext } from "@/lib/supabase/server";
import {
  createRegistration,
  getCourseById,
  getPortalSettings,
  getProfile,
  listRegistrations,
} from "@/lib/server/db";
import {
  parseRegistrationInput,
  parseRegistrationQuery,
} from "@/lib/server/registrations";
import { serverError, unauthorized } from "@/lib/server/auth";
import { MAX_CREDIT_UNITS } from "@/lib/academics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const filter = parseRegistrationQuery(request.url);
  try {
    return NextResponse.json(
      await listRegistrations(auth.supabase, auth.userId, filter)
    );
  } catch (cause) {
    return serverError(cause, "Failed to load registrations");
  }
}

export async function POST(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseRegistrationInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 422 });
  }

  try {
    const portal = await getPortalSettings(auth.supabase);
    if (!portal.registrationOpen) {
      return NextResponse.json(
        { message: "Course registration is currently closed." },
        { status: 403 }
      );
    }

    const course = await getCourseById(auth.supabase, parsed.value.courseId);
    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }
    if (course.registrationStatus === "Closed") {
      return NextResponse.json(
        { message: "This course is not open for registration." },
        { status: 422 }
      );
    }

    const profile = await getProfile(auth.supabase, auth.userId);

    const isElective = course.courseType === "Elective";
    if (
      !isElective &&
      profile.department &&
      course.department &&
      profile.department !== course.department
    ) {
      return NextResponse.json(
        {
          message:
            "This course is not offered to your department. Only electives can be taken outside your department.",
        },
        { status: 403 }
      );
    }
    if (
      !isElective &&
      profile.level &&
      course.level &&
      profile.level !== course.level
    ) {
      return NextResponse.json(
        { message: "This course is not available at your level." },
        { status: 403 }
      );
    }

    const session = parsed.value.session ?? portal.session;
    const semester =
      parsed.value.semester ?? course.semester ?? "First Semester";

    const existing = await listRegistrations(auth.supabase, auth.userId, {
      session,
      semester,
    });
    if (existing.some((item) => item.courseId === course.id)) {
      return NextResponse.json(
        { message: "You have already registered for this course." },
        { status: 409 }
      );
    }

    const currentCredits = existing.reduce(
      (sum, item) => sum + (item.course?.creditUnits ?? 0),
      0
    );
    const nextCredits = currentCredits + (course.creditUnits ?? 3);
    if (nextCredits > MAX_CREDIT_UNITS) {
      return NextResponse.json(
        {
          message: `Adding this course would exceed the ${MAX_CREDIT_UNITS} credit unit limit. Remove a course first.`,
        },
        { status: 422 }
      );
    }

    const registration = await createRegistration(
      auth.supabase,
      auth.userId,
      course.id,
      session,
      semester
    );
    return NextResponse.json(registration, { status: 201 });
  } catch (cause) {
    return serverError(cause, "Failed to register for the course");
  }
}

export async function DELETE(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const { session, semester } = parseRegistrationQuery(request.url);
  try {
    const supabase = createSupabaseClient();
    const portal = await getPortalSettings(supabase);
    if (!portal.registrationOpen) {
      return NextResponse.json(
        { message: "Course registration is currently closed." },
        { status: 403 }
      );
    }
    const list = await listRegistrations(auth.supabase, auth.userId, {
      session,
      semester,
    });
    for (const item of list) {
      await auth.supabase
        .from("registrations")
        .delete()
        .eq("id", item.id);
    }
    return NextResponse.json({ success: true });
  } catch (cause) {
    return serverError(cause, "Failed to clear registrations");
  }
}
