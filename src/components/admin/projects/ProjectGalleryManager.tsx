"use client";

import React from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import {
  createProjectImage,
  deleteProjectImage,
  listAdminProjectImages,
  updateProjectImage,
  uploadProjectImage,
} from "@/services/projects";
import type { ProjectImage, ProjectImageInput } from "@/types/project";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

const emptyForm: ProjectImageInput = {
  imageUrl: "",
  altText: "",
  caption: "",
  sortOrder: 0,
};

function getPublicImageUrl(value?: string | null) {
  const url = value?.trim();
  if (!url) return "";
  if (url.startsWith("/img/") || url.startsWith("/api/media/") || url.startsWith("https://") || url.startsWith("http://")) return url;
  return "";
}

function isInvalidImageUrl(value?: string | null) {
  const url = value?.trim();
  return Boolean(url) && !getPublicImageUrl(url);
}

function normalizeSortOrder(value: number | undefined) {
  return Number.isFinite(value) && value !== undefined && value >= 0 ? value : 0;
}

export default function ProjectGalleryManager({ projectId }: { projectId: string }) {
  const [images, setImages] = React.useState<ProjectImage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState<ProjectImageInput>(emptyForm);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const invalidImageUrl = isInvalidImageUrl(form.imageUrl);
  const canSave = (Boolean(form.mediaAssetId) || Boolean(form.imageUrl.trim())) && !invalidImageUrl;

  function sortedImages(items: ProjectImage[]) {
    return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt?.localeCompare(b.createdAt ?? "") || 0);
  }


  React.useEffect(() => {
    listAdminProjectImages(projectId)
      .then(async (items) => {
        const sorted = sortedImages(items);
        const normalized = await Promise.all(
          sorted.map((item, index) => {
            if (item.sortOrder === index) return Promise.resolve({ ...item, sortOrder: index });

            return updateProjectImage(projectId, item.id, {
              imageUrl: item.imageUrl,
              mediaAssetId: item.mediaAssetId ?? null,
              altText: item.altText ?? null,
              caption: item.caption ?? null,
              sortOrder: index,
            });
          })
        );
        setImages(sortedImages(normalized));
      })
      .catch(() => setError("No se pudo cargar la galeria del proyecto."))
      .finally(() => setLoading(false));
  }, [projectId]);
  async function normalizeRemoteImages(items: ProjectImage[]) {
    const sorted = sortedImages(items);
    const normalized = await Promise.all(
      sorted.map((item, index) => {
        if (item.sortOrder === index) return Promise.resolve({ ...item, sortOrder: index });

        return updateProjectImage(projectId, item.id, {
          imageUrl: item.imageUrl,
          mediaAssetId: item.mediaAssetId ?? null,
          altText: item.altText ?? null,
          caption: item.caption ?? null,
          sortOrder: index,
        });
      })
    );

    return sortedImages(normalized);
  }

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setForm({
      ...emptyForm,
      sortOrder: sortedImages(images).length,
    });
  }

  function openAddForm() {
    setEditingId(null);
    setShowForm(true);
    setForm({
      ...emptyForm,
      sortOrder: sortedImages(images).length,
    });
    setError(null);
    setSuccess(null);
  }

  function startEdit(image: ProjectImage) {
    setEditingId(image.id);
    setShowForm(true);
    setForm({
      imageUrl: image.imageUrl,
      mediaAssetId: image.mediaAssetId ?? null,
      altText: image.altText ?? "",
      caption: image.caption ?? "",
      sortOrder: image.sortOrder,
    });
    setError(null);
    setSuccess(null);
  }

  async function onImageFileChange(files?: FileList | null) {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) return;

    setSaving(true);
    setUploadingImage(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        const uploaded = await uploadProjectImage(selectedFiles[0]);
        setForm((current) => ({
          ...current,
          mediaAssetId: uploaded.id,
          imageUrl: uploaded.url,
        }));
        setSuccess("Imagen subida. Guarda la imagen para confirmar el cambio.");
        return;
      }

      const createdImages: ProjectImage[] = [];
      const startOrder = sortedImages(images).length;
      for (const [index, file] of selectedFiles.entries()) {
        const uploaded = await uploadProjectImage(file);
        const created = await createProjectImage(projectId, {
          imageUrl: uploaded.url,
          mediaAssetId: uploaded.id,
          altText: uploaded.originalFilename.replace(/\.[^.]+$/, ""),
          caption: null,
          sortOrder: startOrder + index,
        });
        createdImages.push(created);
      }

      setImages(await normalizeRemoteImages([...images, ...createdImages]));
      setShowForm(false);
      setSuccess(`${createdImages.length} imagen(es) agregada(s) correctamente.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  }
  async function onSubmit() {
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: ProjectImageInput = {
      imageUrl: getPublicImageUrl(form.imageUrl),
      mediaAssetId: form.mediaAssetId ?? null,
      altText: form.altText?.trim() || null,
      caption: form.caption?.trim() || null,
      sortOrder: editingId ? normalizeSortOrder(form.sortOrder) : sortedImages(images).length,
    };

    try {
      if (editingId) {
        const updated = await updateProjectImage(projectId, editingId, payload);
        setImages(await normalizeRemoteImages(images.map((item) => (item.id === updated.id ? updated : item))));
        setSuccess("Imagen actualizada correctamente.");
      } else {
        const created = await createProjectImage(projectId, payload);
        setImages(await normalizeRemoteImages([...images, created]));
        setSuccess("Imagen agregada correctamente.");
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la imagen.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(imageId: string) {
    if (!window.confirm("Eliminar esta imagen de la galeria?")) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteProjectImage(projectId, imageId);
      setImages(await normalizeRemoteImages(images.filter((item) => item.id !== imageId)));
      if (editingId === imageId) resetForm();
      setSuccess("Imagen eliminada correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la imagen.");
    } finally {
      setSaving(false);
    }
  }

  async function moveImage(image: ProjectImage, direction: -1 | 1) {
    const current = sortedImages(images).map((item, index) => ({ ...item, sortOrder: index }));
    const index = current.findIndex((item) => item.id === image.id);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= current.length) return;

    const next = [...current];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const normalized = await normalizeRemoteImages(next.map((item, itemIndex) => ({ ...item, sortOrder: itemIndex })));
      setImages(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reordenar la galeria.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section id="project-gallery" className="scroll-mt-24 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Galeria de imagenes</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Administra imagenes asociadas al proyecto sin reemplazar la imagen principal.
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

      <div className="mt-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {loading ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-400 sm:col-span-2 lg:col-span-3 2xl:col-span-4">
              Cargando galeria...
            </div>
          ) : images.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 p-5 text-sm text-neutral-400 sm:col-span-2 lg:col-span-3 2xl:col-span-4">
              Todavia no hay imagenes asociadas a este proyecto.
            </div>
          ) : (
            sortedImages(images).map((image, index) => (
              <article key={image.id} className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.imageUrl}
                  alt={image.altText || image.caption || "Imagen de galeria"}
                  className="aspect-video w-full object-cover"
                />
                <div className="space-y-2 p-2.5">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-primary-light">
                      Orden {image.sortOrder}
                    </p>
                    {image.caption && <p className="mt-1 line-clamp-2 text-xs text-neutral-200">{image.caption}</p>}
                    {image.altText && <p className="mt-1 line-clamp-1 text-[11px] text-neutral-500">{image.altText}</p>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      disabled={saving || index === 0}
                      onClick={() => moveImage(image, -1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
                      aria-label="Subir imagen"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={saving || index === images.length - 1}
                      onClick={() => moveImage(image, 1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
                      aria-label="Bajar imagen"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(image)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                      aria-label="Editar imagen"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => onDelete(image.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/70 text-red-200 hover:bg-red-950/50 disabled:opacity-40"
                      aria-label="Eliminar imagen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
          {!loading && !editingId && (
            <button
              type="button"
              onClick={openAddForm}
              className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-700 bg-neutral-900/30 p-4 text-center text-neutral-400 transition hover:border-primary/70 hover:bg-neutral-900/60 hover:text-primary-light"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-100">
                <Plus className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold">Agregar imagen</span>
            </button>
          )}
        </div>

        {(showForm || editingId) && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-primary-light">
                {editingId ? "Editar imagen" : "Agregar imagenes"}
              </h3>
              <p className="mt-1 text-xs leading-5 text-neutral-400">
                {editingId
                  ? "Selecciona un archivo para reemplazar la imagen actual y luego guarda los cambios."
                  : "Selecciona una o varias imagenes. Se agregan automaticamente a la galeria."}
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                aria-label="Cancelar edicion"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-3 space-y-3">
            <label className="block space-y-1 rounded-lg border border-dashed border-neutral-700 p-2.5">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-300">
                <Upload className="h-4 w-4" />
                Seleccionar archivo
              </span>
              <input
                type="file"
                multiple={!editingId}
                accept="image/jpeg,image/png,image/webp"
                disabled={saving || uploadingImage}
                className="block w-full text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-100 hover:file:bg-neutral-700 disabled:opacity-60"
                onChange={(event) => onImageFileChange(event.target.files)}
              />
              {uploadingImage && <p className="text-xs text-neutral-400">Subiendo imagenes...</p>}
            </label>

            {editingId && (
              <details className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  URL manual de imagen
                </summary>
                <label className="mt-3 block space-y-1">
                  <input
                    className={inputClass}
                    value={form.imageUrl}
                    disabled={saving}
                    placeholder="/img/proyectos/galeria-1.jpg"
                    onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value, mediaAssetId: null }))}
                  />
                  {invalidImageUrl && (
                    <p className="text-xs leading-5 text-yellow">
                      Usa /img/..., /api/media/... o una URL http(s). No se permiten rutas C:\.
                    </p>
                  )}
                </label>
              </details>
            )}

            {editingId && (
              <>
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
                    Epigrafe
                  </span>
                  <textarea
                    className={`${inputClass} min-h-24 resize-y leading-relaxed`}
                    value={form.caption ?? ""}
                    disabled={saving}
                    onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))}
                  />
                </label>

                <button
                  type="button"
                  disabled={!canSave || saving}
                  onClick={onSubmit}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-neutral-700 disabled:text-neutral-400"
                >
                  <Save className="h-4 w-4" />
                  Guardar imagen
                </button>
              </>
            )}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
