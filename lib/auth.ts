import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Returns the signed-in admin, or null. Verifies the user with the Auth server and checks is_admin(). */
export async function getAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) return { supabase, user, isAdmin: false as const };
  return { supabase, user, isAdmin: true as const };
}

/** For admin pages/layouts: redirects to the login page unless the user is an admin. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  if (!admin.isAdmin) redirect("/admin/login?error=forbidden");
  return { supabase: admin.supabase, user: admin.user };
}

/** Shown when a server action runs after the admin session has ended. */
export const SESSION_EXPIRED_MESSAGE = "სესია ამოიწურა. შედით თავიდან.";

export class NotAdminError extends Error {
  constructor() {
    super("Not an admin");
  }
}

/** For server actions: throws NotAdminError unless the user is an admin. */
export async function assertAdmin() {
  const admin = await getAdmin();
  if (!admin?.isAdmin) throw new NotAdminError();
  return { supabase: admin.supabase, user: admin.user };
}
