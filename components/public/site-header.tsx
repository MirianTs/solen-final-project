import type { ContactLinks } from "@/lib/contact";
import { ContactButtons } from "./contact-buttons";
import { PhoneIcon } from "./icons";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";

export const NAV_ITEMS = [
  { href: "#prices", label: "ფასები" },
  { href: "#services", label: "სერვისები" },
  { href: "#reviews", label: "შეფასებები" },
  { href: "#contact", label: "კონტაქტი" },
] as const;

export function SiteHeader({ links }: { links: ContactLinks }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
      <div className="container-site relative flex h-16 items-center justify-between gap-2 lg:h-20">
        <a href="#top" className="text-xl font-extrabold tracking-[0.2em] text-accent-ink lg:text-2xl" aria-label="Solen — მთავარი">
          SOLEN
        </a>

        <nav aria-label="მთავარი ნავიგაცია" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-accent-ink lg:px-4 lg:text-base"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <ContactButtons links={links} variant="icon" />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          {links.tel && (
            <a
              href={links.tel}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-accent font-bold text-black transition-colors hover:bg-accent-hover min-[360px]:px-4"
            >
              <PhoneIcon className="size-5" />
              {/* Icon-only on the narrowest phones so the header fits next to the theme switch. */}
              <span className="sr-only min-[360px]:not-sr-only">დარეკე</span>
            </a>
          )}
          <MobileMenu>
            <nav aria-label="მობილური ნავიგაცია">
              <ul className="flex flex-col">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="block rounded-xl px-3 py-3 text-lg font-semibold hover:bg-card">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-4 border-t border-line pt-4">
              <ContactButtons links={links} variant="icon" />
            </div>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
