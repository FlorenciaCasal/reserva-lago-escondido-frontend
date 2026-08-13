"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Sparkles, Upload } from "lucide-react";
import { createNews, generateNewsDraft, uploadNewsImage } from "@/services/news";
import type { GenerateNewsInput, GeneratedNewsDraft, NewsStatus } from "@/types/news";
import NewsWebPreview from "@/components/admin/news/NewsWebPreview";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

const initialInput: GenerateNewsInput = {
  brief: "",
  objective: "",
  targetAudience: "",
  imageUrl: "",
};

const emptyDraft: GeneratedNewsDraft = {
  title: "",
  summary: "",
  content: "",
  slug: "",
  imageUrl: "",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Ocurrio un error inesperado.";
}

function getPublicUrl(value?: string | null) {
  const url = value?.trim();
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("https://") || url.startsWith("http://")) return url;
  return "";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export default function NewsAiForm() {
  const router = useRouter();
  const [input, setInput] = React.useState<GenerateNewsInput>(initialInput);
  const [draft, setDraft] = React.useState<GeneratedNewsDraft | null>(null);
  const [imageAssetId, setImageAssetId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<NewsStatus>("DRAFT");
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!success) return;

    const timeout = window.setTimeout(() => setSuccess(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [success]);

  const activeDraft = draft ?? emptyDraft;
  const imageUrl = getPublicUrl(activeDraft.imageUrl || input.imageUrl);
  const invalidImageUrl = Boolean((activeDraft.imageUrl || input.imageUrl)?.trim()) && !imageUrl;
  const canGenerate = Boolean(input.brief.trim());
  const canSave =
    Boolean(draft?.title.trim()) &&
    Boolean(draft?.summary.trim()) &&
    Boolean(draft?.content.trim()) &&
    Boolean(draft?.slug.trim()) &&
    !invalidImageUrl;
  const busy = generating || saving || uploadingImage;

  function setInputField<K extends keyof GenerateNewsInput>(key: K, value: GenerateNewsInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function updateDraft(next: Partial<GeneratedNewsDraft>) {
    setDraft((current) => ({ ...(current ?? emptyDraft), ...next }));
  }

  async function onImageFileChange(file?: File) {
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    setSuccess(null);

    try {
      const uploaded = await uploadNewsImage(file);
      setImageAssetId(uploaded.id);
      setInputField("imageUrl", uploaded.url);
      if (draft) updateDraft({ imageUrl: uploaded.url });
      setSuccess("Imagen subida. Se asociara al guardar la novedad.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploadingImage(false);
    }
  }

  function clearInputImage() {
    setInputField("imageUrl", "");
    setImageAssetId(null);
    if (draft) updateDraft({ imageUrl: "" });
    setSuccess("Imagen principal quitada. La novedad se guardara sin imagen principal.");
  }

  async function onGenerate() {
    if (!canGenerate) return;

    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const generated = await generateNewsDraft({
        ...input,
        imageUrl: getPublicUrl(input.imageUrl),
      });
      setDraft(generated);
      setSuccess("Borrador generado. Revisalo y editalo antes de guardar.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  async function onSave() {
    if (!draft) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const saved = await createNews({
        title: draft.title,
        summary: draft.summary,
        content: draft.content,
        slug: draft.slug,
        imageUrl,
        imageAssetId,
        videoUrl: null,
        videoAssetId: null,
        status,
      });
      router.push(`/admin/novedades/${saved.id}/editar`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {(error || success) && (
        <div
          className={`fixed left-1/2 top-16 z-50 w-fit max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl border p-4 text-sm shadow-2xl shadow-black/40 backdrop-blur-md sm:top-4 sm:max-w-3xl ${
            error
              ? "border-red-800 bg-red-950/95 text-red-200"
              : "border-green-800 bg-green-950/95 text-green-200"
          }`}
        >
          {error || success}
        </div>
      )}

      <section className="rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="border-b border-neutral-800 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
            Paso 1
          </p>
          <h2 className="text-base font-semibold text-neutral-100">Brief editorial</h2>
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Tema / informacion base
              </span>
              <textarea
                className={`${inputClass} min-h-44 resize-y leading-relaxed`}
                disabled={busy}
                value={input.brief}
                placeholder="Ej.: Jornada de restauracion, monitoreo de fauna, actividad educativa o comunicacion institucional relevante."
                onChange={(event) => setInputField("brief", event.target.value)}
              />
              <p className="text-xs leading-5 text-neutral-500">
                Contale a la IA de que se trata la novedad. No hace falta redactarlo para publicacion; puede ser una sintesis breve o notas internas.
              </p>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Tono
                </span>
                <select
                  className={inputClass}
                  disabled={busy}
                  value={input.objective ?? ""}
                  onChange={(event) => setInputField("objective", event.target.value)}
                >
                  <option value="">Institucional, claro y cercano</option>
                  <option value="Institucional y preciso">Institucional y preciso</option>
                  <option value="Cercano y divulgativo">Cercano y divulgativo</option>
                  <option value="Convocante y participativo">Convocante y participativo</option>
                  <option value="Informativo y sobrio">Informativo y sobrio</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Publico objetivo
                </span>
                <input
                  className={inputClass}
                  disabled={busy}
                  value={input.targetAudience ?? ""}
                  placeholder="Ej.: comunidad local, visitantes, escuelas, publico general."
                  onChange={(event) => setInputField("targetAudience", event.target.value)}
                />
              </label>
            </div>
          </div>

          <aside className="space-y-4">
            <label className="block space-y-2 rounded-lg border border-dashed border-neutral-700 p-3 text-sm text-neutral-300">
              <span className="inline-flex items-center gap-2 font-semibold text-neutral-100">
                <Upload className="h-4 w-4" />
                Imagen principal
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={(event) => onImageFileChange(event.target.files?.[0])}
                className="sr-only"
              />
              <span className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition hover:bg-neutral-800 aria-disabled:pointer-events-none aria-disabled:opacity-60" aria-disabled={busy}>
                {imageUrl ? "Cambiar imagen" : "Seleccionar imagen"}
              </span>
              {uploadingImage && <span className="text-xs text-primary-light">Subiendo imagen...</span>}
              {imageUrl && (
                <button type="button" disabled={busy} onClick={clearInputImage} className="text-left text-xs font-semibold text-neutral-500 hover:text-red-200 disabled:opacity-50">Quitar imagen</button>
              )}
            </label>

            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="aspect-video w-full rounded-lg border border-neutral-800 object-cover" />
            )}
          </aside>
        </div>

        <div className="flex justify-end border-t border-neutral-800 p-4">
          <button
            type="button"
            disabled={!canGenerate || busy}
            onClick={onGenerate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 sm:w-auto"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generar borrador
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="border-b border-neutral-800 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
            Paso 2
          </p>
          <h2 className="text-base font-semibold text-neutral-100">Novedad generada</h2>
        </div>

        {draft ? (
          <>
            <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]">
              <div className="space-y-4">
                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Titulo
                  </span>
                  <input
                    className={inputClass}
                    disabled={busy}
                    value={activeDraft.title}
                    onChange={(event) => {
                      const title = event.target.value;
                      updateDraft({ title, slug: activeDraft.slug ? activeDraft.slug : slugify(title) });
                    }}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Resumen
                  </span>
                  <textarea
                    className={`${inputClass} min-h-24 resize-y`}
                    disabled={busy}
                    value={activeDraft.summary}
                    onChange={(event) => updateDraft({ summary: event.target.value })}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Contenido
                  </span>
                  <textarea
                    className={`${inputClass} min-h-52 resize-y leading-relaxed`}
                    disabled={busy}
                    value={activeDraft.content}
                    onChange={(event) => updateDraft({ content: event.target.value })}
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Slug
                    </span>
                    <input
                      className={inputClass}
                      disabled={busy}
                      value={activeDraft.slug}
                      onChange={(event) => updateDraft({ slug: slugify(event.target.value) })}
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Estado
                    </span>
                    <select
                      className={inputClass}
                      disabled={busy}
                      value={status}
                      onChange={(event) => setStatus(event.target.value as NewsStatus)}
                    >
                      <option value="DRAFT">Borrador</option>
                      <option value="PUBLISHED">Publicado</option>
                    </select>
                  </label>
                </div>
              </div>

              <NewsWebPreview
                title={activeDraft.title}
                summary={activeDraft.summary}
                content={activeDraft.content}
                slug={activeDraft.slug}
                imageUrl={imageUrl}
              />
            </div>

            <div className="flex justify-end border-t border-neutral-800 p-4">
              <button
                type="button"
                disabled={!canSave || busy}
                onClick={onSave}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 sm:w-auto"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar novedad
              </button>
            </div>
          </>
        ) : (
          <div className="p-4">
            <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 p-6 text-sm leading-6 text-neutral-400">
              Completa el brief y genera un borrador. Aca vas a poder editar titulo, resumen, contenido, slug y estado antes de guardar la novedad.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
