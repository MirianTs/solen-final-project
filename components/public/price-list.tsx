"use client";

import Image from "next/image";
import { useState } from "react";
import type { PriceColumn, PriceItem } from "@/lib/content";

const ALL = "all";

const CARD_HOVER =
  "transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_50px_-20px_rgb(255_214_10/0.25)] motion-reduce:hover:translate-y-0";

/** "ქვაბები — იტალია" → "იტალია": a column title's last part is short enough for a filter chip. */
function chipLabel(title: string): string {
  return title.split(" — ").at(-1)?.trim() || title;
}

/** A column with at least one photo is a product catalog (one card per item); others are a plain price list. */
function isCatalog(column: PriceColumn): boolean {
  return column.services.some((s) => s.photo);
}

/** Price columns with filter chips (all / one column, e.g. one country of boilers). */
export function PriceList({ columns }: { columns: PriceColumn[] }) {
  const [active, setActive] = useState(ALL);
  const shown = active === ALL ? columns : columns.filter((c) => c.id === active);
  const lists = shown.filter((c) => !isCatalog(c));
  const catalogs = shown.filter(isCatalog);
  const chips = [{ id: ALL, label: "ყველა" }, ...columns.map((c) => ({ id: c.id, label: chipLabel(c.title) }))];

  return (
    <>
      {columns.length > 1 && (
        <div role="group" aria-label="ფასების ფილტრი" className="mb-6 flex flex-wrap gap-2 md:mb-8">
          {chips.map((chip) => {
            const on = chip.id === active;
            return (
              <button
                key={chip.id}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(chip.id)}
                className={`min-h-11 rounded-full border px-5 font-semibold transition-colors ${
                  on
                    ? "border-accent bg-accent text-black"
                    : "border-line bg-card text-fg hover:border-accent-ink hover:text-accent-ink"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-10 md:gap-14">
        {lists.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {lists.map((column) => (
              <ListCard key={column.id} column={column} />
            ))}
          </div>
        )}
        {catalogs.map((column) => (
          <Catalog key={column.id} column={column} />
        ))}
      </div>
    </>
  );
}

function ListCard({ column }: { column: PriceColumn }) {
  return (
    <article className={`reveal rounded-card border border-line bg-card p-5 md:p-7 ${CARD_HOVER}`}>
      <h3 className="mb-4 text-xl font-bold text-accent-ink lg:text-2xl">{column.title}</h3>
      {column.services.length > 0 ? (
        <ul className="divide-y divide-line">
          {column.services.map((service) => (
            <li key={service.id} className="flex items-baseline justify-between gap-4 py-3 lg:text-lg">
              <span>{service.name}</span>
              <span className="shrink-0 font-bold whitespace-nowrap">{service.price}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">ფასი შეთანხმებით</p>
      )}
    </article>
  );
}

function Catalog({ column }: { column: PriceColumn }) {
  return (
    <section aria-label={column.title}>
      <h3 className="reveal mb-4 text-xl font-bold text-accent-ink md:mb-6 lg:text-2xl">{column.title}</h3>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {column.services.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function ProductCard({ item }: { item: PriceItem }) {
  return (
    <li className={`reveal flex flex-col overflow-hidden rounded-card border border-line bg-card ${CARD_HOVER}`}>
      {/* White behind the photo so non-square product shots (usually on white) blend in, in both themes. */}
      <div className="flex aspect-square items-center justify-center bg-white">
        {item.photo ? (
          <Image
            src={item.photo.url}
            alt={item.photo.alt}
            width={item.photo.width}
            height={item.photo.height}
            sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 50vw"
            loading="lazy"
            className="size-full object-contain"
          />
        ) : (
          <span className="text-sm text-neutral-400">ფოტო არ არის</span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2 p-3 sm:p-4">
        <span className="leading-snug font-semibold sm:text-lg">{item.name}</span>
        <span className="text-lg font-extrabold text-accent-ink sm:text-xl">{item.price}</span>
      </div>
    </li>
  );
}
