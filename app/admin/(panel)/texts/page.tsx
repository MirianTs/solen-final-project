import type { Metadata } from "next";
import { KeyValueForm } from "@/components/admin/key-value-form";
import { TEXT_FIELDS, TEXT_GROUPS } from "@/lib/admin-fields";
import { requireAdmin } from "@/lib/auth";
import { saveTexts } from "../../actions/content";

export const metadata: Metadata = { title: "ტექსტები" };

export default async function TextsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("texts").select("key, value");
  const stored = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  const initial = Object.fromEntries(TEXT_FIELDS.map((f) => [f.key, stored[f.key] ?? ""]));

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">ტექსტები</h1>
      <p className="mb-6 text-sm text-muted">ბლოკი, რომლის სათაურიც და ტექსტიც ცარიელია, საიტზე არ გამოჩნდება.</p>
      <KeyValueForm
        groups={TEXT_GROUPS.map((g) => ({
          title: g.title,
          fields: g.fields.map((f) => ({ key: f.key, label: f.label, multiline: f.multiline, max: f.max })),
        }))}
        initial={initial}
        save={saveTexts}
      />
    </>
  );
}
