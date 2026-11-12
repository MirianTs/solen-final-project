import type { Metadata } from "next";
import Link from "next/link";
import { ReviewActions } from "@/components/admin/review-actions";
import { Stars } from "@/components/public/stars";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { ReviewStatus } from "@/lib/supabase/database.types";

export const metadata: Metadata = { title: "შეფასებები" };

const TABS: { status: ReviewStatus; label: string }[] = [
  { status: "pending", label: "მოლოდინში" },
  { status: "approved", label: "გამოქვეყნებული" },
  { status: "hidden", label: "დამალული" },
];

const LIMIT = 100;

/** The ?status= value if it names one of the tabs (it may be missing, repeated or anything else). */
function isTabStatus(value: string | string[] | undefined): value is ReviewStatus {
  return TABS.some((t) => t.status === value);
}

export default async function ReviewsAdminPage({ searchParams }: PageProps<"/admin/reviews">) {
  const { supabase } = await requireAdmin();
  const { status: raw } = await searchParams;
  const status: ReviewStatus = isTabStatus(raw) ? raw : "pending";

  const countOf = (s: ReviewStatus) =>
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", s);

  const [list, ...counts] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, rating, name, comment, status, created_at")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(LIMIT),
    ...TABS.map((t) => countOf(t.status)),
  ]);
  const reviews = list.data ?? [];

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">შეფასებები</h1>

      <nav aria-label="სტატუსი" className="mb-6">
        <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {TABS.map((t, i) => {
            const active = t.status === status;
            return (
              <li key={t.status} className="shrink-0">
                <Link
                  href={`/admin/reviews?status=${t.status}`}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${
                    active ? "border-accent bg-accent text-black" : "border-line text-muted hover:text-fg"
                  }`}
                >
                  {t.label}
                  <span className={active ? "text-black/70" : "text-muted"}>{counts[i]?.count ?? 0}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {list.error && <p role="alert" className="text-red-400">შეფასებები ვერ ჩაიტვირთა. განაახლეთ გვერდი.</p>}

      {!list.error && reviews.length === 0 && (
        <p className="rounded-card border border-line bg-card p-6 text-muted">
          {status === "pending" ? "ახალი შეფასებები არ არის." : "აქ ჯერ არაფერია."}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {reviews.map((r) => (
          <li key={r.id} className="flex flex-col gap-3 rounded-card border border-line bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="font-bold">{r.name}</span>
                <Stars rating={r.rating} />
              </div>
              <time dateTime={r.created_at} className="text-sm text-muted">
                {formatDate(r.created_at)}
              </time>
            </div>
            {r.comment ? (
              <p className="leading-relaxed whitespace-pre-line">{r.comment}</p>
            ) : (
              <p className="text-sm text-muted">კომენტარის გარეშე</p>
            )}
            <ReviewActions id={r.id} status={r.status} name={r.name} />
          </li>
        ))}
      </ul>

      {reviews.length === LIMIT && (
        <p className="mt-4 text-sm text-muted">ნაჩვენებია ბოლო {LIMIT} შეფასება.</p>
      )}
    </>
  );
}
