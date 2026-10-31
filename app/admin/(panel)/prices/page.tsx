import type { Metadata } from "next";
import { PricesEditor } from "@/components/admin/prices-editor";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "ფასები" };

export default async function PricesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: columns }, { data: services }] = await Promise.all([
    supabase.from("price_columns").select("id, title, position").order("position"),
    supabase.from("services").select("id, column_id, name, price, position").order("position"),
  ]);

  const initial = (columns ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    services: (services ?? [])
      .filter((s) => s.column_id === c.id)
      .map((s) => ({ id: s.id, name: s.name, price: s.price })),
  }));

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">ფასები</h1>
      <PricesEditor initial={initial} />
    </>
  );
}
