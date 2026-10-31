"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SignInState = { error?: string; email?: string };

const signInSchema = z.object({
  email: z.email("შეიყვანეთ სწორი ელფოსტა").max(254),
  password: z.string().min(1, "შეიყვანეთ პაროლი").max(200),
});

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const raw = { email: String(formData.get("email") ?? "").trim(), password: String(formData.get("password") ?? "") };
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შეამოწმეთ ველები", email: raw.email };
  }

  const supabase = await createSupabaseServerClient();

  let authError: { status?: number; code?: string } | null = null;
  try {
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    authError = error;
  } catch {
    return { error: "სერვერთან კავშირი ვერ მოხერხდა. სცადეთ თავიდან.", email: raw.email };
  }

  if (authError) {
    if (authError.status === 429 || authError.code === "over_request_rate_limit") {
      return { error: "ძალიან ბევრი მცდელობა. სცადეთ რამდენიმე წუთში.", email: raw.email };
    }
    if (authError.code === "invalid_credentials" || authError.status === 400) {
      return { error: "ელფოსტა ან პაროლი არასწორია.", email: raw.email };
    }
    return { error: "შესვლა ვერ მოხერხდა. სცადეთ თავიდან.", email: raw.email };
  }

  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");
  if (rpcError || isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "ამ ანგარიშს ადმინისტრატორის წვდომა არ აქვს.", email: raw.email };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
