import type { PriceColumn } from "@/lib/content";
import { Section } from "./section";
import { ServiceCategories } from "./service-categories";

type Props = { title: string; note: string; columns: PriceColumn[] };

/** Services with starting prices: one category card per price column, prices open in a modal. */
export function ServicesPrices({ title, note, columns }: Props) {
  // Empty columns still get a card (e.g. a new category before its prices are entered).
  const groups = columns;
  if (groups.length === 0) return null;

  return (
    <Section id="services" title={title}>
      {/* Old links to #prices land here too. */}
      <span id="prices" className="block scroll-mt-24" aria-hidden />
      {note && (
        <p className="reveal -mt-3 mb-7 max-w-3xl leading-relaxed text-muted md:-mt-5 md:mb-10 lg:text-lg">{note}</p>
      )}
      <ServiceCategories groups={groups} />
    </Section>
  );
}
