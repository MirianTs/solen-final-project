import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Landing point of the password reset email. Accepts both link styles:
 * - `?token_hash=…&type=recovery` (custom email template; works on any device)
 * - `?code=…` (default template, PKCE; only works in the browser that asked for the link)
 * On success the user has a session and is sent to /admin/reset to choose a new password.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const code = params.get("code");

  const supabase = await createSupabaseServerClient();
  let ok = false;
  try {
    if (tokenHash && type === "recovery") {
      ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
    } else if (code) {
      ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
    }
  } catch (error) {
    console.error("[auth confirm]", error);
  }

  const target = ok ? "/admin/reset" : "/admin/login?error=link";
  const response = NextResponse.redirect(new URL(target, request.url));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
