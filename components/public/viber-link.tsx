"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { DialogCloseButton } from "./dialog-close-button";

type Props = {
  href: string;
  numberDisplay: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
};

/**
 * Viber link. On touch devices it opens the Viber app directly.
 * On desktop (fine pointer) it opens a modal with the number, a QR code and a "Viber Desktop" button.
 */
export function ViberLink({ href, numberDisplay, className, ariaLabel, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const [qr, setQr] = useState<string | null>(null);
  const titleId = useId();

  async function openModal() {
    dialogRef.current?.showModal();
    if (!qr) {
      // Loaded on demand so the QR library is not part of the initial page JS.
      const QRCode = await import("qrcode");
      const dataUrl = await QRCode.toDataURL(href, {
        width: 240,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQr(dataUrl);
    }
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  return (
    <>
      <a
        ref={triggerRef}
        href={href}
        aria-label={ariaLabel}
        className={className}
        onClick={(e) => {
          if (window.matchMedia("(pointer: coarse)").matches) return; // phone: let the viber:// link open
          e.preventDefault();
          void openModal();
        }}
      >
        {children}
      </a>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => triggerRef.current?.focus()}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeModal(); // click on backdrop
        }}
        className="m-auto w-[min(92vw,22rem)] rounded-card border border-line bg-card-raised p-0 text-fg backdrop:bg-black/80"
      >
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="flex w-full items-start justify-between gap-4">
            <h2 id={titleId} className="text-left text-lg font-bold">
              მოგვწერეთ Viber-ში
            </h2>
            <DialogCloseButton onClick={closeModal} />
          </div>

          <p className="text-2xl font-bold tracking-wide text-accent-ink">{numberDisplay}</p>

          <div className="flex size-[200px] items-center justify-center rounded-xl bg-white p-2">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL, nothing to optimize
              <img src={qr} alt="Viber-ის QR კოდი" width={184} height={184} className="size-full" />
            ) : (
              <span className="text-sm text-neutral-500">იტვირთება…</span>
            )}
          </div>

          <p className="text-sm text-muted">დაასკანერეთ ტელეფონის კამერით</p>

          <a
            href={href}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line px-5 font-semibold transition-colors hover:border-accent-ink hover:text-accent-ink"
          >
            Viber Desktop-ში გახსნა
          </a>
        </div>
      </dialog>
    </>
  );
}
