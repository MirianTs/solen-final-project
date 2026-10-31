import type { ReactNode } from "react";

/** Page section with an anchor id and a heading. */
export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className="mx-auto w-full max-w-6xl px-4 py-14 md:py-20">
      <h2 id={headingId} className="mb-8 text-3xl font-extrabold md:text-4xl">
        <span className="mr-3 inline-block h-[0.8em] w-1.5 rounded-full bg-accent align-[-0.05em]" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}
