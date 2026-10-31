"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createColumn,
  createService,
  deleteColumn,
  deleteService,
  deleteServicePhoto,
  saveOrder,
  saveServicePhoto,
  updateColumn,
  updateService,
} from "@/app/admin/actions/prices";
import { compressToWebp } from "@/lib/compress-image";
import { newServicePhotoPath, SERVICE_PHOTO_MAX_WIDTH } from "@/lib/photo-slots";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { SortableItem, SortableList } from "./sortable";

type Service = Pick<Tables<"services">, "id" | "name" | "price"> & { photoUrl: string | null };
type Column = { id: string; title: string; services: Service[] };

export function PricesEditor({ initial }: { initial: Column[] }) {
  const [columns, setColumns] = useState(initial);
  const [, startTransition] = useTransition();

  function persistOrder(next: Column[], previous: Column[]) {
    setColumns(next);
    startTransition(async () => {
      const result = await saveOrder({
        columns: next.map((c) => c.id),
        services: Object.fromEntries(next.map((c) => [c.id, c.services.map((s) => s.id)])),
      });
      if (result.ok) {
        toast.success("რიგი შენახულია");
      } else {
        setColumns(previous);
        toast.error(result.error);
      }
    });
  }

  function patchColumn(id: string, fn: (c: Column) => Column) {
    setColumns((cols) => cols.map((c) => (c.id === id ? fn(c) : c)));
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted">
        რიგის შესაცვლელად გადაათრიეთ ⠿ ღილაკით (ტელეფონზე — ხანგრძლივი დაჭერით). რიგი ავტომატურად ინახება.
      </p>

      {columns.length === 0 && <p className="text-muted">სვეტები ჯერ არ არის. დაამატეთ ქვემოთ.</p>}

      <SortableList items={columns} onReorder={(next) => persistOrder(next, columns)}>
        <ul className="flex flex-col gap-5">
          {columns.map((column) => (
            <SortableItem
              key={column.id}
              id={column.id}
              handleLabel={`სვეტის „${column.title}“ გადაადგილება`}
              className="rounded-card border border-line bg-card"
            >
              {(handle) => (
                <ColumnCard
                  handle={handle}
                  column={column}
                  onRenamed={(title) => patchColumn(column.id, (c) => ({ ...c, title }))}
                  onDeleted={() => setColumns((cols) => cols.filter((c) => c.id !== column.id))}
                  onServicesReordered={(services) =>
                    persistOrder(
                      columns.map((c) => (c.id === column.id ? { ...c, services } : c)),
                      columns,
                    )
                  }
                  onServiceAdded={(s) => patchColumn(column.id, (c) => ({ ...c, services: [...c.services, s] }))}
                  onServiceChanged={(s) =>
                    patchColumn(column.id, (c) => ({ ...c, services: c.services.map((x) => (x.id === s.id ? s : x)) }))
                  }
                  onServiceDeleted={(sid) =>
                    patchColumn(column.id, (c) => ({ ...c, services: c.services.filter((x) => x.id !== sid) }))
                  }
                />
              )}
            </SortableItem>
          ))}
        </ul>
      </SortableList>

      <AddColumnForm onAdded={(c) => setColumns((cols) => [...cols, c])} />
    </div>
  );
}

function ColumnCard({
  handle,
  column,
  onRenamed,
  onDeleted,
  onServicesReordered,
  onServiceAdded,
  onServiceChanged,
  onServiceDeleted,
}: {
  handle: React.ReactNode;
  column: Column;
  onRenamed: (title: string) => void;
  onDeleted: () => void;
  onServicesReordered: (services: Service[]) => void;
  onServiceAdded: (s: Service) => void;
  onServiceChanged: (s: Service) => void;
  onServiceDeleted: (id: string) => void;
}) {
  const [title, setTitle] = useState(column.title);
  const [pending, startTransition] = useTransition();
  const dirty = title.trim() !== column.title;

  function save() {
    startTransition(async () => {
      const result = await updateColumn({ id: column.id, title });
      if (result.ok) {
        onRenamed(title.trim());
        toast.success("სათაური შენახულია");
      } else toast.error(result.error);
    });
  }

  function remove() {
    const n = column.services.length;
    const msg = n
      ? `წავშალო სვეტი „${column.title}“ და მისი ${n} სერვისი?`
      : `წავშალო სვეტი „${column.title}“?`;
    if (!window.confirm(msg)) return;
    startTransition(async () => {
      const result = await deleteColumn({ id: column.id });
      if (result.ok) {
        onDeleted();
        toast.success("სვეტი წაიშალა");
      } else toast.error(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-5">
      <div className="flex items-center gap-2">
        {handle}
        <label className="sr-only" htmlFor={`col-${column.id}`}>
          სვეტის სათაური
        </label>
        <input
          id={`col-${column.id}`}
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && dirty && save()}
          className="admin-input font-bold text-accent"
        />
        {dirty && (
          <button type="button" onClick={save} disabled={pending} className="admin-btn-ghost shrink-0">
            შენახვა
          </button>
        )}
        <button type="button" onClick={remove} disabled={pending} className="admin-btn-danger shrink-0">
          წაშლა
        </button>
      </div>

      {column.services.length > 0 && (
        <SortableList items={column.services} onReorder={onServicesReordered}>
          <ul className="flex flex-col gap-2">
            {column.services.map((s) => (
              <SortableItem
                key={s.id}
                id={s.id}
                handleLabel={`„${s.name}“ გადაადგილება`}
                className="rounded-2xl border border-line bg-card-raised"
              >
                {(handle) => (
                  <ServiceRow
                    handle={handle}
                    service={s}
                    onChanged={onServiceChanged}
                    onDeleted={() => onServiceDeleted(s.id)}
                  />
                )}
              </SortableItem>
            ))}
          </ul>
        </SortableList>
      )}

      <AddServiceForm columnId={column.id} onAdded={onServiceAdded} />
    </div>
  );
}

function ServiceRow({
  handle,
  service,
  onChanged,
  onDeleted,
}: {
  handle: React.ReactNode;
  service: Service;
  onChanged: (s: Service) => void;
  onDeleted: () => void;
}) {
  const [name, setName] = useState(service.name);
  const [price, setPrice] = useState(service.price);
  const [pending, startTransition] = useTransition();
  const dirty = name.trim() !== service.name || price.trim() !== service.price;

  function save() {
    startTransition(async () => {
      const result = await updateService({ id: service.id, name, price });
      if (result.ok) {
        onChanged({ ...service, name: name.trim(), price: price.trim() });
        toast.success("სერვისი შენახულია");
      } else toast.error(result.error);
    });
  }

  function remove() {
    if (!window.confirm(`წავშალო „${service.name}“?`)) return;
    startTransition(async () => {
      const result = await deleteService({ id: service.id });
      if (result.ok) {
        onDeleted();
        toast.success("სერვისი წაიშალა");
      } else toast.error(result.error);
    });
  }

  const onEnter = (e: React.KeyboardEvent) => e.key === "Enter" && dirty && save();

  return (
    <div className="flex items-start gap-1 p-2">
      {handle}
      <ServicePhoto service={service} onChanged={onChanged} />
      {/* Phone: name on its own row, then price + buttons. Wider screens: one row. */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <input
          aria-label="სერვისის სახელი"
          value={name}
          maxLength={200}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onEnter}
          className="admin-input min-w-0 basis-full sm:basis-0 sm:flex-[1_1_0]"
        />
        <input
          aria-label="ფასი"
          value={price}
          maxLength={100}
          placeholder="ფასი"
          onChange={(e) => setPrice(e.target.value)}
          onKeyDown={onEnter}
          className="admin-input w-auto min-w-0 flex-1 sm:w-36 sm:flex-none"
        />
        {dirty && (
          <button type="button" onClick={save} disabled={pending} className="admin-btn-ghost min-h-12">
            შენახვა
          </button>
        )}
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label={`„${service.name}“ წაშლა`}
          className="admin-btn-danger size-12 shrink-0 px-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

/** Optional small photo of a price item (e.g. a boiler model): click to upload or replace. */
function ServicePhoto({ service, onChanged }: { service: Service; onChanged: (s: Service) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const inputId = `svc-photo-${service.id}`;

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("აირჩიეთ სურათის ფაილი (JPG, PNG, WebP).");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    let uploadedPath: string | null = null;
    setBusy(true);
    try {
      const { blob, width, height } = await compressToWebp(file, SERVICE_PHOTO_MAX_WIDTH);
      const path = newServicePhotoPath(service.id);
      const { error } = await supabase.storage
        .from("photos")
        .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
      if (error) throw error;
      uploadedPath = path;

      const result = await saveServicePhoto({ id: service.id, path, width, height });
      if (!result.ok) {
        await supabase.storage.from("photos").remove([path]);
        toast.error(result.error);
        return;
      }
      onChanged({ ...service, photoUrl: result.data });
      toast.success(`„${service.name}“ — ფოტო შენახულია`);
    } catch (error) {
      if (uploadedPath) await supabase.storage.from("photos").remove([uploadedPath]);
      const message = error instanceof Error ? error.message : "";
      toast.error(
        message === "WEBP_UNSUPPORTED"
          ? "ეს ბრაუზერი WebP-ს ვერ ქმნის. სცადეთ Chrome-ით."
          : "ფოტოს ატვირთვა ვერ მოხერხდა. სცადეთ თავიდან.",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onRemove() {
    if (!window.confirm(`წავშალო „${service.name}“-ის ფოტო?`)) return;
    setBusy(true);
    const result = await deleteServicePhoto({ id: service.id });
    setBusy(false);
    if (result.ok) {
      onChanged({ ...service, photoUrl: null });
      toast.success("ფოტო წაიშალა");
    } else toast.error(result.error);
  }

  return (
    <div className="relative shrink-0">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={PHOTO_ACCEPT}
        className="sr-only"
        disabled={busy}
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <label
        htmlFor={inputId}
        title={service.photoUrl ? "ფოტოს შეცვლა" : "ფოტოს დამატება"}
        className={`flex size-12 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-white text-xl text-neutral-400 transition-colors hover:border-accent ${busy ? "pointer-events-none opacity-50" : ""}`}
      >
        {service.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview, images are unoptimized anyway
          <img src={service.photoUrl} alt="" className="size-full object-contain" />
        ) : (
          <span aria-hidden>+</span>
        )}
        <span className="sr-only">{service.photoUrl ? `„${service.name}“ — ფოტოს შეცვლა` : `„${service.name}“ — ფოტოს დამატება`}</span>
      </label>
      {service.photoUrl && !busy && (
        <button
          type="button"
          onClick={() => void onRemove()}
          aria-label={`„${service.name}“ — ფოტოს წაშლა`}
          className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
        >
          ×
        </button>
      )}
    </div>
  );
}

function AddServiceForm({ columnId, onAdded }: { columnId: string; onAdded: (s: Service) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createService({ columnId, name, price });
      if (result.ok) {
        onAdded({ id: result.data.id, name: result.data.name, price: result.data.price, photoUrl: null });
        setName("");
        setPrice("");
        toast.success("სერვისი დაემატა");
      } else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2 border-t border-line pt-4">
      <input
        aria-label="ახალი სერვისის სახელი"
        placeholder="ახალი სერვისი"
        value={name}
        maxLength={200}
        onChange={(e) => setName(e.target.value)}
        className="admin-input min-w-0 basis-full sm:basis-0 sm:flex-[1_1_0]"
      />
      <input
        aria-label="ახალი სერვისის ფასი"
        placeholder="ფასი, მაგ. 50 ₾"
        value={price}
        maxLength={100}
        onChange={(e) => setPrice(e.target.value)}
        className="admin-input w-auto min-w-0 flex-1 sm:w-36 sm:flex-none"
      />
      <button type="submit" disabled={pending || !name.trim()} className="admin-btn-ghost min-h-12 shrink-0">
        + დამატება
      </button>
    </form>
  );
}

function AddColumnForm({ onAdded }: { onAdded: (c: Column) => void }) {
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createColumn({ title });
      if (result.ok) {
        onAdded({ id: result.data.id, title: result.data.title, services: [] });
        setTitle("");
        toast.success("სვეტი დაემატა");
      } else toast.error(result.error);
    });
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 rounded-card border border-dashed border-line p-4 sm:flex-row sm:items-center"
    >
      <label htmlFor="new-column" className="sr-only">
        ახალი სვეტის სათაური
      </label>
      <input
        id="new-column"
        placeholder="ახალი სვეტი, მაგ. ბოილერი"
        value={title}
        maxLength={100}
        onChange={(e) => setTitle(e.target.value)}
        className="admin-input"
      />
      <button type="submit" disabled={pending || !title.trim()} className="admin-btn-primary shrink-0">
        + სვეტის დამატება
      </button>
    </form>
  );
}
