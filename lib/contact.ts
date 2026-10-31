// Builds contact links from raw settings values. Every builder returns null for empty input,
// so callers can hide the matching button.

export type ContactLinks = {
  phoneDisplay: string | null;
  tel: string | null;
  viberMobile: string | null;
  viberDisplay: string | null;
  whatsapp: string | null;
  facebook: string | null;
  maps: string | null;
};

export function digitsOnly(value: string | undefined | null): string {
  return (value ?? "").replace(/\D/g, "");
}

function safeHttpUrl(value: string | undefined | null): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  try {
    const url = new URL(v);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** "+995568883279" -> "+995 568 88 32 79" (Georgian mobile format); other numbers are returned as "+<digits>". */
export function formatPhone(value: string | undefined | null): string | null {
  const d = digitsOnly(value);
  if (!d) return null;
  if (d.length === 12 && d.startsWith("995")) {
    return `+995 ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
  }
  return `+${d}`;
}

export function buildContactLinks(settings: Record<string, string>): ContactLinks {
  const phone = digitsOnly(settings.phone);
  const viber = digitsOnly(settings.viber);
  const whatsapp = digitsOnly(settings.whatsapp);

  return {
    phoneDisplay: formatPhone(phone),
    tel: phone ? `tel:+${phone}` : null,
    viberMobile: viber ? `viber://chat?number=%2B${viber}` : null,
    viberDisplay: formatPhone(viber),
    whatsapp: whatsapp ? `https://wa.me/${whatsapp}` : null,
    facebook: safeHttpUrl(settings.facebook_url),
    maps: safeHttpUrl(settings.maps_url),
  };
}

export { safeHttpUrl };
