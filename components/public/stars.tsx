import { StarIcon } from "./icons";

/**
 * Read-only star row. The accessible label carries the value; the icons are decorative.
 * Pass `label` when the stars show a rounded value (e.g. the average) so the exact one is announced.
 */
export function Stars({ rating, className = "size-4", label }: { rating: number; className?: string; label?: string }) {
  return (
    <span role="img" aria-label={label ?? `${rating} ვარსკვლავი 5-დან`} className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`${className} ${n <= rating ? "text-accent" : "text-line"}`} />
      ))}
    </span>
  );
}
