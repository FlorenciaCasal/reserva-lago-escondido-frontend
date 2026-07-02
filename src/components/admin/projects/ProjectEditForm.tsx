"use client";

import React from "react";
import Link from "next/link";
import { Eye, EyeOff, Save, Star } from "lucide-react";
import ProjectAdvancesManager from "@/components/admin/projects/ProjectAdvancesManager";
import ProjectDocumentsManager from "@/components/admin/projects/ProjectDocumentsManager";
import ProjectGalleryManager from "@/components/admin/projects/ProjectGalleryManager";
import {
  getAdminProject,
  updateProject,
  uploadProjectImage,
} from "@/services/projects";
import type { Project, ProjectStatus, UpdateProjectInput } from "@/types/project";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

function getPublicUrl(value?: string | null) {
  const url = value?.trim();
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("https://") || url.startsWith("http://")) return url;
  return "";
}

function isInvalidLocalUrl(value?: string | null) {
  const url = value?.trim();
  return Boolean(url) && !getPublicUrl(url);
}

const projectStatusOptions: Record<ProjectStatus, Array<{ value: ProjectStatus; label: string }>> = {
  DRAFT: [
    { value: "DRAFT", label: "Borrador" },
    { value: "PUBLISHED", label: "Publicado" },
    { value: "ARCHIVED", label: "Archivado" },
  ],
  PUBLISHED: [
    { value: "PUBLISHED", label: "Publicado" },
    { value: "ARCHIVED", label: "Archivado" },
  ],
  ARCHIVED: [
    { value: "ARCHIVED", label: "Archivado" },
    { value: "PUBLISHED", label: "Publicado" },
  ],
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export default function ProjectEditForm({ projectId }: { projectId: string }) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [project, setProject] = React.useState<Project | null>(null);
  const [form, setForm] = React.useState<UpdateProjectInput | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAdminProject(projectId)
      .then((data) => {
        setProject(data);
        setForm({
          title: data.title,
          summary: data.summary,
          content: data.content,
          slug: data.slug,
          imageAssetId: data.imageAssetId ?? null,
          imageUrl: data.imageUrl ?? "",
          videoAssetId: data.videoAssetId ?? null,
          videoUrl: data.videoUrl ?? "",
          featured: data.featured,
          status: data.status,
        });
      })
      .catch(() => setError("No se pudo cargar el proyecto."))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-8 text-neutral-300">Cargando proyecto...</div>;
  }

  if (!form || !project) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-neutral-300">
          {error || "Proyecto no encontrado."}
        </section>
      </div>
    );
  }

  const currentStatus = form.status ?? project.status;
  const imageUrl = getPublicUrl(form.imageUrl);
  const invalidImageUrl = isInvalidLocalUrl(form.imageUrl);
  const canSave =
    form.title.trim() &&
    form.summary.trim() &&
    form.content.trim() &&
    form.slug.trim() &&
    !invalidImageUrl;

  function setField<K extends keyof UpdateProjectInput>(key: K, value: UpdateProjectInput[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function onSave() {
    if (!form) return;
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: UpdateProjectInput = {
        title: form.title,
        summary: form.summary,
        content: form.content,
        slug: form.slug,
        imageAssetId: form.imageAssetId ?? null,
        imageUrl,
        videoAssetId: form.videoAssetId ?? null,
        videoUrl: form.videoUrl ?? null,
        featured: form.featured,
        status: form.status,
      };
      const updated = await updateProject(projectId, payload);
      setProject(updated);
      setForm({
        title: updated.title,
        summary: updated.summary,
        content: updated.content,
        slug: updated.slug,
        imageAssetId: updated.imageAssetId ?? null,
        imageUrl: updated.imageUrl ?? "",
        videoAssetId: updated.videoAssetId ?? null,
        videoUrl: updated.videoUrl ?? "",
        featured: updated.featured,
        status: updated.status,
      });
      setSuccess("Proyecto guardado correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el proyecto.");
    } finally {
      setSaving(false);
    }
  }

  async function onMainImageFileChange(file?: File) {
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    setSuccess(null);

    try {
      const uploaded = await uploadProjectImage(file);
      setForm((current) =>
        current
          ? {
              ...current,
              imageAssetId: uploaded.id,
              imageUrl: uploaded.url,
            }
          : current
      );
      setSuccess("Imagen subida. Guarda los datos del proyecto para asociarla definitivamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  }
  function clearMainImage() {
    setField("imageUrl", "");
    setField("imageAssetId", null);
    setSuccess("Imagen principal quitada. Guarda los datos del proyecto para confirmar el cambio.");
  }
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-2 py-4 sm:px-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
            Proyectos
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            Editar proyecto
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Gestiona informacion, estado, destacado e imagen principal.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href="#project-gallery"
            className="inline-flex items-center justify-center rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-100 hover:bg-neutral-800"
          >
            Galeria
          </a>
          <a
            href="#project-documents"
            className="inline-flex items-center justify-center rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-100 hover:bg-neutral-800"
          >
            Documentos
          </a>
          <a
            href="#project-advances"
            className="inline-flex items-center justify-center rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-100 hover:bg-neutral-800"
          >
            Avances
          </a>
          <Link
            href="/admin/proyectos"
            className="inline-flex items-center justify-center rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-100 hover:bg-neutral-800"
          >
            Cancelar
          </Link>
        </div>
      </header>

      {(error || success) && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            error
              ? "border-red-800 bg-red-950/40 text-red-200"
              : "border-green-800 bg-green-950/40 text-green-200"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="space-y-5">
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Titulo del proyecto
              </span>
              <input
                className={inputClass}
                value={form.title}
                disabled={saving || uploadingImage}
                onChange={(event) => {
                  const title = event.target.value;
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          title,
                          slug: current.slug ? current.slug : slugify(title),
                        }
                      : current
                  );
                }}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Resumen corto
              </span>
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                value={form.summary}
                disabled={saving || uploadingImage}
                onChange={(event) => setField("summary", event.target.value)}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Descripcion detallada
              </span>
              <textarea
                className={`${inputClass} min-h-80 resize-y leading-relaxed`}
                value={form.content}
                disabled={saving || uploadingImage}
                onChange={(event) => setField("content", event.target.value)}
              />
            </label>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-light">
              Configuracion
            </h2>
            <div className="mt-4 space-y-4">
              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Estado
                </span>
                <select
                  className={inputClass}
                  value={currentStatus}
                  disabled={saving || uploadingImage}
                  onChange={(event) => setField("status", event.target.value as ProjectStatus)}
                >
                  {projectStatusOptions[project.status].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200">
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  disabled={saving || currentStatus === "ARCHIVED"}
                  onChange={(event) => setField("featured", event.target.checked)}
                />
                <Star className="h-4 w-4 text-primary-light" aria-hidden="true" />
                Proyecto destacado
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-light">
              Multimedia
            </h2>
            <div className="mt-4 space-y-4">

              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  {imageUrl ? "Cambiar imagen principal" : "Seleccionar imagen principal"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={saving || uploadingImage}
                  className="block w-full text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-100 hover:file:bg-neutral-700 disabled:opacity-60"
                  onChange={(event) => onMainImageFileChange(event.target.files?.[0])}
                />
                {uploadingImage && <p className="text-xs text-neutral-400">Subiendo imagen...</p>}
                {imageUrl && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                    <span>Imagen actual: se reemplazara si elegis otro archivo.</span>
                    <button type="button" disabled={saving || uploadingImage} onClick={clearMainImage} className="font-semibold text-red-300 hover:text-red-200 disabled:opacity-50">Quitar imagen</button>
                  </div>
                )}
              </label>
              <details className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  URL manual de imagen
                </summary>
                <label className="mt-3 block space-y-1">
                  <input
                    className={inputClass}
                    value={form.imageUrl ?? ""}
                    disabled={saving || uploadingImage}
                    placeholder="/img/alerces.jpg"
                    onChange={(event) => {
                      setField("imageUrl", event.target.value);
                      setField("imageAssetId", null);
                    }}
                  />
                  {invalidImageUrl && (
                    <p className="text-xs leading-5 text-yellow">
                      Usa /img/... o una URL http(s). No se permiten rutas C:\.
                    </p>
                  )}
                </label>
              </details>

              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={form.title}
                  className="aspect-video w-full rounded-lg border border-neutral-800 object-cover"
                />
              )}
            </div>
          </section>

          <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Slug
              </span>
              <input
                className={inputClass}
                value={form.slug}
                disabled={saving || uploadingImage}
                onChange={(event) => setField("slug", slugify(event.target.value))}
              />
            </label>
          </section>
          <section className="rounded-xl border border-primary/40 bg-primary/10 p-3">
            <p className="mb-3 text-xs leading-5 text-neutral-300">
              Guarda aca los datos principales. Galeria, documentos y avances se guardan desde sus propias secciones.
            </p>
            <button
              type="button"
              disabled={!canSave || saving}
              onClick={onSave}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/10 transition hover:bg-primary-dark disabled:bg-neutral-700 disabled:text-neutral-400 disabled:shadow-none"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Guardar datos del proyecto
            </button>
          </section>
        </aside>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
        <span className="inline-flex items-center gap-1">
          {currentStatus === "PUBLISHED" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {projectStatusOptions[currentStatus][0]?.label ?? currentStatus}
        </span>
        <span>Ultima actualizacion: {project.updatedAt ? new Date(project.updatedAt).toLocaleString("es-AR") : "-"}</span>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 text-sm leading-6 text-neutral-300">
        Estas secciones se guardan por separado: usa los botones de galeria, documentos y avances para crear, editar, ordenar o eliminar cada elemento.
      </div>

      <ProjectGalleryManager projectId={projectId} />
      <ProjectDocumentsManager projectId={projectId} />
      <ProjectAdvancesManager projectId={projectId} />
    </div>
  );
}
