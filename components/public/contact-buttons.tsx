import type { ContactLinks } from "@/lib/contact";
import { FacebookIcon, MapPinIcon, PhoneIcon, ViberIcon, WhatsAppIcon } from "./icons";
import { ViberLink } from "./viber-link";

type Variant = "icon" | "large";

const styles: Record<Variant, { link: string; icon: string; list: string }> = {
  icon: {
    list: "flex items-center gap-1",
    link: "inline-flex size-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-card-raised hover:text-accent",
    icon: "size-5",
  },
  large: {
    list: "grid gap-3 sm:grid-cols-2",
    link: "flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-card-raised px-5 text-lg font-semibold transition hover:-translate-y-0.5 hover:border-accent hover:text-accent motion-reduce:hover:translate-y-0",
    icon: "size-6 shrink-0 text-accent",
  },
};

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Contact links (phone, Viber, WhatsApp, Facebook, map). Any link with an empty setting is hidden. */
export function ContactButtons({ links, variant }: { links: ContactLinks; variant: Variant }) {
  const s = styles[variant];
  const large = variant === "large";

  const items = [
    links.tel && (
      <a href={links.tel} className={s.link} aria-label={large ? undefined : "დარეკვა"}>
        <PhoneIcon className={s.icon} />
        {large && <span>{links.phoneDisplay}</span>}
      </a>
    ),
    links.viberMobile && links.viberDisplay && (
      <ViberLink
        href={links.viberMobile}
        numberDisplay={links.viberDisplay}
        className={s.link}
        ariaLabel={large ? undefined : "Viber"}
      >
        <ViberIcon className={s.icon} />
        {large && <span>Viber</span>}
      </ViberLink>
    ),
    links.whatsapp && (
      <a href={links.whatsapp} {...external} className={s.link} aria-label={large ? undefined : "WhatsApp"}>
        <WhatsAppIcon className={s.icon} />
        {large && <span>WhatsApp</span>}
      </a>
    ),
    links.facebook && (
      <a href={links.facebook} {...external} className={s.link} aria-label={large ? undefined : "Facebook"}>
        <FacebookIcon className={s.icon} />
        {large && <span>Facebook</span>}
      </a>
    ),
    links.maps && (
      <a href={links.maps} {...external} className={s.link} aria-label={large ? undefined : "მისამართი რუკაზე"}>
        <MapPinIcon className={s.icon} />
        {large && <span>რუკაზე ნახვა</span>}
      </a>
    ),
  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <ul className={s.list}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
