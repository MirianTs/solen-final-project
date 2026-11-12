// Admin panel sections, shared by the dashboard tiles (/admin) and the tab bar (AdminNav).
export const ADMIN_SECTIONS = [
  { href: "/admin/prices", label: "სერვისები და ფასები", description: "სექციები და ბარათები ფასებით" },
  { href: "/admin/photos", label: "ფოტოები", description: "ბანერი და გაზიარების ფოტო" },
  { href: "/admin/texts", label: "ტექსტები", description: "სლოგანი, სათაურები და ტექსტები" },
  { href: "/admin/contacts", label: "კონტაქტები", description: "ტელეფონი, Viber, WhatsApp, ბმულები" },
  { href: "/admin/reviews", label: "შეფასებები", description: "ახალი შეფასებების დადასტურება" },
  { href: "/admin/account", label: "პაროლი", description: "შესვლის პაროლის შეცვლა" },
] as const;
