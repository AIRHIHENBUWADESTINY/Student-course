/**
 * Fallback connection details for the project's Supabase instance. The
 * publishable key is designed to be exposed to browsers, so shipping it as a
 * default keeps deployments working even when the host has not been given the
 * NEXT_PUBLIC_SUPABASE_* variables. Environment variables still take
 * precedence, so set them in the hosting dashboard to point elsewhere.
 */
const FALLBACK_SUPABASE_URL = "https://odtublniztipvdantfpa.supabase.co";

const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_zwXY1V9dDDiAuN_VSY_dPw_fk53gG70";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  FALLBACK_SUPABASE_PUBLISHABLE_KEY;

/**
 * True when the built-in defaults above are in use because the host was not
 * given the NEXT_PUBLIC_SUPABASE_* variables. Surfaced by /api/health so a
 * misconfigured deployment is easy to spot.
 */
export const usingFallbackSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function hasSupabaseEnv(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
}

export function assertSupabaseEnv(): void {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local."
    );
  }
}
