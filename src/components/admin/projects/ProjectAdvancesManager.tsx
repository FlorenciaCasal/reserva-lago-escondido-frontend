"use client";

import React from "react";
import { Loader2, Pencil, Save, Sparkles, Trash2, X } from "lucide-react";
import MediaGalleryManager from "@/components/admin/media/MediaGalleryManager";
import {
  createProjectAdvance,
  createProjectAdvanceGalleryItem,
  deleteProjectAdvance,
  deleteProjectAdvanceGalleryItem,
  generateProjectAdvanceDraft,
  listAdminProjectAdvanceGallery,
  listAdminProjectAdvances,
  updateProjectAdvance,
  updateProjectAdvanceGalleryItem,
  uploadProjectImage,
} from "@/services/projects";
import type { MediaGalleryItemInput, ProjectAdvance, ProjectAdvanceInput } from "@/types/project";

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

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function compareAdvancesByTimeline(first: ProjectAdvance, second: ProjectAdvance) {
  const dateCompare = first.advanceDate.localeCompare(second.advanceDate);
  if (dateCompare !== 0) return dateCompare;

  const firstCreatedAt = first.createdAt ?? "";
  const secondCreatedAt = second.createdAt ?? "";
  const createdAtCompare = firstCreatedAt.localeCompare(secondCreatedAt);
  if (createdAtCompare !== 0) return createdAtCompare;

  return first.id.localeCompare(second.id);
}

function sortAdvancesByTimeline(advances: ProjectAdvance[]) {
  return [...advances].sort(compareAdvancesByTimeline);
}

function formFromAdvance(advance: ProjectAdvance): ProjectAdvanceInput {
  return {
    advanceDate: advance.advanceDate,
    title: advance.title,
    description: advance.description,
    imageUrl: advance.imageUrl ?? "",
    imageAssetId: advance.imageAssetId ?? null,
    videoUrl: advance.videoUrl ?? "",
    videoAssetId: advance.videoAssetId ?? null,
  };
}

function ProjectAdvanceMediaManager({ projectId, advanceId }: { projectId: string; advanceId: string }) {
  const loadItems = React.useCallback(() => listAdminProjectAdvanceGallery(projectId, advanceId), [projectId, advanceId]);
  const createItem = React.useCallback((input: MediaGalleryItemInput) => createProjectAdvanceGalleryItem(projectId, advanceId, input), [projectId, advanceId]);
  const updateItem = React.useCallback((itemId: string, input: MediaGalleryItemInput) => updateProjectAdvanceGalleryItem(projectId, advanceId, itemId, input), [projectId, advanceId]);
  const deleteItem = React.useCallback((itemId: string) => deleteProjectAdvanceGalleryItem(projectId, advanceId, itemId), [projectId, advanceId]);

  return (
    <MediaGalleryManager
      compact
      title="Multimedia del avance"
      description="Imagenes y videos de YouTube propios de este avance."
      emptyMessage="Este avance no tiene multimedia cargada."
      loadItems={loadItems}
      createItem={createItem}
      updateItem={updateItem}
      deleteItem={deleteItem}
      uploadImage={uploadProjectImage}
    />
  );
}

export default function ProjectAdvancesManager({ projectId }: { projectId: string }) {
  const [advances, setAdvances] = React.useState<ProjectAdvance[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
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
      .then((items) => setAdvances(sortAdvancesByTimeline(items)))
      .catch(() => setError("No se pudieron cargar los avances del proyecto."))
      .finally(() => setLoading(false));
  }, [projectId]);

  const canSave = Boolean(form.advanceDate.trim() && form.title.trim() && form.description.trim());
  const canGenerateAiDraft = Boolean(aiBrief.whatHappened.trim());

  function resetForm() {
    setEditingId(null);
    setAiDraftActive(false);
    setForm(emptyForm);
  }

  function startEdit(advance: ProjectAdvance) {
    setEditingId(advance.id);
    setAiDraftActive(false);
    setForm(formFromAdvance(advance));
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

      setAiDraftActive(true);
      setForm((current) => ({
        ...current,
        advanceDate: draft.advanceDate,
        title: draft.title,
        description: draft.description,
      }));
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

  async function onSubmit() {
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: ProjectAdvanceInput = {
      advanceDate: form.advanceDate,
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl ?? null,
      imageAssetId: form.imageAssetId ?? null,
      videoUrl: form.videoUrl ?? null,
      videoAssetId: form.videoAssetId ?? null,
    };

    try {
      if (editingId) {
        const updated = await updateProjectAdvance(projectId, editingId, payload);
        setAdvances((current) => sortAdvancesByTimeline(current.map((item) => (item.id === updated.id ? updated : item))));
        setForm(formFromAdvance(updated));
        setSuccess("Avance actualizado correctamente.");
      } else {
        const created = await createProjectAdvance(projectId, payload);
        setAdvances((current) => sortAdvancesByTimeline([...current, created]));
        setEditingId(created.id);
        setAiDraftActive(false);
        setForm(formFromAdvance(created));
        setSuccess("Avance creado correctamente. Ahora podes agregar multimedia del avance.");
      }
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
      <div>
        <div>
          <h2 className="text-lg font-semibold text-white">Avances del proyecto</h2>
          <p className="mt-1 text-sm text-neutral-400">Gestiona la linea de tiempo publica con fecha, descripcion y multimedia propia.</p>
        </div>
      </div>

      {(error || success) && (
        <div className={`fixed left-1/2 top-16 z-50 w-fit max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl border p-4 text-sm shadow-2xl shadow-black/40 backdrop-blur-md sm:top-4 sm:max-w-3xl ${error ? "border-red-800 bg-red-950/95 text-red-200" : "border-green-800 bg-green-950/95 text-green-200"}`}>
          {error || success}
        </div>
      )}

      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(560px,1.15fr)]">
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
                      {advance.imageUrl && <span>Imagen legacy vinculada</span>}
                      {advance.videoUrl && <span>Video legacy vinculado</span>}
                      {advance.gallery && advance.gallery.length > 0 && <span>{advance.gallery.length} item(s) multimedia</span>}
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
              <p className="mt-1 text-sm text-neutral-400">
                Completa fecha, titulo y descripcion. Despues de guardar, administra imagenes y videos de YouTube con la galeria multimedia del avance.
              </p>
            </div>
            {(editingId || aiDraftActive) && <button type="button" onClick={aiDraftActive ? cancelAiDraft : resetForm} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800" aria-label="Cancelar edicion"><X className="h-4 w-4" /></button>}
          </div>

          <div className="mt-4 space-y-4">
            {!editingId && (
              <>
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
              </>
            )}

            <label className="block space-y-1"><span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Fecha</span><input type="date" className={inputClass} value={form.advanceDate} disabled={saving} onChange={(event) => setForm((current) => ({ ...current, advanceDate: event.target.value }))} /></label>
            <label className="block space-y-1"><span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Titulo</span><input className={inputClass} value={form.title} disabled={saving} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></label>
            <label className="block space-y-1"><span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Descripcion</span><textarea className={`${inputClass} min-h-36 resize-y leading-relaxed`} value={form.description} disabled={saving} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>

            <button type="button" disabled={!canSave || saving} onClick={onSubmit} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-neutral-700 disabled:text-neutral-400">
              <Save className="h-4 w-4" />
              {editingId ? "Guardar avance" : "Crear avance"}
            </button>

            {editingId ? (
              <ProjectAdvanceMediaManager projectId={projectId} advanceId={editingId} />
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-700 bg-neutral-950/60 p-4 text-sm leading-6 text-neutral-400">
                Guarda el avance para habilitar la carga de multiples imagenes y videos de YouTube.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
