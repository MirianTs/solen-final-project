import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/ui/logo";
import { NEW_TAB_HINT } from "@/lib/a11y";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "../actions/auth";

export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const { supabase, user } = await requireAdmin();

  const { count } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/admin" className="flex items-center gap-2" aria-label="Solen ადმინი — მთავარი">
            <Logo className="h-6 w-auto" />
            <span className="text-xs font-semibold text-muted">ადმინი</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-48 truncate text-sm text-muted sm:inline">{user.email}</span>
            <Link href="/" target="_blank" className="admin-btn-ghost">
              საიტი
              <span className="sr-only">{NEW_TAB_HINT}</span>
            </Link>
            <form action={signOut}>
              <button type="submit" className="admin-btn-ghost">
                გასვლა
              </button>
            </form>
          </div>
        </div>
      </header>
      <AdminNav pendingReviews={count ?? 0} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:py-10">{children}</main>
    </div>
  );
}
