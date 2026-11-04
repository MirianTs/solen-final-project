"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type SignInState } from "../actions/auth";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});
  const message = state.error ?? notice;

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {message && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
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
          className="admin-input"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">პაროლი</span>
        <input name="password" type="password" autoComplete="current-password" required className="admin-input" />
      </label>

      <button type="submit" disabled={pending} className="admin-btn-primary mt-2">
        {pending ? "მიმდინარეობს…" : "შესვლა"}
      </button>
      <Link href="/admin/forgot" className="self-center text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
        პაროლი დაგავიწყდა?
      </Link>
    </form>
  );
}
