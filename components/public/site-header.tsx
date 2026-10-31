import type { ContactLinks } from "@/lib/contact";
import { ContactButtons } from "./contact-buttons";
import { PhoneIcon } from "./icons";
import { MobileMenu } from "./mobile-menu";

export const NAV_ITEMS = [
  { href: "#prices", label: "ფასები" },
  { href: "#services", label: "სერვისები" },
  { href: "#reviews", label: "შეფასებები" },
  { href: "#contact", label: "კონტაქტი" },
] as const;

export function SiteHeader({ links }: { links: ContactLinks }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <a href="#top" className="text-xl font-extrabold tracking-[0.2em] text-accent" aria-label="Solen — მთავარი">
          SOLEN
        </a>

        <nav aria-label="მთავარი ნავიგაცია" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-fg"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <ContactButtons links={links} variant="icon" />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {links.tel && (
            <a
              href={links.tel}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 font-bold text-black transition-colors hover:bg-accent-hover"
            >
              <PhoneIcon className="size-5" />
              დარეკე
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
