import type { ContactLinks } from "@/lib/contact";
import { ContactButtons } from "./contact-buttons";
import { Section } from "./section";

type Props = { title: string; text: string; address: string; links: ContactLinks };

export function ContactSection({ title, text, address, links }: Props) {
  return (
    <Section id="contact" title={title}>
      <div className="grid gap-6 rounded-card border border-line bg-card p-5 md:grid-cols-[1fr_1.4fr] md:p-10">
        <div className="flex flex-col gap-3">
          {text && <p className="text-lg leading-relaxed">{text}</p>}
          {address && (
            <address className="text-muted not-italic">
              <span className="block text-sm font-semibold tracking-wide text-fg uppercase">მისამართი</span>
              {address}
            </address>
          )}
        </div>
        <ContactButtons links={links} variant="large" />
      </div>
    </Section>
  );
}
