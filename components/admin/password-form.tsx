"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { changePassword, resetPassword, type PasswordState } from "@/app/admin/actions/account";

/** "change" asks for the current password; "reset" is for the session opened by a reset link. */
export function PasswordForm({ email, mode = "change" }: { email: string; mode?: "change" | "reset" }) {
  const [state, action, pending] = useActionState<PasswordState, FormData>(
    mode === "reset" ? resetPassword : changePassword,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      toast.success("პაროლი შეიცვალა");
    }
  }, [state.ok, state.at]);

  return (
    <form ref={formRef} action={action} className="flex max-w-md flex-col gap-4" noValidate>
      {/* Lets password managers save the new password under the right account. */}
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />

      {state.error && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}

      {mode === "change" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">მიმდინარე პაროლი</span>
          <input name="current" type="password" autoComplete="current-password" required className="admin-input" />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">ახალი პაროლი</span>
        <input
          name="next"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-describedby="password-hint"
          className="admin-input"
        />
        <span id="password-hint" className="text-xs text-muted">
          მინიმუმ 8 სიმბოლო
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">გაიმეორეთ ახალი პაროლი</span>
        <input name="confirm" type="password" autoComplete="new-password" required className="admin-input" />
      </label>

      <button type="submit" disabled={pending} className="admin-btn-primary mt-2">
        {pending ? "მიმდინარეობს…" : mode === "reset" ? "პაროლის შენახვა" : "პაროლის შეცვლა"}
      </button>
    </form>
  );
}
