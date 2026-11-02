import { Logo } from "@/components/ui/logo";
import type { ContactLinks } from "@/lib/contact";
import { ContactButtons } from "./contact-buttons";

type Props = { text: string; links: ContactLinks; address: string };

export function SiteFooter({ text, links, address }: Props) {
  const { phoneDisplay, tel } = links;
  // Rendered statically and revalidated hourly, so the year stays current.
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line">
      <div className="container-site flex flex-col gap-3 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <Logo adaptive className="h-7 w-auto" />
          {text && <span>{text}</span>}
          <div className="mt-2">
            <ContactButtons links={links} variant="social" />
          </div>
        </div>
        <div className="flex flex-col gap-1 md:items-end">
          {tel && phoneDisplay && (
            <a href={tel} className="font-semibold text-fg hover:text-accent-ink">
              {phoneDisplay}
            </a>
          )}
          {address && <span>{address}</span>}
          <span>© {year} Solen</span>
        </div>
      </div>
    </footer>
  );
}
