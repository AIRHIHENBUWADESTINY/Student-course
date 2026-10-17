import { NextResponse } from "next/server";
import { hasSupabaseEnv, usingFallbackSupabase } from "@/lib/supabase/config";

export async function GET() {
  const configured = hasSupabaseEnv();
  const supabase = !configured
    ? "missing"
    : usingFallbackSupabase
      ? "fallback"
      : "env";

  return NextResponse.json(
    {
      status: configured ? "ok" : "degraded",
      service: "student-learning-dashboard",
      supabase,
      time: new Date().toISOString(),
    },
    { status: configured ? 200 : 503 }
  );
}
