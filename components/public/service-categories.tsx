"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PriceColumn } from "@/lib/content";
import { ArrowRightIcon, CloseIcon, FaucetIcon, FlameIcon, SnowflakeIcon, WrenchIcon } from "./icons";

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
export function ServiceCategories({ groups }: { groups: PriceColumn[] }) {
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
                className={`group flex h-full w-full flex-col gap-6 rounded-card border border-line bg-card p-6 text-left md:p-8 ${CARD_HOVER}`}
              >
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-accent/10 text-accent-ink md:size-16">
                  <Icon className="size-7 md:size-8" />
                </span>
                <span className="flex flex-col gap-2">
                  <span className="text-xl font-bold lg:text-2xl">{group.title}</span>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-ink md:text-base">
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
          <div className="flex max-h-[85vh] flex-col gap-5 overflow-y-auto p-6 md:p-8">
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
          </div>
        )}
      </dialog>
    </>
  );
}
