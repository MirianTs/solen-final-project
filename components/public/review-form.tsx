"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { submitReview } from "@/app/actions/submit-review";
import { StarIcon } from "./icons";
import { TurnstileWidget, type TurnstileHandle } from "./turnstile-widget";

const RATING_LABELS = ["ცუდი", "საშუალოზე დაბალი", "საშუალო", "კარგი", "შესანიშნავი"];

type FieldError = "rating" | "name" | "comment";

export function ReviewForm({ siteKey }: { siteKey: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; field?: FieldError } | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const turnstileRef = useRef<TurnstileHandle>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating < 1) return setError({ message: "აირჩიეთ შეფასება (1–5 ვარსკვლავი).", field: "rating" });
    if (!name.trim()) return setError({ message: "შეიყვანეთ სახელი.", field: "name" });
    if (!token) return setError({ message: "დაელოდეთ დაცვის შემოწმებას (ქვემოთ) და სცადეთ თავიდან." });

    startTransition(async () => {
      try {
        const result = await submitReview({ rating, name, comment, token });
        if (result.ok) {
          setDone(true);
          return;
        }
        setError({ message: result.error, field: result.field });
      } catch {
        setError({ message: "შეფასება ვერ გაიგზავნა. შეამოწმეთ ინტერნეტი და სცადეთ თავიდან." });
      }
      // Turnstile tokens are single-use: get a fresh one after any failed attempt.
      turnstileRef.current?.reset();
    });
  }

  if (done) {
    return (
      <div role="status" className="rounded-card border border-accent/40 bg-card p-6 text-center text-lg font-semibold">
        მადლობა! შეფასება გამოქვეყნდება მოდერაციის შემდეგ.
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="review-form-title"
      className="flex flex-col gap-5 rounded-card border border-line bg-card p-5 md:p-8"
    >
      <h3 id="review-form-title" className="text-2xl font-bold">
        დატოვეთ შეფასება
      </h3>

      <fieldset aria-describedby={error?.field === "rating" ? "review-error" : undefined}>
        <legend className="mb-2 text-sm font-semibold">შეფასება</legend>
        {/* Native radios: arrow keys move between stars, the visible star is the label. */}
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="group relative cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="peer sr-only"
              />
              <span className="sr-only">
                {n} ვარსკვლავი — {RATING_LABELS[n - 1]}
              </span>
              <StarIcon
                className={`size-11 rounded-lg p-1 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-ink ${
                  n <= shown ? "text-accent" : "text-neutral-500"
                }`}
              />
            </label>
          ))}
          <span className="ml-2 text-sm text-muted" aria-hidden>
            {shown ? RATING_LABELS[shown - 1] : ""}
          </span>
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="review-name" className="text-sm font-semibold">
          სახელი
        </label>
        <input
          id="review-name"
          value={name}
          maxLength={60}
          autoComplete="given-name"
          aria-required="true"
          onChange={(e) => setName(e.target.value)}
          aria-invalid={error?.field === "name" || undefined}
          aria-describedby={error?.field === "name" ? "review-error" : undefined}
          className="min-h-12 rounded-xl border border-line bg-bg px-4 text-base focus:border-accent-ink"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="review-comment" className="text-sm font-semibold">
            კომენტარი <span className="font-normal text-muted">(არასავალდებულო)</span>
          </label>
          <span className="text-xs text-muted">{comment.length}/1000</span>
        </div>
        <textarea
          id="review-comment"
          value={comment}
          rows={4}
          maxLength={1000}
          onChange={(e) => setComment(e.target.value)}
          aria-invalid={error?.field === "comment" || undefined}
          aria-describedby={error?.field === "comment" ? "review-error" : undefined}
          className="rounded-xl border border-line bg-bg px-4 py-3 text-base leading-relaxed focus:border-accent-ink"
        />
      </div>

      <TurnstileWidget ref={turnstileRef} siteKey={siteKey} onToken={setToken} />

      {error && (
        <p id="review-error" role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
          {error.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-7 text-lg font-bold text-black transition-colors hover:bg-accent-hover disabled:opacity-60 sm:w-fit"
      >
        {pending ? "იგზავნება…" : "გაგზავნა"}
      </button>
    </form>
  );
}
