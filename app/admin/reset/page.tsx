import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";
import { PasswordForm } from "@/components/admin/password-form";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "ახალი პაროლი" };

/** Opened from the reset email (via /admin/auth/confirm), which already signed the user in. */
export default async function ResetPasswordPage() {
  const { user } = await requireAdmin();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-card border border-line bg-card p-6 sm:p-8">
        <Logo className="h-8 w-auto" />
        <h1 className="mt-2 mb-2 text-2xl font-bold">ახალი პაროლი</h1>
        <p className="mb-6 text-sm text-muted">{user.email}</p>
        <PasswordForm email={user.email ?? ""} mode="reset" />
      </div>
    </main>
  );
}
