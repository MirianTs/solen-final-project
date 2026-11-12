import type { Metadata } from "next";
import { PricesEditor } from "@/components/admin/prices-editor";
import { requireAdmin } from "@/lib/auth";
import { groupPriceColumns } from "@/lib/prices";

export const metadata: Metadata = { title: "სერვისები და ფასები" };

export default async function PricesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: columns }, { data: services }] = await Promise.all([
    supabase.from("price_columns").select("id, title, position").order("position"),
    supabase.from("services").select("id, column_id, name, price, position").order("position"),
  ]);

  const initial = groupPriceColumns(columns, services);

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">სერვისები და ფასები</h1>
      <PricesEditor initial={initial} />
    </>
  );
}
