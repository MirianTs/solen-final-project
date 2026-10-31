"use server";

import { z } from "zod";
import { check, runAdminAction, UserError } from "@/lib/admin-action";
import { plainText } from "@/lib/sanitize";

const id = z.uuid();
const title = z
  .string()
  .transform(plainText)
  .pipe(z.string().min(1, "სვეტის სათაური ცარიელია").max(100, "სათაური მაქსიმუმ 100 სიმბოლოა"));
const serviceName = z
  .string()
  .transform(plainText)
  .pipe(z.string().min(1, "სერვისის სახელი ცარიელია").max(200, "სახელი მაქსიმუმ 200 სიმბოლოა"));
const price = z.string().transform(plainText).pipe(z.string().max(100, "ფასი მაქსიმუმ 100 სიმბოლოა"));

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

export async function updateColumn(input: { id: string; title: string }) {
  return runAdminAction(z.object({ id, title }), input, async (data, { supabase }) => {
    check(await supabase.from("price_columns").update({ title: data.title }).eq("id", data.id));
  });
}

export async function deleteColumn(input: { id: string }) {
  return runAdminAction(z.object({ id }), input, async (data, { supabase }) => {
    // services are removed by ON DELETE CASCADE
    check(await supabase.from("price_columns").delete().eq("id", data.id));
  });
}

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

export async function updateService(input: { id: string; name: string; price: string }) {
  return runAdminAction(z.object({ id, name: serviceName, price }), input, async (data, { supabase }) => {
    check(await supabase.from("services").update({ name: data.name, price: data.price }).eq("id", data.id));
  });
}

export async function deleteService(input: { id: string }) {
  return runAdminAction(z.object({ id }), input, async (data, { supabase }) => {
    check(await supabase.from("services").delete().eq("id", data.id));
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
