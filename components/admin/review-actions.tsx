"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteReview, setReviewStatus } from "@/app/admin/actions/reviews";
import type { ReviewStatus } from "@/lib/supabase/database.types";

const SUCCESS: Record<ReviewStatus, string> = {
  approved: "შეფასება გამოქვეყნდა",
  hidden: "შეფასება დაიმალა",
  pending: "შეფასება დაბრუნდა მოლოდინში",
};

/** Approve / hide / delete buttons for one review. The list refreshes via revalidatePath. */
export function ReviewActions({ id, status, name }: { id: string; status: ReviewStatus; name: string }) {
  const [pending, startTransition] = useTransition();

  function setStatus(next: ReviewStatus) {
    startTransition(async () => {
      const result = await setReviewStatus({ id, status: next });
      if (result.ok) toast.success(SUCCESS[next]);
      else toast.error(result.error);
    });
  }

  function remove() {
    if (!window.confirm(`წავშალო „${name}“-ის შეფასება სამუდამოდ?`)) return;
    startTransition(async () => {
      const result = await deleteReview({ id });
      if (result.ok) toast.success("შეფასება წაიშალა");
      else toast.error(result.error);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "approved" && (
        <button type="button" disabled={pending} onClick={() => setStatus("approved")} className="admin-btn-primary min-h-10 px-5 text-sm">
          დადასტურება
        </button>
      )}
      {status !== "hidden" && (
        <button type="button" disabled={pending} onClick={() => setStatus("hidden")} className="admin-btn-ghost">
          დამალვა
        </button>
      )}
      {status === "hidden" && (
        <button type="button" disabled={pending} onClick={() => setStatus("pending")} className="admin-btn-ghost">
          მოლოდინში დაბრუნება
        </button>
      )}
      <button type="button" disabled={pending} onClick={remove} className="admin-btn-danger">
        წაშლა
      </button>
    </div>
  );
}
