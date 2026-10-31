import Image from "next/image";
import type { Photo } from "@/lib/content";
import { Section } from "./section";

export type FeatureBlock = { key: string; title: string; text: string; photo?: Photo };

/** P1–P4: photo + title + text, alternating sides on desktop. Empty blocks are skipped. */
export function FeatureBlocks({ title, blocks }: { title: string; blocks: FeatureBlock[] }) {
  const visible = blocks.filter((b) => b.title.trim() || b.text.trim());
  if (visible.length === 0) return null;

  return (
    <Section id="services" title={title}>
      <div className="flex flex-col gap-6 md:gap-10">
        {visible.map((block, i) => (
          <article
            key={block.key}
            className="grid items-center gap-5 overflow-hidden rounded-card border border-line bg-card md:grid-cols-2 md:gap-0"
          >
            {block.photo && (
              <Image
                src={block.photo.url}
                alt={block.photo.alt}
                width={block.photo.width}
                height={block.photo.height}
                loading="lazy"
                sizes="(min-width: 768px) 50vw, 100vw"
                className={`aspect-[4/3] size-full object-cover ${i % 2 === 1 ? "md:order-2" : ""}`}
              />
            )}
            <div className={`flex flex-col gap-3 p-5 md:p-10 ${block.photo ? "" : "md:col-span-2"}`}>
              {block.title && <h3 className="text-2xl font-bold">{block.title}</h3>}
              {block.text && <p className="leading-relaxed whitespace-pre-line text-muted">{block.text}</p>}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
