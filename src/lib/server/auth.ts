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

/**
 * Wraps a route handler so any uncaught error becomes a JSON 500 response.
 * Without this, an exception escapes the handler and Next.js returns an HTML
 * error page, which clients can only report as a generic failure.
 */
export function apiHandler(
  handler: (request: Request) => Response | Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (cause) {
      console.error(`[api] ${request.method} ${request.url} failed`, cause);
      return serverError(cause, "Something went wrong. Please try again.");
    }
  };
}
