"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type ForgotState } from "../actions/account";

export function ForgotForm() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(requestPasswordReset, {});

  if (state.sent) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="rounded-xl border border-line bg-card-raised px-4 py-3 text-sm">
          თუ <span className="font-semibold">{state.email}</span> ადმინის ელფოსტაა, მასზე წავიდა ბმული. შეამოწმეთ
          ფოსტა (Spam-იც) და გახსენით ბმული 1 საათში.
        </p>
        <Link href="/admin/login" className="admin-btn-ghost self-start">
          შესვლაზე დაბრუნება
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state.error && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
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

      <button type="submit" disabled={pending} className="admin-btn-primary mt-2">
        {pending ? "იგზავნება…" : "ბმულის გაგზავნა"}
      </button>
      <Link href="/admin/login" className="self-center text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
        შესვლაზე დაბრუნება
      </Link>
    </form>
  );
}
