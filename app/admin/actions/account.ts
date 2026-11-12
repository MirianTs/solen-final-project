"use server";

import { z } from "zod";
import { assertAdmin, isRateLimited, NotAdminError, SESSION_EXPIRED_MESSAGE } from "@/lib/auth";

export type PasswordState = { ok?: boolean; error?: string; at?: number };

const passwordSchema = z
  .object({
    current: z.string().min(1, "შეიყვანეთ მიმდინარე პაროლი").max(200),
    next: z.string().min(8, "ახალი პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს").max(72, "ახალი პაროლი ძალიან გრძელია"),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { message: "ახალი პაროლები ერთმანეთს არ ემთხვევა" })
  .refine((d) => d.next !== d.current, { message: "ახალი პაროლი ძველისგან უნდა განსხვავდებოდეს" });

/** Changes the signed-in admin's password after re-checking the current one. */
export async function changePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const parsed = passwordSchema.safeParse({
    current: String(formData.get("current") ?? ""),
    next: String(formData.get("next") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "შეამოწმეთ ველები" };

  try {
    const { supabase, user } = await assertAdmin();
    if (!user.email) return { error: "ანგარიშს ელფოსტა არ აქვს." };

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.current,
    });
    if (signInError) {
      if (isRateLimited(signInError)) return { error: "ძალიან ბევრი მცდელობა. სცადეთ რამდენიმე წუთში." };
      return { error: "მიმდინარე პაროლი არასწორია." };
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.next });
    if (error) {
      if (error.code === "weak_password") return { error: "პაროლი ძალიან სუსტია. აიღეთ უფრო გრძელი და რთული." };
      if (error.code === "same_password") return { error: "ახალი პაროლი ძველისგან უნდა განსხვავდებოდეს" };
      console.error("[change password]", error);
      return { error: "პაროლი ვერ შეიცვალა. სცადეთ თავიდან." };
    }
    return { ok: true, at: Date.now() };
  } catch (error) {
    if (error instanceof NotAdminError) return { error: SESSION_EXPIRED_MESSAGE };
    console.error("[change password]", error);
    return { error: "პაროლი ვერ შეიცვალა. სცადეთ თავიდან." };
  }
}
