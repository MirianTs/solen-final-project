"use client";

import { useEffect, useId, useRef } from "react";
import type { PublicReview } from "@/lib/content";
import { CloseIcon } from "./icons";
import { Stars } from "./stars";

/** Full review in a modal. Open while `review` is set; onClose clears it (Esc, backdrop, close button). */
export function ReviewDialog({ review, onClose }: { review: PublicReview | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (review && dialog && !dialog.open) dialog.showModal();
  }, [review]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current.close(); // click on backdrop
      }}
      className="m-auto w-[min(92vw,36rem)] rounded-card border border-line bg-card-raised p-0 text-fg backdrop:bg-black/80"
    >
      {review && (
        <div className="flex max-h-[85vh] flex-col gap-4 overflow-y-auto p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h2 id={titleId} className="text-xl font-bold">
                {review.name}
              </h2>
              <div className="flex items-center gap-3">
                <Stars rating={review.rating} />
                <time dateTime={review.created_at} className="text-sm text-muted">
                  {review.dateLabel}
                </time>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="დახურვა"
              className="-m-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-card hover:text-fg"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
          {review.comment ? (
            <p className="leading-relaxed whitespace-pre-line lg:text-lg">{review.comment}</p>
          ) : (
            <p className="text-muted">კომენტარი არ დაუწერია.</p>
          )}
        </div>
      )}
    </dialog>
  );
}
