import type { Metadata } from "next";
import { KeyValueForm } from "@/components/admin/key-value-form";
import { SETTING_FIELDS, SETTINGS_HINT } from "@/lib/admin-fields";
import { requireAdmin } from "@/lib/auth";
import { saveSettings } from "../../actions/content";

export const metadata: Metadata = { title: "კონტაქტები" };

export default async function ContactsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("settings").select("key, value");
  const stored = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  const initial = Object.fromEntries(SETTING_FIELDS.map((f) => [f.key, stored[f.key] ?? ""]));

  const phones = SETTING_FIELDS.filter((f) => f.kind === "phone");
  const others = SETTING_FIELDS.filter((f) => f.kind !== "phone");
  const toField = (f: (typeof SETTING_FIELDS)[number]) => ({
    key: f.key,
    label: f.label,
    placeholder: f.placeholder,
    type: f.kind === "phone" ? ("tel" as const) : f.kind === "url" ? ("url" as const) : ("text" as const),
  });

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">კონტაქტები</h1>
      <p className="mb-6 text-sm text-muted">{SETTINGS_HINT}</p>
      <KeyValueForm
        groups={[
          { title: "ნომრები", fields: phones.map(toField) },
          { title: "ბმულები და მისამართი", fields: others.map(toField) },
        ]}
        initial={initial}
        save={saveSettings}
      />
    </>
  );
}
