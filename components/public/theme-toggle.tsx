"use client";

import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import { MoonIcon, SunIcon } from "./icons";

/** Switches the public page between light and dark and remembers the choice. */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next: Theme = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage blocked (private mode): the switch still works for this visit.
    }
  }

  // The icon is picked by CSS from data-theme, so server and client render the same markup.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="ღია / მუქი რეჟიმის გადართვა"
      title="ღია / მუქი რეჟიმი"
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-fg transition-colors hover:bg-card-raised hover:text-accent-ink"
    >
      <SunIcon className="size-5 light:hidden" />
      <MoonIcon className="hidden size-5 light:block" />
    </button>
  );
}
