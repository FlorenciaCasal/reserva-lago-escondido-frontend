"use client";

import React from "react";
import Link from "next/link";
import { Eye, EyeOff, Save, Upload } from "lucide-react";
import NewsGalleryManager from "@/components/admin/news/NewsGalleryManager";
import { createNews, getAdminNews, updateNews, uploadNewsImage, uploadNewsVideo } from "@/services/news";
import type { News, NewsStatus, UpdateNewsInput } from "@/types/news";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

const newsStatusOptions: Record<NewsStatus, Array<{ value: NewsStatus; label: string }>> = {
  DRAFT: [
    { value: "DRAFT", label: "Borrador" },
    { value: "PUBLISHED", label: "Publicado" },
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

type Props = {
  newsId?: string;
};

const emptyForm: UpdateNewsInput = {
  title: "",
  summary: "",
  content: "",
  slug: "",
  imageAssetId: null,
  imageUrl: "",
  videoAssetId: null,
  videoUrl: "",
  status: "DRAFT",
};

export default function NewsEditForm({ newsId }: Props) {
  const isCreate = !newsId;
  const [loading, setLoading] = React.useState(!isCreate);
  const [saving, setSaving] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [uploadingVideo, setUploadingVideo] = React.useState(false);
  const [news, setNews] = React.useState<News | null>(null);
  const [form, setForm] = React.useState<UpdateNewsInput>(emptyForm);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!newsId) return;

    getAdminNews(newsId)
      .then((data) => {
        setNews(data);
        setForm({
          title: data.title,
          summary: data.summary,
          content: data.content,
          slug: data.slug,
          imageAssetId: data.imageAssetId ?? null,
          imageUrl: data.imageUrl ?? "",
          videoAssetId: data.videoAssetId ?? null,
          videoUrl: data.videoUrl ?? "",
          status: data.status,
        });
      })
      .catch(() => setError("No se pudo cargar la novedad."))
      .finally(() => setLoading(false));
  }, [newsId]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-8 text-neutral-300">Cargando novedad...</div>;
  }

  const baseStatus = news?.status ?? "DRAFT";
  const currentStatus = form.status ?? baseStatus;
  const imageUrl = getPublicUrl(form.imageUrl);
  const videoUrl = getPublicUrl(form.videoUrl);
  const invalidImageUrl = isInvalidLocalUrl(form.imageUrl);
  const invalidVideoUrl = isInvalidLocalUrl(form.videoUrl);
  const canSave =
    form.title.trim() &&
    form.summary.trim() &&
    form.content.trim() &&
    form.slug.trim() &&
    !invalidImageUrl &&
    !invalidVideoUrl;

  function setField<K extends keyof UpdateNewsInput>(key: K, value: UpdateNewsInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSave() {
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: UpdateNewsInput = {
        title: form.title,
        summary: form.summary,
        content: form.content,
        slug: form.slug,
        imageAssetId: form.imageAssetId ?? null,
        imageUrl,
        videoAssetId: form.videoAssetId ?? null,
        videoUrl,
        status: form.status,
      };
      const saved = isCreate ? await createNews(payload) : await updateNews(newsId, payload);
      setNews(saved);
      setForm({
        title: saved.title,
        summary: saved.summary,
        content: saved.content,
        slug: saved.slug,
        imageAssetId: saved.imageAssetId ?? null,
        imageUrl: saved.imageUrl ?? "",
        videoAssetId: saved.videoAssetId ?? null,
        videoUrl: saved.videoUrl ?? "",
        status: saved.status,
      });
      setSuccess(isCreate ? "Novedad creada correctamente." : "Novedad guardada correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la novedad.");
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
      const uploaded = await uploadNewsImage(file);
      setForm((current) => ({
        ...current,
        imageAssetId: uploaded.id,
        imageUrl: uploaded.url,
      }));
      setSuccess("Imagen subida. Guarda la novedad para asociarla definitivamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function onVideoFileChange(file?: File) {
    if (!file) return;

    setUploadingVideo(true);
    setError(null);
    setSuccess(null);

    try {
      const uploaded = await uploadNewsVideo(file);
      setForm((current) => ({
        ...current,
        videoAssetId: uploaded.id,
        videoUrl: uploaded.url,
      }));
      setSuccess("Video subido. Guarda la novedad para asociarlo definitivamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el video.");
    } finally {
      setUploadingVideo(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-2 py-4 sm:px-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
            Novedades
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            {isCreate ? "Crear novedad" : "Editar novedad"}
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Gestiona contenido, publicacion, imagen principal, video y galeria.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {news && (
            <a
              href="#news-gallery"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-100 hover:bg-neutral-800"
            >
              Galeria
            </a>
          )}
          <Link
            href="/admin/novedades"
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
                Titulo de la novedad
              </span>
              <input
                className={inputClass}
                value={form.title}
                disabled={saving || uploadingImage || uploadingVideo}
                onChange={(event) => {
                  const title = event.target.value;
                  setForm((current) => ({
                    ...current,
                    title,
                    slug: current.slug ? current.slug : slugify(title),
                  }));
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
                disabled={saving || uploadingImage || uploadingVideo}
                onChange={(event) => setField("summary", event.target.value)}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Contenido
              </span>
              <textarea
                className={`${inputClass} min-h-80 resize-y leading-relaxed`}
                value={form.content}
                disabled={saving || uploadingImage || uploadingVideo}
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
                  disabled={saving || uploadingImage || uploadingVideo}
                  onChange={(event) => setField("status", event.target.value as NewsStatus)}
                >
                  {newsStatusOptions[baseStatus].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-light">
              Multimedia
            </h2>
            <div className="mt-4 space-y-5">
              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Imagen principal
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={saving || uploadingImage || uploadingVideo}
                  className="block w-full text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-100 hover:file:bg-neutral-700 disabled:opacity-60"
                  onChange={(event) => onMainImageFileChange(event.target.files?.[0])}
                />
                {uploadingImage && <p className="text-xs text-neutral-400">Subiendo imagen...</p>}
              </label>

              <details className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  URL manual de imagen
                </summary>
                <input
                  className={`${inputClass} mt-3`}
                  value={form.imageUrl ?? ""}
                  disabled={saving || uploadingImage || uploadingVideo}
                  placeholder="/img/novedad.jpg"
                  onChange={(event) => {
                    setField("imageUrl", event.target.value);
                    setField("imageAssetId", null);
                  }}
                />
                {invalidImageUrl && (
                  <p className="mt-2 text-xs leading-5 text-yellow">
                    Usa /img/... o una URL http(s). No se permiten rutas C:\.
                  </p>
                )}
              </details>

              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={form.title} className="aspect-video w-full rounded-lg border border-neutral-800 object-cover" />
              )}

              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Video opcional
                </span>
                <input
                  type="file"
                  accept="video/mp4"
                  disabled={saving || uploadingImage || uploadingVideo}
                  className="block w-full text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-100 hover:file:bg-neutral-700 disabled:opacity-60"
                  onChange={(event) => onVideoFileChange(event.target.files?.[0])}
                />
                {uploadingVideo && <p className="text-xs text-neutral-400">Subiendo video...</p>}
              </label>

              {videoUrl && (
                <video controls className="aspect-video w-full rounded-lg border border-neutral-800">
                  <source src={videoUrl} type="video/mp4" />
                </video>
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
                disabled={saving || uploadingImage || uploadingVideo}
                onChange={(event) => setField("slug", slugify(event.target.value))}
              />
            </label>
          </section>

          <section className="rounded-xl border border-primary/40 bg-primary/10 p-3">
            <p className="mb-3 text-xs leading-5 text-neutral-300">
              Guarda los datos principales. La galeria se gestiona por separado despues de crear la novedad.
            </p>
            <button
              type="button"
              disabled={!canSave || saving || uploadingImage || uploadingVideo}
              onClick={onSave}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/10 transition hover:bg-primary-dark disabled:bg-neutral-700 disabled:text-neutral-400 disabled:shadow-none"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {isCreate ? "Guardar novedad" : "Guardar cambios"}
            </button>
          </section>
        </aside>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
        <span className="inline-flex items-center gap-1">
          {currentStatus === "PUBLISHED" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {newsStatusOptions[currentStatus][0]?.label ?? currentStatus}
        </span>
        {news?.updatedAt && <span>Ultima actualizacion: {new Date(news.updatedAt).toLocaleString("es-AR")}</span>}
      </div>

      {!news && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 text-sm leading-6 text-neutral-300">
          Para cargar galeria, primero guarda la novedad.
        </div>
      )}

      {news && (
        <>
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 text-sm leading-6 text-neutral-300">
            La preparacion con IA y los borradores para redes quedan para el siguiente bloque.
          </div>
          <NewsGalleryManager newsId={news.id} />
        </>
      )}

      {(uploadingImage || uploadingVideo) && (
        <div className="fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-200 shadow-xl">
          <Upload className="h-4 w-4 animate-pulse" aria-hidden="true" />
          Subiendo archivo
        </div>
      )}
    </div>
  );
}
