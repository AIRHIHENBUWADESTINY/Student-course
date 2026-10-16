import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertSupabaseEnv, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { getBearerToken } from "@/lib/server/auth";

/**
 * Creates a Supabase client that runs without a persisted session. When an
 * access token is supplied it is attached to every request so Postgres Row
 * Level Security policies evaluate as that user.
 */
export function createSupabaseClient(accessToken?: string): SupabaseClient {
  assertSupabaseEnv();
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
}

export interface AuthContext {
  supabase: SupabaseClient;
  userId: string;
  email: string | null;
}

/**
 * Resolves the caller from the "Authorization: Bearer <jwt>" header. The token
 * is a Supabase access token, so validating it also confirms the session is
 * still active.
 */
export async function getAuthContext(
  request: Request
): Promise<AuthContext | null> {
  const token = getBearerToken(request);
  if (!token) return null;

  const supabase = createSupabaseClient(token);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  return {
    supabase,
    userId: data.user.id,
    email: data.user.email ?? null,
  };
}
