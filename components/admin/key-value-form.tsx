"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/admin-action";

export type KVField = {
  key: string;
  label: string;
  multiline?: boolean;
  max?: number;
  type?: "text" | "tel" | "url";
  placeholder?: string;
};

type Props = {
  groups: { title: string; fields: KVField[] }[];
  initial: Record<string, string>;
  save: (values: Record<string, string>) => Promise<ActionResult<Record<string, string>>>;
  intro?: ReactNode;
};

/** Generic form for key/value tables (texts, settings). Saves all fields in one server action. */
export function KeyValueForm({ groups, initial, save, intro }: Props) {
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();
  const dirty = Object.keys(values).some((k) => values[k] !== saved[k]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await save(values);
      if (result.ok) {
        // Values come back normalized (trimmed, phones as "+995568...").
        const next = { ...values, ...result.data };
        setValues(next);
        setSaved(next);
        toast.success("შენახულია");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6 pb-24">
      {intro}
      {groups.map((group) => (
        <fieldset key={group.title} className="flex flex-col gap-4 rounded-card border border-line bg-card p-4 sm:p-6">
          <legend className="px-1 text-sm font-bold tracking-wide text-accent">{group.title}</legend>
          {group.fields.map((f) => {
            const value = values[f.key] ?? "";
            const id = `field-${f.key}`;
            return (
              <div key={f.key} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={id} className="text-sm font-semibold">
                    {f.label}
                  </label>
                  {f.max && (
                    <span className={`text-xs ${value.length > f.max ? "text-red-400" : "text-muted"}`}>
                      {value.length}/{f.max}
                    </span>
                  )}
                </div>
                {f.multiline ? (
                  <textarea
                    id={id}
                    rows={f.max && f.max > 300 ? 6 : 3}
                    value={value}
                    placeholder={f.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    className="admin-input py-3 leading-relaxed"
                  />
                ) : (
                  <input
                    id={id}
                    type={f.type ?? "text"}
                    inputMode={f.type === "tel" ? "tel" : f.type === "url" ? "url" : undefined}
                    value={value}
                    placeholder={f.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    className="admin-input"
                  />
                )}
              </div>
            );
          })}
        </fieldset>
      ))}

      {/* Sticky save bar: easy to reach on a phone. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3">
          {dirty && <span className="text-sm text-muted">შეუნახავი ცვლილებები</span>}
          <button type="submit" disabled={pending || !dirty} className="admin-btn-primary">
            {pending ? "ინახება…" : "შენახვა"}
          </button>
        </div>
      </div>
    </form>
  );
}
