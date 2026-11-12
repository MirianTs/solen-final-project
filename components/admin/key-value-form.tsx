"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/admin-action";

export type KVField = {
  key: string;
  label: string;
  multiline?: boolean;
  max?: number;
  type?: "text" | "tel" | "url";
  placeholder?: string;
  /** Key of a "1"/"0" value shown as an on/off switch next to the label. */
  visibleKey?: string;
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

  function onSubmit(e: FormEvent) {
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
            const visibleKey = f.visibleKey;
            const visible = visibleKey ? values[visibleKey] !== "0" : true;
            const counterId = `${id}-count`;
            const tooLong = f.max !== undefined && value.length > f.max;
            return (
              <div key={f.key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor={id} className="text-sm font-semibold">
                    {f.label}
                  </label>
                  <div className="flex items-center gap-4">
                    {f.max && (
                      <span id={counterId} className={`text-xs ${tooLong ? "text-red-400" : "text-muted"}`}>
                        {value.length}/{f.max}
                      </span>
                    )}
                    {visibleKey && (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={visible}
                        aria-label={`${f.label} — საიტზე ჩვენება`}
                        onClick={() => setValues((v) => ({ ...v, [visibleKey]: visible ? "0" : "1" }))}
                        className="flex items-center gap-2 rounded-full text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                      >
                        <span className={visible ? "text-accent" : "text-muted"}>{visible ? "ჩანს" : "დამალულია"}</span>
                        <span
                          aria-hidden
                          className={`relative h-6 w-11 rounded-full transition-colors ${visible ? "bg-accent" : "bg-line"}`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-black transition-transform motion-reduce:transition-none ${visible ? "translate-x-5" : ""}`}
                          />
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                {f.multiline ? (
                  <textarea
                    id={id}
                    rows={f.max && f.max > 300 ? 6 : 3}
                    value={value}
                    placeholder={f.placeholder}
                    aria-describedby={f.max ? counterId : undefined}
                    aria-invalid={tooLong || undefined}
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
                    aria-describedby={f.max ? counterId : undefined}
                    aria-invalid={tooLong || undefined}
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
