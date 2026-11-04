"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin, NotAdminError } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PasswordState = { ok?: boolean; error?: string; at?: number };

const newPassword = {
  next: z.string().min(8, "ახალი პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს").max(72, "ახალი პაროლი ძალიან გრძელია"),
  confirm: z.string(),
};
const matches = (d: { next: string; confirm: string }) => d.next === d.confirm;
const MISMATCH = { message: "ახალი პაროლები ერთმანეთს არ ემთხვევა" };

const changeSchema = z
  .object({ current: z.string().min(1, "შეიყვანეთ მიმდინარე პაროლი").max(200), ...newPassword })
  .refine(matches, MISMATCH)
  .refine((d) => d.next !== d.current, { message: "ახალი პაროლი ძველისგან უნდა განსხვავდებოდეს" });

const resetSchema = z.object(newPassword).refine(matches, MISMATCH);

function readPasswords(formData: FormData) {
  return {
    current: String(formData.get("current") ?? ""),
    next: String(formData.get("next") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  };
}

/** Georgian message for an auth.updateUser error. */
function updateErrorMessage(error: { code?: string }) {
  if (error.code === "weak_password") return "პაროლი ძალიან სუსტია. აიღეთ უფრო გრძელი და რთული.";
  if (error.code === "same_password") return "ახალი პაროლი ძველისგან უნდა განსხვავდებოდეს";
  console.error("[password]", error);
  return "პაროლი ვერ შეიცვალა. სცადეთ თავიდან.";
}

/** Changes the signed-in admin's password after re-checking the current one. */
export async function changePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const parsed = changeSchema.safeParse(readPasswords(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "შეამოწმეთ ველები" };

  try {
    const { supabase, user } = await assertAdmin();
    if (!user.email) return { error: "ანგარიშს ელფოსტა არ აქვს." };

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.current,
    });
    if (signInError) {
      if (signInError.status === 429) return { error: "ძალიან ბევრი მცდელობა. სცადეთ რამდენიმე წუთში." };
      return { error: "მიმდინარე პაროლი არასწორია." };
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.next });
    if (error) return { error: updateErrorMessage(error) };
    return { ok: true, at: Date.now() };
  } catch (error) {
    if (error instanceof NotAdminError) return { error: "სესია ამოიწურა. შედით თავიდან." };
    console.error("[change password]", error);
    return { error: "პაროლი ვერ შეიცვალა. სცადეთ თავიდან." };
  }
}

/** Sets a new password in the session opened by a reset link (no current password needed). */
export async function resetPassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const parsed = resetSchema.safeParse(readPasswords(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "შეამოწმეთ ველები" };

  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.auth.updateUser({ password: parsed.data.next });
    if (error) return { error: updateErrorMessage(error) };
  } catch (error) {
    if (error instanceof NotAdminError) return { error: "ბმულს ვადა გაუვიდა. მოითხოვეთ ახალი." };
    console.error("[reset password]", error);
    return { error: "პაროლი ვერ შეიცვალა. სცადეთ თავიდან." };
  }
  redirect("/admin");
}

export type ForgotState = { sent?: boolean; error?: string; email?: string };

const forgotSchema = z.object({ email: z.email("შეიყვანეთ სწორი ელფოსტა").max(254) });

/**
 * Emails a password reset link. Always answers "sent" for a valid address, so the form
 * does not reveal which emails have an account.
 */
export async function requestPasswordReset(_prev: ForgotState, formData: FormData): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = forgotSchema.safeParse({ email });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "შეამოწმეთ ველი", email };

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${publicEnv().NEXT_PUBLIC_SITE_URL}/admin/auth/confirm`,
    });
    if (error) {
      if (error.status === 429) return { error: "ძალიან ბევრი მცდელობა. სცადეთ ერთ საათში.", email };
      console.error("[forgot password]", error);
    }
  } catch (error) {
    console.error("[forgot password]", error);
    return { error: "სერვერთან კავშირი ვერ მოხერხდა. სცადეთ თავიდან.", email };
  }
  return { sent: true, email };
}
