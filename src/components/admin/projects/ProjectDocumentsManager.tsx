"use client";

import React from "react";
import { ArrowDown, ArrowUp, ExternalLink, FileText, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import {
  createProjectDocument,
  deleteProjectDocument,
  listAdminProjectDocuments,
  updateProjectDocument,
  uploadProjectDocument,
} from "@/services/projects";
import type { ProjectDocument, ProjectDocumentInput } from "@/types/project";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

const emptyForm: ProjectDocumentInput = {
  title: "",
  description: "",
  fileUrl: "",
  mediaAssetId: null,
  fileType: "",
  sortOrder: 0,
};

function getPublicFileUrl(value?: string | null) {
  const url = value?.trim();
  if (!url) return "";
  if (
    url.startsWith("/docs/") ||
    url.startsWith("/files/") ||
    url.startsWith("/api/media/") ||
    url.startsWith("https://") ||
    url.startsWith("http://")
  ) {
    return url;
  }
  return "";
}

function isInvalidFileUrl(value?: string | null) {
  const url = value?.trim();
  return Boolean(url) && !getPublicFileUrl(url);
}

function normalizeSortOrder(value: number | undefined) {
  return Number.isFinite(value) && value !== undefined && value >= 0 ? value : 0;
}

function fileTypeFromContentType(contentType: string) {
  if (contentType === "application/pdf") return "PDF";
  if (contentType === "application/msword") return "DOC";
  if (contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "DOCX";
  return "";
}

export default function ProjectDocumentsManager({ projectId }: { projectId: string }) {
  const [documents, setDocuments] = React.useState<ProjectDocument[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState<ProjectDocumentInput>(emptyForm);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!success) return;

    const timeout = window.setTimeout(() => setSuccess(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [success]);

  React.useEffect(() => {
    listAdminProjectDocuments(projectId)
      .then(setDocuments)
      .catch(() => setError("No se pudieron cargar los documentos del proyecto."))
      .finally(() => setLoading(false));
  }, [projectId]);

  const invalidFileUrl = isInvalidFileUrl(form.fileUrl);
  const canSave = form.title.trim() && (form.mediaAssetId || form.fileUrl.trim()) && !invalidFileUrl;

  function sortedDocuments(items: ProjectDocument[]) {
    return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt?.localeCompare(b.createdAt ?? "") || 0);
  }

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setForm({ ...emptyForm, sortOrder: documents.length });
  }

  function openAddForm() {
    setEditingId(null);
    setShowForm(true);
    setForm({ ...emptyForm, sortOrder: sortedDocuments(documents).length });
    setError(null);
    setSuccess(null);
  }

  function startEdit(document: ProjectDocument) {
    setEditingId(document.id);
    setShowForm(true);
    setForm({
      title: document.title,
      description: document.description ?? "",
      fileUrl: document.fileUrl,
      mediaAssetId: document.mediaAssetId ?? null,
      fileType: document.fileType ?? "",
      sortOrder: document.sortOrder,
    });
    setError(null);
    setSuccess(null);
  }

  async function onFileChange(files?: FileList | null) {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        const uploaded = await uploadProjectDocument(selectedFiles[0]);
        setForm((current) => ({
          ...current,
          fileUrl: uploaded.url,
          mediaAssetId: uploaded.id,
          fileType: current.fileType?.trim() || fileTypeFromContentType(uploaded.contentType),
          title: current.title || uploaded.originalFilename.replace(/\.[^.]+$/, ""),
        }));
        setSuccess("Documento subido correctamente. Guarda el documento para confirmar el cambio.");
        return;
      }

      const createdDocuments: ProjectDocument[] = [];
      const startOrder = sortedDocuments(documents).length;
      for (const [index, file] of selectedFiles.entries()) {
        const uploaded = await uploadProjectDocument(file);
        const created = await createProjectDocument(projectId, {
          title: uploaded.originalFilename.replace(/\.[^.]+$/, ""),
          description: null,
          fileUrl: uploaded.url,
          mediaAssetId: uploaded.id,
          fileType: fileTypeFromContentType(uploaded.contentType),
          sortOrder: startOrder + index,
        });
        createdDocuments.push(created);
      }

      setDocuments((current) => sortedDocuments([...current, ...createdDocuments]));
      setShowForm(false);
      setSuccess(`${createdDocuments.length} documento(s) agregado(s) correctamente.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el documento.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit() {
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: ProjectDocumentInput = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      fileUrl: form.mediaAssetId ? form.fileUrl.trim() : getPublicFileUrl(form.fileUrl),
      mediaAssetId: form.mediaAssetId ?? null,
      fileType: form.fileType?.trim() || null,
      sortOrder: normalizeSortOrder(form.sortOrder),
    };

    try {
      if (editingId) {
        const updated = await updateProjectDocument(projectId, editingId, payload);
        setDocuments((current) => sortedDocuments(current.map((item) => (item.id === updated.id ? updated : item))));
        setSuccess("Documento actualizado correctamente.");
      } else {
        const created = await createProjectDocument(projectId, payload);
        setDocuments((current) => sortedDocuments([...current, created]));
        setSuccess("Documento agregado correctamente.");
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el documento.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(documentId: string) {
    if (!window.confirm("Eliminar este documento del proyecto?")) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteProjectDocument(projectId, documentId);
      setDocuments((current) => current.filter((item) => item.id !== documentId));
      if (editingId === documentId) resetForm();
      setSuccess("Documento eliminado correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el documento.");
    } finally {
      setSaving(false);
    }
  }

  async function moveDocument(document: ProjectDocument, direction: -1 | 1) {
    const current = sortedDocuments(documents);
    const index = current.findIndex((item) => item.id === document.id);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= current.length) return;

    const first = current[index];
    const second = current[swapWith];

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedFirst = await updateProjectDocument(projectId, first.id, {
        title: first.title,
        description: first.description,
        fileUrl: first.fileUrl,
        mediaAssetId: first.mediaAssetId ?? null,
        fileType: first.fileType,
        sortOrder: second.sortOrder,
      });
      const updatedSecond = await updateProjectDocument(projectId, second.id, {
        title: second.title,
        description: second.description,
        fileUrl: second.fileUrl,
        mediaAssetId: second.mediaAssetId ?? null,
        fileType: second.fileType,
        sortOrder: first.sortOrder,
      });

      setDocuments((items) =>
        sortedDocuments(items.map((item) => (item.id === updatedFirst.id ? updatedFirst : item.id === updatedSecond.id ? updatedSecond : item)))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reordenar documentos.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="project-documents" className="scroll-mt-24 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Documentos del proyecto</h2>
          <p className="mt-1 text-sm text-neutral-400">Administra fichas, informes o materiales vinculados mediante archivo, URL o asset interno.</p>
        </div>
      </div>

      {(error || success) && (
        <div className={`fixed left-1/2 top-16 z-50 w-fit max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl border p-4 text-sm shadow-2xl shadow-black/40 backdrop-blur-md sm:top-4 sm:max-w-3xl ${error ? "border-red-800 bg-red-950/95 text-red-200" : "border-green-800 bg-green-950/95 text-green-200"}`}>
          {error || success}
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-400">Cargando documentos...</div>
          ) : documents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 p-5 text-sm text-neutral-400">Todavia no hay documentos asociados a este proyecto.</div>
          ) : (
            sortedDocuments(documents).map((document, index) => (
              <article key={document.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-primary-light">
                      <FileText className="h-4 w-4" />
                      <p className="text-xs font-medium uppercase tracking-wide">Orden {document.sortOrder}{document.fileType ? ` · ${document.fileType}` : ""}</p>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-white">{document.title}</h3>
                    {document.description && <p className="mt-2 text-sm leading-6 text-neutral-300">{document.description}</p>}
                    <a href={document.fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-center gap-2 truncate text-sm text-primary-light hover:underline">
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      <span className="truncate">{document.fileUrl}</span>
                    </a>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button type="button" disabled={saving || index === 0} onClick={() => moveDocument(document, -1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40" aria-label="Subir documento"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" disabled={saving || index === documents.length - 1} onClick={() => moveDocument(document, 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40" aria-label="Bajar documento"><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" onClick={() => startEdit(document)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800" aria-label="Editar documento"><Pencil className="h-4 w-4" /></button>
                    <button type="button" disabled={saving} onClick={() => onDelete(document.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-900/70 text-red-200 hover:bg-red-950/50 disabled:opacity-40" aria-label="Eliminar documento"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))
          )}
          {!loading && !editingId && (
            <button
              type="button"
              onClick={openAddForm}
              className="flex min-h-28 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/30 p-4 text-center text-neutral-400 transition hover:border-primary/70 hover:bg-neutral-900/60 hover:text-primary-light"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-100">
                <Plus className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold">Nuevo documento</span>
            </button>
          )}
        </div>

        {(showForm || editingId) && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-light">{editingId ? "Editar documento" : "Agregar documento"}</h3>
              <p className="mt-1 text-sm text-neutral-400">Subi PDF/DOC/DOCX. La URL manual queda como opcion avanzada.</p>
            </div>
            {editingId && <button type="button" onClick={resetForm} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800" aria-label="Cancelar edicion"><X className="h-4 w-4" /></button>}
          </div>

          <div className="mt-4 space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Titulo</span>
              <input className={inputClass} value={form.title} disabled={saving || uploading} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </label>


            <label className="block space-y-2 rounded-lg border border-dashed border-neutral-700 p-3 text-sm text-neutral-300">
              <span className="inline-flex items-center gap-2 font-semibold text-neutral-100"><Upload className="h-4 w-4" />Seleccionar archivo</span>
              <input type="file" multiple={!editingId} accept="application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={saving || uploading} onChange={(event) => onFileChange(event.target.files)} className="block w-full text-xs text-neutral-400 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark" />
              {uploading && <span className="text-xs text-primary-light">Subiendo documentos...</span>}
            </label>
            <details className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-neutral-400">URL manual del archivo</summary>
              <label className="mt-3 block space-y-1">
                <input className={inputClass} value={form.fileUrl} disabled={saving || uploading} placeholder="/docs/informe.pdf" onChange={(event) => setForm((current) => ({ ...current, fileUrl: event.target.value, mediaAssetId: null }))} />
                {invalidFileUrl && <p className="text-xs leading-5 text-yellow">Usa /docs/..., /files/..., /api/media/... o una URL http(s). No se permiten rutas C:\.</p>}
              </label>
            </details>

            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Descripcion</span>
              <textarea className={`${inputClass} min-h-24 resize-y leading-relaxed`} value={form.description ?? ""} disabled={saving || uploading} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Tipo</span>
                <input className={inputClass} value={form.fileType ?? ""} disabled={saving || uploading} placeholder="PDF" onChange={(event) => setForm((current) => ({ ...current, fileType: event.target.value }))} />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Orden</span>
                <input type="number" min={0} className={inputClass} value={form.sortOrder ?? 0} disabled={saving || uploading} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} />
              </label>
            </div>

            <button type="button" disabled={!canSave || saving || uploading} onClick={onSubmit} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:bg-neutral-700 disabled:text-neutral-400">
              <Save className="h-4 w-4" />
              {editingId ? "Guardar documento" : "Agregar documento"}
            </button>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
