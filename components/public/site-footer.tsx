type Props = { text: string; phoneDisplay: string | null; tel: string | null; address: string };

export function SiteFooter({ text, phoneDisplay, tel, address }: Props) {
  // Rendered statically and revalidated hourly, so the year stays current.
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line">
      <div className="container-site flex flex-col gap-3 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-extrabold tracking-[0.2em] text-accent-ink">SOLEN</span>
          {text && <span>{text}</span>}
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
