import type { ReactNode } from "react";

/** Page section with an anchor id and a heading. */
export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className="container-site py-12 md:py-20 lg:py-24">
      <h2 id={headingId} className="reveal mb-7 text-[1.75rem] font-extrabold md:mb-10 md:text-4xl lg:text-5xl">
        <span className="mr-3 inline-block h-[0.8em] w-1.5 rounded-full bg-accent align-[-0.05em]" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}
