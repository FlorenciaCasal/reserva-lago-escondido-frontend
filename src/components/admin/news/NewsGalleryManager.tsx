"use client";

import React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createNewsImage,
  deleteNewsImage,
  listAdminNewsImages,
  updateNewsImage,
  uploadNewsImage,
} from "@/services/news";
import type { NewsImage, NewsImageInput } from "@/types/news";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

const emptyForm: NewsImageInput = {
  imageUrl: "",
  mediaAssetId: null,
  altText: "",
  caption: "",
  sortOrder: 0,
};

export default function NewsGalleryManager({ newsId }: { newsId: string }) {
  const [images, setImages] = React.useState<NewsImage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<NewsImageInput>(emptyForm);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    listAdminNewsImages(newsId)
      .then(setImages)
      .catch(() => setError("No se pudo cargar la galeria."))
      .finally(() => setLoading(false));
  }, [newsId]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function editImage(image: NewsImage) {
    setEditingId(image.id);
    setForm({
      imageUrl: image.imageUrl,
      mediaAssetId: image.mediaAssetId ?? null,
      altText: image.altText ?? "",
      caption: image.caption ?? "",
      sortOrder: image.sortOrder,
    });
  }

  async function onUpload(file?: File) {
    if (!file) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const uploaded = await uploadNewsImage(file);
      setForm((current) => ({
        ...current,
        imageUrl: uploaded.url,
        mediaAssetId: uploaded.id,
      }));
      setSuccess("Imagen subida. Completa los datos y guarda la galeria.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setSaving(false);
    }
  }

  async function onSave() {
    if (!form.imageUrl.trim()) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: NewsImageInput = {
        imageUrl: form.imageUrl.trim(),
        mediaAssetId: form.mediaAssetId ?? null,
        altText: form.altText?.trim() || null,
        caption: form.caption?.trim() || null,
        sortOrder: Number(form.sortOrder ?? 0),
      };
      const saved = editingId
        ? await updateNewsImage(newsId, editingId, payload)
        : await createNewsImage(newsId, payload);

      setImages((current) =>
        editingId
          ? current.map((image) => (image.id === saved.id ? saved : image))
          : [...current, saved].sort((a, b) => a.sortOrder - b.sortOrder)
      );
      resetForm();
      setSuccess("Galeria actualizada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la imagen.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(image: NewsImage) {
    if (!window.confirm("Quitar esta imagen de la galeria?")) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteNewsImage(newsId, image.id);
      setImages((current) => current.filter((item) => item.id !== image.id));
      if (editingId === image.id) resetForm();
      setSuccess("Imagen quitada de la galeria.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo quitar la imagen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="news-gallery" className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-light">
            Galeria
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Imagenes complementarias para el detalle publico de la novedad.
          </p>
        </div>
      </div>

      {(error || success) && (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm ${
            error
              ? "border-red-800 bg-red-950/40 text-red-200"
              : "border-green-800 bg-green-950/40 text-green-200"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          {loading ? (
            <p className="text-sm text-neutral-400">Cargando galeria...</p>
          ) : images.length === 0 ? (
            <p className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-400">
              Todavia no hay imagenes en la galeria.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <article key={image.id} className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.imageUrl} alt={image.altText || image.caption || "Imagen de la novedad"} className="aspect-video w-full object-cover" />
                  <div className="space-y-2 p-3">
                    <p className="line-clamp-2 text-xs text-neutral-300">{image.caption || image.altText || "Sin descripcion"}</p>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Orden {image.sortOrder}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => editImage(image)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
                          aria-label="Editar imagen"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => onDelete(image)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/70 text-red-200 hover:bg-red-950/50 disabled:opacity-50"
                          aria-label="Quitar imagen"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <h3 className="text-sm font-semibold text-neutral-100">
            {editingId ? "Editar imagen" : "Agregar imagen"}
          </h3>
          <div className="mt-4 space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Archivo
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={saving}
                className="block w-full text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-100 hover:file:bg-neutral-700 disabled:opacity-60"
                onChange={(event) => onUpload(event.target.files?.[0])}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                URL de imagen
              </span>
              <input
                className={inputClass}
                value={form.imageUrl}
                disabled={saving}
                placeholder="/api/media/..."
                onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value, mediaAssetId: null }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Texto alternativo
              </span>
              <input
                className={inputClass}
                value={form.altText ?? ""}
                disabled={saving}
                onChange={(event) => setForm((current) => ({ ...current, altText: event.target.value }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Pie de foto
              </span>
              <textarea
                className={`${inputClass} min-h-20 resize-y`}
                value={form.caption ?? ""}
                disabled={saving}
                onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Orden
              </span>
              <input
                type="number"
                className={inputClass}
                value={form.sortOrder ?? 0}
                disabled={saving}
                onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving || !form.imageUrl.trim()}
                onClick={onSave}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-neutral-700 disabled:text-neutral-400"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Guardar
              </button>
              {editingId && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={resetForm}
                  className="rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-100 hover:bg-neutral-800 disabled:opacity-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
