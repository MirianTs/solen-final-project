import type { PriceColumn } from "@/lib/content";
import { Section } from "./section";

export function Prices({ title, columns }: { title: string; columns: PriceColumn[] }) {
  if (columns.length === 0) return null;

  return (
    <Section id="prices" title={title}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {columns.map((column) => (
          <article key={column.id} className="rounded-card border border-line bg-card p-5 md:p-6">
            <h3 className="mb-4 text-xl font-bold text-accent">{column.title}</h3>
            {column.services.length > 0 ? (
              <ul className="divide-y divide-line">
                {column.services.map((service) => (
                  <li key={service.id} className="flex items-baseline justify-between gap-4 py-3">
                    <span>{service.name}</span>
                    <span className="shrink-0 font-bold whitespace-nowrap">{service.price}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">ფასი შეთანხმებით</p>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
