"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PriceColumn } from "@/lib/content";
import { ArrowRightIcon, CloseIcon, FaucetIcon, FlameIcon, PhoneIcon, SnowflakeIcon, WrenchIcon } from "./icons";

const CARD_HOVER =
  "transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_50px_-20px_rgb(255_214_10/0.25)] motion-reduce:hover:translate-y-0";

/** "200₾-დან" → ["200₾", "-დან"], so the amount can be big and the suffix small. */
function splitPrice(price: string): [string, string] {
  const match = price.match(/^(.*?)\s*(-?დან)$/);
  return match ? [match[1], match[2]] : [price, ""];
}

/**
 * Category from the column title the admin typed. The rank keeps cards in the order
 * heating → AC → plumbing → others, since the admin can only append new columns.
 */
function category(title: string) {
  // AC and plumbing are checked first: "კონდიციონერის მომსახურება" must not match heating's "მომსახ".
  if (/კონდ|გაგრილ/.test(title)) return { rank: 1, Icon: SnowflakeIcon };
  if (/სანტ|აბაზ|წყალ|ონკ|უნიტ/.test(title)) return { rank: 2, Icon: FaucetIcon };
  if (/გათბ|ქვაბ|რადიატ|მომსახ/.test(title)) return { rank: 0, Icon: FlameIcon };
  return { rank: 3, Icon: WrenchIcon };
}

/** One card per price column; clicking a card opens its services and prices in a modal. */
type Props = { groups: PriceColumn[]; tel: string | null; phoneDisplay: string | null };

export function ServiceCategories({ groups, tel, phoneDisplay }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const open = groups.find((g) => g.id === openId) ?? null;
  // Stable sort: same-rank columns keep the admin's order.
  const sorted = groups
    .map((group) => ({ group, ...category(group.title) }))
    .sort((a, b) => a.rank - b.rank);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  // The page behind the modal must not scroll while it is open.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
        {sorted.map(({ group, Icon }) => {
          return (
            <li key={group.id} className="reveal">
              <button
                type="button"
                onClick={() => setOpenId(group.id)}
                aria-haspopup="dialog"
                className={`group flex h-full min-h-56 w-full flex-col justify-between gap-8 rounded-card border border-line bg-card p-7 text-left md:min-h-72 md:p-9 ${CARD_HOVER}`}
              >
                <span className="inline-flex size-16 items-center justify-center rounded-full bg-accent/10 text-accent-ink md:size-20">
                  <Icon className="size-8 md:size-10" />
                </span>
                <span className="flex flex-col gap-3">
                  <span className="text-2xl leading-snug font-bold lg:text-3xl">{group.title}</span>
                  <span className="inline-flex items-center gap-2 font-semibold text-accent-ink md:text-lg">
                    ნახეთ ფასები
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpenId(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close(); // click on backdrop
        }}
        className="m-auto w-[min(92vw,42rem)] rounded-card border border-line bg-card-raised p-0 text-fg backdrop:bg-black/80"
      >
        {open && (
          // No bottom padding with the call bar: sticky offsets count from the padding edge,
          // so padding would lift the bar over the last price.
          <div className={`flex max-h-[85vh] flex-col gap-5 overflow-y-auto p-6 md:p-8 ${tel ? "pb-0 md:pb-0" : ""}`}>
            <div className="flex items-center justify-between gap-4">
              <h3 id={titleId} className="text-2xl font-bold text-accent-ink">
                {open.title}
              </h3>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="დახურვა"
                className="-m-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-card hover:text-fg"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>
            {open.services.length === 0 && (
              <p className="leading-relaxed text-muted lg:text-lg">
                ფასი შეთანხმებით — დაგვიკავშირდით და გეტყვით ზუსტ ღირებულებას.
              </p>
            )}
            <ul className="flex flex-col divide-y divide-line empty:hidden">
              {open.services.map((service) => {
                const [amount, suffix] = splitPrice(service.price);
                return (
                  <li key={service.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <span className="leading-snug font-semibold lg:text-lg">{service.name}</span>
                    {service.price ? (
                      <span className="flex shrink-0 items-baseline gap-1 text-accent-ink">
                        <span className="text-2xl font-extrabold">{amount}</span>
                        {suffix && <span className="text-sm font-semibold">{suffix}</span>}
                      </span>
                    ) : (
                      <span className="shrink-0 text-sm text-muted">შეთანხმებით</span>
                    )}
                  </li>
                );
              })}
            </ul>
            {tel && (
              // Sticky so the call button stays visible when the price list scrolls.
              <div className="sticky bottom-0 -mx-6 border-t border-line bg-card-raised px-6 py-4 md:-mx-8 md:px-8 md:py-5">
                <a
                  href={tel}
                  className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-accent px-8 text-lg font-bold text-black transition hover:bg-accent-hover"
                >
                  <PhoneIcon className="size-5" />
                  დარეკე{phoneDisplay && <span className="font-semibold">· {phoneDisplay}</span>}
                </a>
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
