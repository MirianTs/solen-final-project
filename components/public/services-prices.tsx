import type { PriceColumn } from "@/lib/content";
import { Section } from "./section";

const CARD_HOVER =
  "transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_50px_-20px_rgb(255_214_10/0.25)] motion-reduce:hover:translate-y-0";

/** "200₾-დან" → ["200₾", "-დან"], so the amount can be big and the suffix small. */
function splitPrice(price: string): [string, string] {
  const match = price.match(/^(.*?)\s*(-?დან)$/);
  return match ? [match[1], match[2]] : [price, ""];
}

type Props = { title: string; note: string; columns: PriceColumn[] };

/** Services with starting prices: one card per service, grouped by column (group titles only when there are several). */
export function ServicesPrices({ title, note, columns }: Props) {
  const groups = columns.filter((c) => c.services.length > 0);
  if (groups.length === 0) return null;
  const showGroupTitles = groups.length > 1;

  return (
    <Section id="services" title={title}>
      {/* Old links to #prices land here too. */}
      <span id="prices" className="block scroll-mt-24" aria-hidden />
      {note && (
        <p className="reveal -mt-3 mb-7 max-w-3xl leading-relaxed text-muted md:-mt-5 md:mb-10 lg:text-lg">{note}</p>
      )}

      <div className="flex flex-col gap-10 md:gap-14">
        {groups.map((group) => (
          <section key={group.id} aria-label={showGroupTitles ? undefined : group.title}>
            {showGroupTitles && (
              <h3 className="reveal mb-4 text-xl font-bold text-accent-ink md:mb-6 lg:text-2xl">{group.title}</h3>
            )}
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
              {group.services.map((service) => {
                const [amount, suffix] = splitPrice(service.price);
                return (
                  <li
                    key={service.id}
                    className={`reveal flex flex-col justify-between gap-4 rounded-card border border-line bg-card p-5 md:p-6 ${CARD_HOVER}`}
                  >
                    <h4 className="text-lg leading-snug font-bold lg:text-xl">{service.name}</h4>
                    {service.price ? (
                      <p className="flex items-baseline gap-1 text-accent-ink">
                        <span className="text-3xl font-extrabold lg:text-4xl">{amount}</span>
                        {suffix && <span className="text-lg font-semibold">{suffix}</span>}
                      </p>
                    ) : (
                      <p className="text-muted">ფასი შეთანხმებით</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  );
}
