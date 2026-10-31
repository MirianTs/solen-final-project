import type { Metadata, Viewport } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";

const notoGeorgian = Noto_Sans_Georgian({
  variable: "--font-noto-georgian",
  subsets: ["georgian", "latin"],
  display: "swap",
});

// Full SEO metadata (metadataBase, Open Graph, JSON-LD) is added in Phase 7.
export const metadata: Metadata = {
  title: "Solen — გათბობა და კონდიციონერები",
  description: "გათბობის, რადიატორებისა და კონდიციონერების მონტაჟი და მომსახურება თბილისში.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ka" data-scroll-behavior="smooth" className={`${notoGeorgian.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg text-fg">{children}</body>
    </html>
  );
}
