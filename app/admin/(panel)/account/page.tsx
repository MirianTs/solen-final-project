import type { Metadata } from "next";
import { PasswordForm } from "@/components/admin/password-form";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "პაროლი" };

export default async function AccountPage() {
  const { user } = await requireAdmin();

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">პაროლის შეცვლა</h1>
      <p className="mb-6 text-sm text-muted">
        ანგარიში: <span className="text-fg">{user.email}</span>
      </p>
      <PasswordForm email={user.email ?? ""} />
    </>
  );
}
