"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_SECTIONS } from "@/lib/admin-sections";

/** Section tabs. Horizontally scrollable on phones. */
export function AdminNav({ pendingReviews }: { pendingReviews: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="ადმინის განყოფილებები" className="border-b border-line">
      <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none]">
        {ADMIN_SECTIONS.map((s) => {
          const active = pathname.startsWith(s.href);
          return (
            <li key={s.href} className="shrink-0">
              <Link
                href={s.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                  active ? "bg-accent text-black" : "text-muted hover:bg-card-raised hover:text-fg"
                }`}
              >
                {s.label}
                {s.href === "/admin/reviews" && pendingReviews > 0 && (
                  <span
                    className={`min-w-6 rounded-full px-1.5 text-center text-xs leading-6 font-bold ${
                      active ? "bg-black text-accent" : "bg-accent text-black"
                    }`}
                  >
                    {pendingReviews}
                    <span className="sr-only"> მოლოდინში</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
