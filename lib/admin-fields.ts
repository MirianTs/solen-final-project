// Editable keys of the `texts` and `settings` tables with their Georgian admin labels.
// Shared by the admin forms and the server actions (which reject unknown keys).

// visibleKey: a second `texts` key holding "1" (shown) or "0" (hidden), edited with an on/off switch.
export type TextField = { key: string; label: string; multiline: boolean; max: number; visibleKey?: string };

export const TEXT_GROUPS: { title: string; fields: TextField[] }[] = [
  {
    title: "მთავარი ბანერი",
    fields: [{ key: "hero_slogan", label: "სლოგანი", multiline: true, max: 200, visibleKey: "hero_slogan_visible" }],
  },
  {
    title: "სექციების სათაურები",
    fields: [
      { key: "services_title", label: "სერვისები და ფასები", multiline: false, max: 80 },
      { key: "reviews_title", label: "შეფასებები", multiline: false, max: 80 },
      { key: "contact_title", label: "კონტაქტი", multiline: false, max: 80 },
    ],
  },
  {
    title: "სერვისები და ფასები",
    fields: [{ key: "prices_note", label: "შენიშვნა ფასებზე (სათაურის ქვეშ)", multiline: true, max: 300 }],
  },
  {
    title: "კონტაქტი და ფუტერი",
    fields: [
      { key: "contact_text", label: "კონტაქტის ტექსტი", multiline: true, max: 500 },
      { key: "footer_text", label: "ფუტერის ტექსტი", multiline: false, max: 200 },
    ],
  },
];

/** Flat list; fullLabel names the group too ("ბლოკი P2 — სათაური") for error messages. */
export const TEXT_FIELDS = TEXT_GROUPS.flatMap((g) => g.fields.map((f) => ({ ...f, fullLabel: `${g.title} — ${f.label}` })));

export type SettingKind = "phone" | "url" | "text";
export type SettingField = { key: string; label: string; kind: SettingKind; hint?: string; placeholder?: string };

export const SETTING_FIELDS: SettingField[] = [
  { key: "phone", label: "ტელეფონი", kind: "phone", placeholder: "+995 5XX XX XX XX" },
  { key: "viber", label: "Viber-ის ნომერი", kind: "phone", placeholder: "+995 5XX XX XX XX" },
  { key: "whatsapp", label: "WhatsApp-ის ნომერი", kind: "phone", placeholder: "+995 5XX XX XX XX" },
  { key: "facebook_url", label: "Facebook-ის ბმული", kind: "url", placeholder: "https://facebook.com/..." },
  { key: "maps_url", label: "Google Maps-ის ბმული", kind: "url", placeholder: "https://maps.app.goo.gl/..." },
  {
    key: "google_review_url",
    label: "Google-ზე შეფასების ბმული",
    kind: "url",
    placeholder: "https://g.page/r/.../review",
  },
  { key: "address_text", label: "მისამართი", kind: "text", placeholder: "თბილისი, ..." },
];

export const SETTINGS_HINT = "ცარიელი ველის ღილაკი საიტზე არ გამოჩნდება.";
