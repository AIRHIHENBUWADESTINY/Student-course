import { NextResponse } from "next/server";

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { message: "Authentication required" },
    { status: 401 }
  );
}

export function forbidden(message = "Administrator access required"): NextResponse {
  return NextResponse.json({ message }, { status: 403 });
}

export function serverError(
  cause: unknown,
  fallback = "Something went wrong"
): NextResponse {
  return NextResponse.json(
    { message: cause instanceof Error ? cause.message : fallback },
    { status: 500 }
  );
}
