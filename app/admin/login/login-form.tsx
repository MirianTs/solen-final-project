"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "../actions/auth";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});
  const message = state.error ?? notice;

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {message && (
        <p id="login-error" role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {message}
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">ელფოსტა</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          aria-describedby={message ? "login-error" : undefined}
          className="admin-input"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">პაროლი</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={message ? "login-error" : undefined}
          className="admin-input"
        />
      </label>

      <button type="submit" disabled={pending} className="admin-btn-primary mt-2">
        {pending ? "მიმდინარეობს…" : "შესვლა"}
      </button>
    </form>
  );
}
