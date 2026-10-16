import { NextResponse } from "next/server";
import { createSupabaseClient, getAuthContext } from "@/lib/supabase/server";
import { getPortalSettings, getProfile, updatePortalSettings } from "@/lib/server/db";
import { forbidden, serverError, unauthorized } from "@/lib/server/auth";
import type { PortalSettings } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getPortalSettings(createSupabaseClient()));
  } catch (cause) {
    return serverError(cause, "Failed to load portal settings");
  }
}

export async function PUT(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const profile = await getProfile(auth.supabase, auth.userId);
  if (profile.role !== "admin") {
    return forbidden("Only administrators can change portal settings");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const input = (body ?? {}) as Partial<Record<keyof PortalSettings, unknown>>;
  const updates: Partial<PortalSettings> = {};

  if (input.registrationOpen !== undefined) {
    if (typeof input.registrationOpen !== "boolean") {
      return NextResponse.json(
        { message: "registrationOpen must be a boolean" },
        { status: 422 }
      );
    }
    updates.registrationOpen = input.registrationOpen;
  }
  if (input.session !== undefined) {
    if (typeof input.session !== "string" || !input.session.trim()) {
      return NextResponse.json(
        { message: "session must be a non-empty string" },
        { status: 422 }
      );
    }
    updates.session = input.session.trim();
  }
  if (input.deadline !== undefined) {
    if (input.deadline === null || input.deadline === "") {
      updates.deadline = null;
    } else if (typeof input.deadline === "string") {
      const date = new Date(input.deadline);
      if (Number.isNaN(date.getTime())) {
        return NextResponse.json(
          { message: "deadline must be a valid date" },
          { status: 422 }
        );
      }
      updates.deadline = date.toISOString();
    } else {
      return NextResponse.json(
        { message: "deadline must be a string or null" },
        { status: 422 }
      );
    }
  }

  try {
    return NextResponse.json(await updatePortalSettings(auth.supabase, updates));
  } catch (cause) {
    return serverError(cause, "Failed to update portal settings");
  }
}
