import { StarIcon } from "./icons";

/** Read-only star row. The accessible label carries the value; the icons are decorative. */
export function Stars({ rating, className = "size-4" }: { rating: number; className?: string }) {
  return (
    <span role="img" aria-label={`${rating} ვარსკვლავი 5-დან`} className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`${className} ${n <= rating ? "text-accent" : "text-line"}`} />
      ))}
    </span>
  );
}
