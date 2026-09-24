"use client";

import React from "react";
import { ArrowDown, ArrowUp, ImageIcon, LinkIcon, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import type { MediaAsset, MediaGalleryItem, MediaGalleryItemInput } from "@/types/project";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

type Props = {
  title: string;
  description: string;
  emptyMessage: string;
  loadItems: () => Promise<MediaGalleryItem[]>;
  createItem: (input: MediaGalleryItemInput) => Promise<MediaGalleryItem>;
  updateItem: (itemId: string, input: MediaGalleryItemInput) => Promise<MediaGalleryItem>;
  deleteItem: (itemId: string) => Promise<void>;
  uploadImage: (file: File) => Promise<MediaAsset>;
  compact?: boolean;
};

type FormState = {
  caption: string;
  altText: string;
  youtubeUrl: string;
};

const emptyForm: FormState = {
  caption: "",
  altText: "",
  youtubeUrl: "",
};

function sortItems(items: MediaGalleryItem[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
}

function toInput(item: MediaGalleryItem, sortOrder: number): MediaGalleryItemInput {
  return {
    kind: item.kind,
    sourceType: item.sourceType,
    mediaAssetId: item.mediaAssetId ?? null,
    externalVideoId: item.externalVideoId ?? null,
    caption: item.caption ?? null,
    altText: item.kind === "IMAGE" ? item.altText ?? null : null,
    sortOrder,
  };
}

export default function MediaGalleryManager({
  title,
  description,
  emptyMessage,
  loadItems,
  createItem,
  updateItem,
  deleteItem,
  uploadImage,
  compact = false,
}: Props) {
  const [items, setItems] = React.useState<MediaGalleryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [editing, setEditing] = React.useState<MediaGalleryItem | null>(null);
  const [youtubeForm, setYoutubeForm] = React.useState<FormState>(emptyForm);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    loadItems()
      .then((loaded) => {
        if (active) setItems(sortItems(loaded));
      })
      .catch(() => {
        if (active) setError("No se pudo cargar la galeria multimedia.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadItems]);

  React.useEffect(() => {
    if (!success) return;
    const timeout = window.setTimeout(() => setSuccess(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [success]);

  async function normalizeRemote(nextItems: MediaGalleryItem[]) {
    const sorted = sortItems(nextItems);
    const normalized = await Promise.all(
      sorted.map((item, index) => {
        if (item.sortOrder === index) return Promise.resolve({ ...item, sortOrder: index });
        return updateItem(item.id, toInput(item, index));
      })
    );
    return sortItems(normalized);
  }

  async function onUploadImages(files?: FileList | null) {
    const selected = Array.from(files ?? []);
    if (selected.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      let next = [...items];
      for (const file of selected) {
        const uploaded = await uploadImage(file);
        const created = await createItem({
          kind: "IMAGE",
          sourceType: "MEDIA_ASSET",
          mediaAssetId: uploaded.id,
          altText: uploaded.originalFilename,
          caption: null,
          sortOrder: next.length,
        });
        next = [...next, created];
      }
      setItems(await normalizeRemote(next));
      setSuccess(selected.length === 1 ? "Imagen agregada." : "Imagenes agregadas.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron subir las imagenes.");
    } finally {
      setUploading(false);
    }
  }

  async function addYoutube() {
    if (!youtubeForm.youtubeUrl.trim()) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const created = await createItem({
        kind: "VIDEO",
        sourceType: "EXTERNAL_YOUTUBE",
        youtubeUrl: youtubeForm.youtubeUrl.trim(),
        caption: youtubeForm.caption.trim() || null,
        sortOrder: items.length,
      });
      setItems(await normalizeRemote([...items, created]));
      setYoutubeForm(emptyForm);
      setSuccess("Video de YouTube agregado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar el video.");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateItem(editing.id, toInput(editing, editing.sortOrder));
      setItems((current) => sortItems(current.map((item) => (item.id === updated.id ? updated : item))));
      setEditing(null);
      setSuccess("Item actualizado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el item.");
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(item: MediaGalleryItem) {
    if (!window.confirm("Eliminar este item multimedia?")) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteItem(item.id);
      setItems(await normalizeRemote(items.filter((current) => current.id !== item.id)));
      if (editing?.id === item.id) setEditing(null);
      setSuccess("Item eliminado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el item.");
    } finally {
      setSaving(false);
    }
  }

  async function move(item: MediaGalleryItem, direction: -1 | 1) {
    const current = sortItems(items).map((entry, index) => ({ ...entry, sortOrder: index }));
    const index = current.findIndex((entry) => entry.id === item.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= current.length) return;

    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      setItems(await normalizeRemote(next.map((entry, entryIndex) => ({ ...entry, sortOrder: entryIndex }))));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reordenar la galeria.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={`rounded-xl border border-neutral-800 bg-neutral-950 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className={compact ? "text-sm font-semibold text-white" : "text-lg font-semibold text-white"}>{title}</h2>
          <p className="mt-1 text-sm text-neutral-400">{description}</p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-800">
          <Upload className="h-4 w-4" />
          Agregar imagenes
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            disabled={saving || uploading}
            className="sr-only"
            onChange={(event) => onUploadImages(event.target.files)}
          />
        </label>
      </div>

      {(error || success) && (
        <div
          className={`mt-4 rounded-lg border p-3 text-sm ${
            error ? "border-red-800 bg-red-950/80 text-red-200" : "border-green-800 bg-green-950/80 text-green-200"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className={compact ? "mt-5 space-y-4" : "mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"}>
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 text-sm text-neutral-400">
              Cargando galeria...
            </div>
          ) : items.length === 0 ? (
            compact ? (
              <p className="rounded-lg border border-dashed border-neutral-800 bg-neutral-900/30 px-3 py-2 text-sm text-neutral-500">
                Sin multimedia cargada.
              </p>
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-700 bg-neutral-900/40 p-5 text-sm text-neutral-400">
                {emptyMessage}
              </div>
            )
          ) : (
            sortItems(items).map((item, index) => (
              <article key={item.id} className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-2.5 sm:flex-row sm:items-start">
                <div className="h-24 w-full shrink-0 overflow-hidden rounded-md border border-neutral-800 bg-neutral-950 sm:w-32">
                  {item.kind === "IMAGE" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.altText || item.caption || ""} className="h-full w-full object-contain" />
                  ) : item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumbnailUrl} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">Video</div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary-light">
                    {item.kind === "IMAGE" ? "Imagen" : "Video"} · Orden {item.sortOrder}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-200">
                    {item.caption || item.altText || item.externalVideoId || "Sin epigrafe"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <button type="button" disabled={saving || index === 0} onClick={() => move(item, -1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40" aria-label="Subir item">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" disabled={saving || index === items.length - 1} onClick={() => move(item, 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40" aria-label="Bajar item">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setEditing(item)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800" aria-label="Editar item">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" disabled={saving} onClick={() => removeItem(item)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/70 text-red-200 hover:bg-red-950/50 disabled:opacity-40" aria-label="Eliminar item">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <div>
            <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-100">
              <LinkIcon className="h-4 w-4" />
              Agregar video de YouTube
            </h3>
            <div className="mt-3 space-y-3">
              <input
                className={inputClass}
                value={youtubeForm.youtubeUrl}
                disabled={saving}
                placeholder="https://www.youtube.com/watch?v=..."
                onChange={(event) => setYoutubeForm((current) => ({ ...current, youtubeUrl: event.target.value }))}
              />
              <textarea
                className={`${inputClass} min-h-20 resize-y`}
                value={youtubeForm.caption}
                disabled={saving}
                placeholder="Epigrafe opcional"
                onChange={(event) => setYoutubeForm((current) => ({ ...current, caption: event.target.value }))}
              />
              <button type="button" disabled={saving || !youtubeForm.youtubeUrl.trim()} onClick={addYoutube} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-neutral-700 disabled:text-neutral-400">
                <Plus className="h-4 w-4" />
                Agregar video
              </button>
            </div>
          </div>

          {editing && (
            <div className="border-t border-neutral-800 pt-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-100">
                  <ImageIcon className="h-4 w-4" />
                  Editar item
                </h3>
                <button type="button" onClick={() => setEditing(null)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800" aria-label="Cancelar edicion">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {editing.kind === "IMAGE" && (
                  <input
                    className={inputClass}
                    value={editing.altText ?? ""}
                    disabled={saving}
                    placeholder="Texto alternativo"
                    onChange={(event) => setEditing((current) => current && { ...current, altText: event.target.value })}
                  />
                )}
                <textarea
                  className={`${inputClass} min-h-20 resize-y`}
                  value={editing.caption ?? ""}
                  disabled={saving}
                  placeholder="Epigrafe opcional"
                  onChange={(event) => setEditing((current) => current && { ...current, caption: event.target.value })}
                />
                <button type="button" disabled={saving} onClick={saveEdit} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-neutral-700 disabled:text-neutral-400">
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
