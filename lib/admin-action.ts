import "server-only";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { assertAdmin, NotAdminError } from "@/lib/auth";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

type AdminContext = Awaited<ReturnType<typeof assertAdmin>>;

/** Thrown inside a handler to return a specific Georgian message to the client. */
export class UserError extends Error {}

/**
 * Wraps every admin mutation: check admin → validate input with zod → run → revalidate the public page.
 * Internal errors are logged on the server; the client only gets a generic Georgian message.
 */
export async function runAdminAction<S extends z.ZodType, T>(
  schema: S,
  input: unknown,
  handler: (data: z.infer<S>, ctx: AdminContext) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const ctx = await assertAdmin();
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "მონაცემები არასწორია." };
    }
    const data = await handler(parsed.data, ctx);
    revalidatePath("/");
    return { ok: true, data };
  } catch (error) {
    if (error instanceof NotAdminError) {
      return { ok: false, error: "სესია ამოიწურა. შედით თავიდან." };
    }
    if (error instanceof UserError) {
      return { ok: false, error: error.message };
    }
    console.error("[admin action]", error);
    return { ok: false, error: "შენახვა ვერ მოხერხდა. სცადეთ თავიდან." };
  }
}

/** Throws on a Supabase error so runAdminAction turns it into a generic message. */
export function check<T extends { error: unknown }>(result: T): T {
  if (result.error) throw result.error;
  return result;
}
