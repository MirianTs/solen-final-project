"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { CloseIcon, MenuIcon } from "./icons";

/** Hamburger toggle for the mobile header. The panel content is server-rendered and passed as children. */
export function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "მენიუს დახურვა" : "მენიუს გახსნა"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 items-center justify-center rounded-full text-fg hover:bg-card-raised md:hidden"
      >
        {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
      </button>

      <div
        id={panelId}
        hidden={!open}
        // Close the panel after an anchor link is followed.
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a[href^='#']")) setOpen(false);
        }}
        className="absolute inset-x-0 top-full border-b border-line bg-bg px-4 pb-6 pt-2 md:hidden"
      >
        {children}
      </div>
    </>
  );
}
