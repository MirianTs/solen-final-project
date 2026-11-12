import type { PriceColumn } from "@/lib/content";

type ColumnRow = { id: string; title: string };
type ServiceRow = { id: string; column_id: string; name: string; price: string };

/**
 * Nests services under their price column. Both lists keep the order they come in
 * (queried by `position`), so the result matches the order set in the admin.
 */
export function groupPriceColumns(columns: ColumnRow[] | null, services: ServiceRow[] | null): PriceColumn[] {
  return (columns ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    services: (services ?? [])
      .filter((s) => s.column_id === c.id)
      .map((s) => ({ id: s.id, name: s.name, price: s.price })),
  }));
}
