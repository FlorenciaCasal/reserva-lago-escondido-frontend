"use client";

import React from "react";
import { Loader2, Pencil, Plus, Save, Sparkles, Trash2, Upload, X } from "lucide-react";
import {
  createProjectAdvance,
  deleteProjectAdvance,
  generateProjectAdvanceDraft,
  listAdminProjectAdvances,
  updateProjectAdvance,
  uploadProjectImage,
  uploadProjectVideo,
} from "@/services/projects";
import type { ProjectAdvance, ProjectAdvanceInput } from "@/types/project";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

const emptyForm: ProjectAdvanceInput = {
  advanceDate: "",
  title: "",
  description: "",
  imageUrl: "",
  imageAssetId: null,
  videoUrl: "",
  videoAssetId: null,
};

const emptyAiBrief = {
  whatHappened: "",
  advanceDate: "",
  relevantData: "",
  tone: "Institucional",
};

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

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ProjectAdvancesManager({ projectId }: { projectId: string }) {
  const [advances, setAdvances] = React.useState<ProjectAdvance[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [uploadingVideo, setUploadingVideo] = React.useState(false);
  const [generatingAiDraft, setGeneratingAiDraft] = React.useState(false);
  const [aiDraftActive, setAiDraftActive] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<ProjectAdvanceInput>(emptyForm);
  const [aiBrief, setAiBrief] = React.useState(emptyAiBrief);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!success) return;

    const timeout = window.setTimeout(() => setSuccess(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [success]);

  React.useEffect(() => {
    listAdminProjectAdvances(projectId)
      .then(setAdvances)
      .catch(() => setError("No se pudieron cargar los avances del proyecto."))
      .finally(() => setLoading(false));
  }, [projectId]);

  const invalidImageUrl = isInvalidLocalUrl(form.imageUrl);
  const invalidVideoUrl = isInvalidLocalUrl(form.videoUrl);
  const canSave =
    form.advanceDate.trim() &&
    form.title.trim() &&
    form.description.trim() &&
    !invalidImageUrl &&
    !invalidVideoUrl;
  const canGenerateAiDraft = Boolean(aiBrief.whatHappened.trim());

  function resetForm() {
    setEditingId(null);
    setAiDraftActive(false);
    setForm(emptyForm);
  }

  function startEdit(advance: ProjectAdvance) {
    setEditingId(advance.id);
    setAiDraftActive(false);
    setForm({
      advanceDate: advance.advanceDate,
      title: advance.title,
      description: advance.description,
      imageUrl: advance.imageUrl ?? "",
      imageAssetId: advance.imageAssetId ?? null,
      videoUrl: advance.videoUrl ?? "",
      videoAssetId: advance.videoAssetId ?? null,
    });
    setError(null);
    setSuccess(null);
  }

  async function onGenerateAiDraft() {
    if (!canGenerateAiDraft) return;

    setGeneratingAiDraft(true);
    setError(null);
    setSuccess(null);

    try {
      const draft = await generateProjectAdvanceDraft(projectId, {
        whatHappened: aiBrief.whatHappened.trim(),
        advanceDate: aiBrief.advanceDate || null,
        relevantData: aiBrief.relevantData.trim() || null,
        tone: aiBrief.tone.trim() || null,
      });

      setEditingId(null);
      setAiDraftActive(true);
      setForm({
        ...emptyForm,
        advanceDate: draft.advanceDate,
        title: draft.title,
        description: draft.description,
      });
      setSuccess("Borrador de avance generado. Revisalo y guardalo manualmente para publicarlo en la linea de tiempo.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el avance con IA.");
    } finally {
      setGeneratingAiDraft(false);
    }
  }

  function cancelAiDraft() {
    setAiDraftActive(false);
    setForm(emptyForm);
    setSuccess("Borrador de avance descartado. No se guardo ningun avance.");
  }

  async function onImageFileChange(file?: File) {
    if (!file) return;
    setUploadingImage(true);
    setError(null);
    setSuccess(null);
    try {
      const uploaded = await uploadProjectImage(file);
      setForm((current) => ({ ...current, imageUrl: uploaded.url, imageAssetId: uploaded.id }));
      setSuccess("Imagen subida correctamente. Recorda guardar el avance para asociarla.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen del avance.");
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
      const uploaded = await uploadProjectVideo(file);
      setForm((current) => ({ ...current, videoUrl: uploaded.url, videoAssetId: uploaded.id }));
      setSuccess("Video subido correctamente. Recorda guardar el avance para asociarlo.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el video del avance.");
    } finally {
      setUploadingVideo(false);
    }
  }

  function clearAdvanceImage() {
    setForm((current) => ({ ...current, imageUrl: "", imageAssetId: null }));
    setSuccess("Imagen quitada del avance. Guarda el avance para confirmar el cambio.");
  }

  function clearAdvanceVideo() {
    setForm((current) => ({ ...current, videoUrl: "", videoAssetId: null }));
    setSuccess("Video quitado del avance. Guarda el avance para confirmar el cambio.");
  }
  async function onSubmit() {
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: ProjectAdvanceInput = {
      advanceDate: form.advanceDate,
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageAssetId ? form.imageUrl?.trim() || null : getPublicUrl(form.imageUrl),
      imageAssetId: form.imageAssetId ?? null,
      videoUrl: form.videoAssetId ? form.videoUrl?.trim() || null : getPublicUrl(form.videoUrl),
      videoAssetId: form.videoAssetId ?? null,
    };

    try {
      if (editingId) {
        const updated = await updateProjectAdvance(projectId, editingId, payload);
        setAdvances((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        setSuccess("Avance actualizado correctamente.");
      } else {
        const created = await createProjectAdvance(projectId, payload);
        setAdvances((current) => [created, ...current]);
        setSuccess("Avance creado correctamente.");
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el avance.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(advanceId: string) {
    if (!window.confirm("Eliminar este avance del proyecto?")) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteProjectAdvance(projectId, advanceId);
      setAdvances((current) => current.filter((item) => item.id !== advanceId));
      if (editingId === advanceId) resetForm();
      setSuccess("Avance eliminado correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el avance.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="project-advances" className="scroll-mt-24 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Avances del proyecto</h2>
          <p className="mt-1 text-sm text-neutral-400">Gestiona la linea de tiempo publica con fecha, descripcion e imagen o video opcional.</p>
        </div>
        <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-800">
          <Plus className="h-4 w-4" />
          Nuevo avance
        </button>
      </div>

      {(error || success) && (
        <div className={`fixed left-1/2 top-16 z-50 w-fit max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl border p-4 text-sm shadow-2xl shadow-black/40 backdrop-blur-md sm:top-4 sm:max-w-3xl ${error ? "border-red-800 bg-red-950/95 text-red-200" : "border-green-800 bg-green-950/95 text-green-200"}`}>
          {error || success}
        </div>
      )}

      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-400">Cargando avances...</div>
          ) : advances.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 p-5 text-sm text-neutral-400">Todavia no hay avances cargados para este proyecto.</div>
          ) : (
            advances.map((advance) => (
              <article key={advance.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary-light">{formatDate(advance.advanceDate)}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{advance.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-neutral-300">{advance.description}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-400">
                      {advance.imageUrl && <span>Imagen vinculada</span>}
                      {advance.videoUrl && <span>Video vinculado</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => startEdit(advance)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800" aria-label="Editar avance"><Pencil className="h-4 w-4" /></button>
                    <button type="button" disabled={saving} onClick={() => onDelete(advance.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-900/70 text-red-200 hover:bg-red-950/50 disabled:opacity-40" aria-label="Eliminar avance"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-light">{editingId ? "Editar avance" : "Crear avance"}</h3>
              <p className="mt-1 text-sm text-neutral-400">Subi imagen y video desde tu equipo. Las URLs manuales quedan como opcion avanzada.</p>
            </div>
            {(editingId || aiDraftActive) && <button type="button" onClick={aiDraftActive ? cancelAiDraft : resetForm} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800" aria-label="Cancelar edicion"><X className="h-4 w-4" /></button>}
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" aria-hidden="true" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Generar avance con IA</h4>
                  <p className="mt-1 text-xs leading-5 text-neutral-400">La IA completa un borrador editable. El avance no se guarda hasta que presiones Crear avance.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Que ocurrio</span>
                  <textarea className={`${inputClass} min-h-24 resize-y leading-relaxed`} value={aiBrief.whatHappened} disabled={saving || generatingAiDraft} placeholder="Ej: Se realizo un monitoreo de ejemplares nativos y se registraron nuevos puntos de regeneracion." onChange={(event) => setAiBrief((current) => ({ ...current, whatHappened: event.target.value }))} />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Fecha sugerida</span>
                    <input type="date" className={inputClass} value={aiBrief.advanceDate} disabled={saving || generatingAiDraft} onChange={(event) => setAiBrief((current) => ({ ...current, advanceDate: event.target.value }))} />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Tono</span>
                    <input className={inputClass} value={aiBrief.tone} disabled={saving || generatingAiDraft} placeholder="Institucional" onChange={(event) => setAiBrief((current) => ({ ...current, tone: event.target.value }))} />
                  </label>
                </div>
                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Datos relevantes</span>
                  <textarea className={`${inputClass} min-h-20 resize-y leading-relaxed`} value={aiBrief.relevantData} disabled={saving || generatingAiDraft} placeholder="Fechas, lugares, participantes o resultados que no deberian omitirse." onChange={(event) => setAiBrief((current) => ({ ...current, relevantData: event.target.value }))} />
                </label>
                <button type="button" disabled={!canGenerateAiDraft || saving || generatingAiDraft} onClick={onGenerateAiDraft} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/50 px-4 py-2.5 text-sm font-semibold text-primary-light hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-50">
                  {generatingAiDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generar avance con IA
                </button>
              </div>
            </div>

            {aiDraftActive && (
              <div className="rounded-lg border border-primary/30 bg-neutral-950/70 p-3 text-xs leading-5 text-neutral-300">
                Borrador IA activo: podes editar fecha, titulo y descripcion antes de guardarlo. Si lo descartas, no se crea ningun avance.
              </div>
            )}

            <label className="block space-y-1"><span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Fecha</span><input type="date" className={inputClass} value={form.advanceDate} disabled={saving || uploadingImage || uploadingVideo} onChange={(event) => setForm((current) => ({ ...current, advanceDate: event.target.value }))} /></label>
            <label className="block space-y-1"><span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Titulo</span><input className={inputClass} value={form.title} disabled={saving || uploadingImage || uploadingVideo} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></label>
            <label className="block space-y-1"><span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Descripcion</span><textarea className={`${inputClass} min-h-36 resize-y leading-relaxed`} value={form.description} disabled={saving || uploadingImage || uploadingVideo} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>


            <label className="block space-y-2 rounded-lg border border-dashed border-neutral-700 p-3 text-sm text-neutral-300">
              <span className="inline-flex items-center gap-2 font-semibold text-neutral-100"><Upload className="h-4 w-4" />{form.imageUrl ? "Cambiar imagen" : "Seleccionar imagen"}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" disabled={saving || uploadingImage || uploadingVideo} onChange={(event) => onImageFileChange(event.target.files?.[0])} className="block w-full text-xs text-neutral-400 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark" />
              {uploadingImage && <span className="text-xs text-primary-light">Subiendo imagen...</span>}
              {form.imageUrl && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                  <span>Imagen actual: se reemplazara si elegis otro archivo.</span>
                  <button type="button" disabled={saving || uploadingImage || uploadingVideo} onClick={clearAdvanceImage} className="font-semibold text-red-300 hover:text-red-200 disabled:opacity-50">Quitar imagen</button>
                </div>
              )}
            </label>
            <details className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-neutral-400">URL manual de imagen</summary>
              <label className="mt-3 block space-y-1">
                <input className={inputClass} value={form.imageUrl ?? ""} disabled={saving || uploadingImage || uploadingVideo} placeholder="/img/proyectos/avance.jpg" onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value, imageAssetId: null }))} />
                {invalidImageUrl && <p className="text-xs leading-5 text-yellow">Usa /img/..., /api/media/... o una URL http(s). No se permiten rutas C:\.</p>}
              </label>
            </details>

            <label className="block space-y-2 rounded-lg border border-dashed border-neutral-700 p-3 text-sm text-neutral-300">
              <span className="inline-flex items-center gap-2 font-semibold text-neutral-100"><Upload className="h-4 w-4" />{form.videoUrl ? "Cambiar video" : "Seleccionar video"}</span>
              <input type="file" accept="video/mp4" disabled={saving || uploadingImage || uploadingVideo} onChange={(event) => onVideoFileChange(event.target.files?.[0])} className="block w-full text-xs text-neutral-400 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark" />
              {uploadingVideo && <span className="text-xs text-primary-light">Subiendo video...</span>}
              {form.videoUrl && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                  <span>Video actual: se reemplazara si elegis otro archivo.</span>
                  <button type="button" disabled={saving || uploadingImage || uploadingVideo} onClick={clearAdvanceVideo} className="font-semibold text-red-300 hover:text-red-200 disabled:opacity-50">Quitar video</button>
                </div>
              )}
            </label>

            <details className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-neutral-400">URL manual de video</summary>
              <label className="mt-3 block space-y-1">
                <input className={inputClass} value={form.videoUrl ?? ""} disabled={saving || uploadingImage || uploadingVideo} placeholder="https://..." onChange={(event) => setForm((current) => ({ ...current, videoUrl: event.target.value, videoAssetId: null }))} />
                {invalidVideoUrl && <p className="text-xs leading-5 text-yellow">Usa /videos/... o una URL http(s). No se permiten rutas C:\.</p>}
              </label>
            </details>

            <button type="button" disabled={!canSave || saving || uploadingImage || uploadingVideo} onClick={onSubmit} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-neutral-700 disabled:text-neutral-400">
              <Save className="h-4 w-4" />
              {editingId ? "Guardar avance" : "Crear avance"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
