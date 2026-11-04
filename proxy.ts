import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";

/** Admin routes reachable without a session: login and the password reset flow. */
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/forgot", "/admin/auth/confirm"]);

/**
 * Refreshes the Supabase session cookie and keeps signed-out users out of /admin.
 * This is only the first line of defence: every admin page and server action
 * re-checks the user AND is_admin() on the server.
 */
export async function proxy(request: NextRequest) {
  const env = publicEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // No-store headers so a CDN never caches a response that sets auth cookies.
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Do not run code between createServerClient and getClaims (it refreshes the session).
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ADMIN_PATHS.has(pathname);

  if (!signedIn && !isPublic) {
    return redirectKeepingCookies(request, response, "/admin/login");
  }
  // Signed-in admins visiting /admin/login are sent on by the login page itself (it checks is_admin()).

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function redirectKeepingCookies(request: NextRequest, from: NextResponse, path: string) {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  from.headers.forEach((value, key) => {
    if (key.toLowerCase() === "cache-control" || key.toLowerCase() === "expires") redirect.headers.set(key, value);
  });
  redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
  return redirect;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
