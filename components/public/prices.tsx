import type { PriceColumn } from "@/lib/content";
import { PriceList } from "./price-list";
import { Section } from "./section";

export function Prices({ title, columns }: { title: string; columns: PriceColumn[] }) {
  if (columns.length === 0) return null;

  return (
    <Section id="prices" title={title}>
      <PriceList columns={columns} />
    </Section>
  );
}
