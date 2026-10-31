"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { check, runAdminAction } from "@/lib/admin-action";

const id = z.uuid();

export async function setReviewStatus(input: { id: string; status: "pending" | "approved" | "hidden" }) {
  const schema = z.object({ id, status: z.enum(["pending", "approved", "hidden"]) });
  return runAdminAction(schema, input, async (data, { supabase }) => {
    check(await supabase.from("reviews").update({ status: data.status }).eq("id", data.id));
    // Refresh the pending badge in the admin nav.
    revalidatePath("/admin", "layout");
  });
}

export async function deleteReview(input: { id: string }) {
  return runAdminAction(z.object({ id }), input, async (data, { supabase }) => {
    check(await supabase.from("reviews").delete().eq("id", data.id));
    revalidatePath("/admin", "layout");
  });
}
