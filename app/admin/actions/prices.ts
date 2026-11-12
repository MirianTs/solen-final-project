"use server";

import { z } from "zod";
import { check, runAdminAction, UserError } from "@/lib/admin-action";
import { plainText } from "@/lib/sanitize";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/**
 * Deletes Storage files of removed price items (photos from the old product catalog).
 * The rows are gone either way, so failures are only logged.
 */
async function removePhotoFiles(supabase: Supabase, paths: (string | null)[]) {
  const files = paths.filter((p): p is string => !!p);
  if (files.length === 0) return;
  const { error } = await supabase.storage.from("photos").remove(files);
  if (error) console.error("[prices] could not delete photo files", files, error);
}

const id = z.uuid();
const title = z
  .string()
  .transform(plainText)
  .pipe(z.string().min(1, "სექციის სათაური ცარიელია").max(100, "სათაური მაქსიმუმ 100 სიმბოლოა"));
const serviceName = z
  .string()
  .transform(plainText)
  .pipe(z.string().min(1, "სერვისის სახელი ცარიელია").max(200, "სახელი მაქსიმუმ 200 სიმბოლოა"));
const price = z.string().transform(plainText).pipe(z.string().max(100, "ფასი მაქსიმუმ 100 სიმბოლოა"));

/** Adds a price column ("სექცია") at the end and returns the new row. */
export async function createColumn(input: { title: string }) {
  return runAdminAction(z.object({ title }), input, async (data, { supabase }) => {
    const { data: last } = await supabase
      .from("price_columns")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data: row } = check(
      await supabase
        .from("price_columns")
        .insert({ title: data.title, position: (last?.position ?? -1) + 1 })
        .select()
        .single(),
    );
    return row!;
  });
}

/** Renames a price column. */
export async function updateColumn(input: { id: string; title: string }) {
  return runAdminAction(z.object({ id, title }), input, async (data, { supabase }) => {
    check(await supabase.from("price_columns").update({ title: data.title }).eq("id", data.id));
  });
}

/** Deletes a price column with all its services. */
export async function deleteColumn(input: { id: string }) {
  return runAdminAction(z.object({ id }), input, async (data, { supabase }) => {
    const { data: photos } = check(
      await supabase.from("services").select("photo_path").eq("column_id", data.id).not("photo_path", "is", null),
    );
    // services are removed by ON DELETE CASCADE
    check(await supabase.from("price_columns").delete().eq("id", data.id));
    await removePhotoFiles(supabase, (photos ?? []).map((p) => p.photo_path));
  });
}

/** Adds a service ("ბარათი") at the end of its column and returns the new row. */
export async function createService(input: { columnId: string; name: string; price: string }) {
  return runAdminAction(z.object({ columnId: id, name: serviceName, price }), input, async (data, { supabase }) => {
    const { data: last } = await supabase
      .from("services")
      .select("position")
      .eq("column_id", data.columnId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data: row } = check(
      await supabase
        .from("services")
        .insert({ column_id: data.columnId, name: data.name, price: data.price, position: (last?.position ?? -1) + 1 })
        .select()
        .single(),
    );
    return row!;
  });
}

/** Updates a service name and price. */
export async function updateService(input: { id: string; name: string; price: string }) {
  return runAdminAction(z.object({ id, name: serviceName, price }), input, async (data, { supabase }) => {
    check(await supabase.from("services").update({ name: data.name, price: data.price }).eq("id", data.id));
  });
}

/** Deletes one service. */
export async function deleteService(input: { id: string }) {
  return runAdminAction(z.object({ id }), input, async (data, { supabase }) => {
    const { data: row } = check(await supabase.from("services").select("photo_path").eq("id", data.id).maybeSingle());
    check(await supabase.from("services").delete().eq("id", data.id));
    await removePhotoFiles(supabase, [row?.photo_path ?? null]);
  });
}

const orderSchema = z.object({
  columns: z.array(id).max(50),
  services: z.record(id, z.array(id).max(200)),
});

/** Saves the full order: column positions and service positions within each column. */
export async function saveOrder(input: z.input<typeof orderSchema>) {
  return runAdminAction(orderSchema, input, async (data, { supabase }) => {
    const unknownColumn = Object.keys(data.services).some((c) => !data.columns.includes(c));
    if (unknownColumn) throw new UserError("რიგი არასწორია. განაახლეთ გვერდი.");

    const updates = [
      ...data.columns.map((columnId, position) =>
        supabase.from("price_columns").update({ position }).eq("id", columnId),
      ),
      ...Object.entries(data.services).flatMap(([columnId, ids]) =>
        ids.map((serviceId, position) =>
          supabase.from("services").update({ position }).eq("id", serviceId).eq("column_id", columnId),
        ),
      ),
    ];
    const results = await Promise.all(updates);
    results.forEach(check);
  });
}
