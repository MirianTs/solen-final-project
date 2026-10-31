import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { default: "ადმინი — Solen", template: "%s — Solen ადმინი" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      {children}
      <Toaster theme="dark" position="top-center" richColors closeButton />
    </>
  );
}
