"use client";

import React from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Loader2, Plus, Save, Sparkles, Trash2, Upload } from "lucide-react";
import {
  createProject,
  createProjectDocument,
  createProjectImage,
  generateProjectDraft,
  listAdminProjects,
  uploadProjectImage,
  uploadProjectDocument,
} from "@/services/projects";
import type {
  GenerateProjectInput,
  GeneratedProjectDraft,
  Project,
  ProjectDocumentInput,
  ProjectImageInput,
  ProjectStatus,
} from "@/types/project";

const initialInput: GenerateProjectInput = {
  description: "",
  objective: "",
  targetAudience: "",
  highlights: "",
  imageUrl: "",
};

const targetAudienceOptions = [
  "Publico general",
  "Instituciones educativas",
  "Comunidad cientifica",
  "Organismos publicos",
  "Visitantes de la reserva",
  "Comunidad local",
  "Medios de comunicacion",
  "Organizaciones ambientales",
];

const customTargetAudienceOption = "Otro / publico objetivo personalizado";

const customObjectiveOption = "Otro / objetivo personalizado";

const communicationObjectiveOptions = [
  "Difundir el trabajo de conservacion que se realiza para proteger los bosques de alerce.",
  "Concientizar sobre la importancia de conservar los alerces frente al cambio climatico.",
  "Dar a conocer la investigacion cientifica que respalda la restauracion de los bosques de alerce.",
  "Visibilizar el compromiso de la Reserva Natural Lago Escondido con la conservacion y la investigacion cientifica.",
  "Comunicar el valor del proyecto para fomentar nuevas alianzas cientificas e institucionales.",
  customObjectiveOption,
];

const targetAudienceSelectOptions = [
  ...targetAudienceOptions,
  customTargetAudienceOption,
];

const emptyDraft: GeneratedProjectDraft = {
  title: "",
  summary: "",
  content: "",
  slug: "",
  imageUrl: "",
};

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

type DraftGalleryImage = ProjectImageInput & {
  clientId: string;
};

const emptyGalleryImage: ProjectImageInput = {
  imageUrl: "",
  altText: "",
  caption: "",
  sortOrder: 0,
};

type DraftProjectDocument = ProjectDocumentInput & {
  clientId: string;
};

const emptyProjectDocument: ProjectDocumentInput = {
  title: "",
  description: "",
  fileUrl: "",
  fileType: "",
  sortOrder: 0,
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Ocurrio un error inesperado.";
}

function getPublicImageUrl(value?: string | null) {
  const url = value?.trim();
  if (!url) return "";

  if (url.startsWith("/") || url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  }

  return "";
}

function getGalleryImageUrl(value?: string | null) {
  const url = value?.trim();
  if (!url) return "";

  if (url.startsWith("/img/") || url.startsWith("/api/media/") || url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  }

  return "";
}

function getProjectDocumentUrl(value?: string | null) {
  const url = value?.trim();
  if (!url) return "";

  if (url.startsWith("/docs/") || url.startsWith("/files/") || url.startsWith("/api/media/") || url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  }

  return "";
}

function normalizeSortOrder(value: number | undefined) {
  return Number.isFinite(value) && value !== undefined && value >= 0 ? value : 0;
}

function normalizeGalleryDrafts(items: DraftGalleryImage[]) {
  return items
    .slice()
    .sort((a, b) => normalizeSortOrder(a.sortOrder) - normalizeSortOrder(b.sortOrder))
    .map((image, index) => ({ ...image, sortOrder: index }));
}
function documentTypeFromContentType(contentType: string) {
  if (contentType === "application/pdf") return "PDF";
  if (contentType === "application/msword") return "DOC";
  if (contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "DOCX";
  return "";
}

export default function ProjectAiForm() {
  const [input, setInput] = React.useState<GenerateProjectInput>(initialInput);
  const [selectedObjectiveOptions, setSelectedObjectiveOptions] = React.useState<string[]>([]);
  const [selectedTargetAudiences, setSelectedTargetAudiences] = React.useState<string[]>([]);
  const [draft, setDraft] = React.useState<GeneratedProjectDraft | null>(null);
  const [inputImageAssetId, setInputImageAssetId] = React.useState<string | null>(null);
  const [galleryImages, setGalleryImages] = React.useState<DraftGalleryImage[]>([]);
  const [galleryForm, setGalleryForm] = React.useState<ProjectImageInput>(emptyGalleryImage);
  const [showGalleryForm, setShowGalleryForm] = React.useState(false);
  const [projectDocuments, setProjectDocuments] = React.useState<DraftProjectDocument[]>([]);
  const [documentForm, setDocumentForm] = React.useState<ProjectDocumentInput>(emptyProjectDocument);
  const [showDocumentForm, setShowDocumentForm] = React.useState(false);
  const [status, setStatus] = React.useState<ProjectStatus>("PUBLISHED");
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loadingList, setLoadingList] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploadingMainImage, setUploadingMainImage] = React.useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = React.useState(false);
  const [uploadingDocument, setUploadingDocument] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const activeDraft = draft ?? emptyDraft;
  const customObjectiveSelected = selectedObjectiveOptions.includes(customObjectiveOption);
  const customTargetAudienceSelected = selectedTargetAudiences.includes(customTargetAudienceOption);
  const combinedObjective = [
    selectedObjectiveOptions.filter((option) => option !== customObjectiveOption).join(" "),
    customObjectiveSelected ? input.objective.trim() : "",
  ]
    .filter(Boolean)
    .join(" ");
  const combinedTargetAudience = [
    selectedTargetAudiences.filter((option) => option !== customTargetAudienceOption).join(", "),
    customTargetAudienceSelected ? input.targetAudience.trim() : "",
  ]
    .filter(Boolean)
    .join(". ");
  const objectiveSummary =
    selectedObjectiveOptions.length === 0
      ? "Seleccionar"
      : selectedObjectiveOptions.length === 1
        ? selectedObjectiveOptions[0]
        : `${selectedObjectiveOptions.length} seleccionados`;
  const targetAudienceSummary =
    selectedTargetAudiences.length === 0
      ? "Seleccionar"
      : selectedTargetAudiences.length <= 2
        ? selectedTargetAudiences.join(", ")
        : `${selectedTargetAudiences.slice(0, 2).join(", ")} +${selectedTargetAudiences.length - 2}`;
  const canGenerate = Boolean(
    input.description.trim() && combinedObjective.trim() && combinedTargetAudience.trim()
  );
  const canSave =
    draft?.title.trim() && draft.summary.trim() && draft.content.trim() && draft.slug.trim();
  const busy = generating || saving;
  const inputImageUrl = getPublicImageUrl(input.imageUrl);
  const draftImageUrl = getPublicImageUrl(activeDraft.imageUrl);
  const hasInvalidInputImageUrl = Boolean(input.imageUrl?.trim()) && !inputImageUrl;
  const galleryImageUrl = getGalleryImageUrl(galleryForm.imageUrl);
  const hasInvalidGalleryImageUrl = Boolean(galleryForm.imageUrl?.trim()) && !galleryImageUrl;
  const hasInvalidSavedGalleryImage = galleryImages.some(
    (image) => Boolean(image.imageUrl.trim()) && !getGalleryImageUrl(image.imageUrl)
  );
  const canAddGalleryImage = (Boolean(galleryForm.mediaAssetId) || Boolean(galleryImageUrl)) && !hasInvalidGalleryImageUrl;
  const documentFileUrl = getProjectDocumentUrl(documentForm.fileUrl);
  const hasInvalidDocumentFileUrl = Boolean(documentForm.fileUrl?.trim()) && !documentFileUrl;
  const hasInvalidSavedProjectDocument = projectDocuments.some(
    (doc) => Boolean(doc.fileUrl.trim()) && !getProjectDocumentUrl(doc.fileUrl)
  );
  const canAddProjectDocument =
    Boolean(documentForm.title.trim()) && (Boolean(documentForm.mediaAssetId) || Boolean(documentFileUrl)) && !hasInvalidDocumentFileUrl;
  const canSaveProject = Boolean(canSave) && !hasInvalidSavedGalleryImage && !hasInvalidSavedProjectDocument;

  React.useEffect(() => {
    listAdminProjects()
      .then(setProjects)
      .catch(() => setError("No se pudo cargar la lista de proyectos."))
      .finally(() => setLoadingList(false));
  }, []);

  async function onInputImageFileChange(file?: File) {
    if (!file) return;

    setUploadingMainImage(true);
    setError(null);
    setSuccess(null);

    try {
      const uploaded = await uploadProjectImage(file);
      setInput((current) => ({ ...current, imageUrl: uploaded.url }));
      setInputImageAssetId(uploaded.id);
      if (draft) updateDraft({ imageUrl: uploaded.url });
      setSuccess("Imagen principal subida. Se asociara al guardar el proyecto.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setUploadingMainImage(false);
    }
  }

  function toggleTargetAudience(option: string) {
    setSelectedTargetAudiences((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    );
  }

  function toggleObjectiveOption(option: string) {
    setSelectedObjectiveOptions((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    );
  }

  async function onGalleryImageFileChange(files?: FileList | null) {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) return;

    setUploadingGalleryImage(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadedImages: DraftGalleryImage[] = [];
      for (const file of selectedFiles) {
        const uploaded = await uploadProjectImage(file);
        uploadedImages.push({
          clientId: crypto.randomUUID(),
          imageUrl: uploaded.url,
          mediaAssetId: uploaded.id,
          altText: uploaded.originalFilename.replace(/\.[^.]+$/, ""),
          caption: "",
          sortOrder: 0,
        });
      }

      setGalleryImages((current) =>
        normalizeGalleryDrafts([
          ...current,
          ...uploadedImages.map((image, index) => ({
            ...image,
            sortOrder: current.length + index,
          })),
        ])
      );
      setShowGalleryForm(false);
      setSuccess(`${uploadedImages.length} imagen(es) agregada(s) a la galeria.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setUploadingGalleryImage(false);
    }
  }

  async function onDocumentFileChange(files?: FileList | null) {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) return;

    setUploadingDocument(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadedDocuments: DraftProjectDocument[] = [];
      for (const file of selectedFiles) {
        const uploaded = await uploadProjectDocument(file);
        uploadedDocuments.push({
          clientId: crypto.randomUUID(),
          title: uploaded.originalFilename.replace(/\.[^.]+$/, ""),
          description: "",
          fileUrl: uploaded.url,
          mediaAssetId: uploaded.id,
          fileType: documentTypeFromContentType(uploaded.contentType),
          sortOrder: 0,
        });
      }

      setProjectDocuments((current) => [
        ...current,
        ...uploadedDocuments.map((document, index) => ({
          ...document,
          sortOrder: current.length + index,
        })),
      ]);
      setShowDocumentForm(false);
      setSuccess(`${uploadedDocuments.length} documento(s) agregado(s) al proyecto.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el documento.");
    } finally {
      setUploadingDocument(false);
    }
  }

  function clearInputImage() {
    setInput((current) => ({ ...current, imageUrl: "" }));
    setInputImageAssetId(null);
    if (draft) updateDraft({ imageUrl: "" });
    setSuccess("Imagen principal quitada. El proyecto se guardara sin imagen principal.");
  }

  async function onGenerate() {
    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const generated = await generateProjectDraft({
        ...input,
        objective: combinedObjective,
        targetAudience: combinedTargetAudience,
        imageUrl: inputImageUrl,
      });
      setDraft(generated);
      setSuccess("Borrador generado. Podes revisarlo y editarlo antes de guardar.");
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
      const saved = await createProject({
        ...draft,
        imageUrl: getPublicImageUrl(draft.imageUrl),
        imageAssetId: inputImageAssetId,
        status,
      });

      let failedGalleryCount = 0;
      for (const image of normalizeGalleryDrafts(galleryImages)) {
        try {
          await createProjectImage(saved.id, {
            imageUrl: getGalleryImageUrl(image.imageUrl),
            mediaAssetId: image.mediaAssetId ?? null,
            altText: image.altText?.trim() || null,
            caption: image.caption?.trim() || null,
            sortOrder: normalizeSortOrder(image.sortOrder),
          });
        } catch {
          failedGalleryCount += 1;
        }
      }

      let failedDocumentCount = 0;
      for (const doc of projectDocuments) {
        try {
          await createProjectDocument(saved.id, {
            title: doc.title.trim(),
            description: doc.description?.trim() || null,
            fileUrl: doc.mediaAssetId ? doc.fileUrl.trim() : getProjectDocumentUrl(doc.fileUrl),
            mediaAssetId: doc.mediaAssetId ?? null,
            fileType: doc.fileType?.trim() || null,
            sortOrder: normalizeSortOrder(doc.sortOrder),
          });
        } catch {
          failedDocumentCount += 1;
        }
      }

      setProjects((current) => [saved, ...current]);
      setDraft(null);
      setInput(initialInput);
      setSelectedObjectiveOptions([]);
      setSelectedTargetAudiences([]);
      setInputImageAssetId(null);
      setGalleryImages([]);
      setGalleryForm(emptyGalleryImage);
      setProjectDocuments([]);
      setDocumentForm(emptyProjectDocument);
      setStatus("PUBLISHED");
      const failureParts = [];
      if (failedGalleryCount > 0) failureParts.push(`${failedGalleryCount} imagen(es) de galeria`);
      if (failedDocumentCount > 0) failureParts.push(`${failedDocumentCount} documento(s)`);
      if (failureParts.length > 0) {
        setError(
          `Proyecto guardado, pero no se pudieron asociar ${failureParts.join(" y ")}. Podes completarlo desde la edicion del proyecto.`
        );
      } else {
        setSuccess("Proyecto guardado correctamente.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function onCancelDraft() {
    setDraft(null);
    setStatus("PUBLISHED");
    setError(null);
    setSuccess("Borrador descartado. Podes ajustar el brief y generar uno nuevo.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function updateDraft(next: Partial<GeneratedProjectDraft>) {
    setDraft((current) => ({ ...(current ?? emptyDraft), ...next }));
  }

  function addGalleryImage() {
    if (!canAddGalleryImage) return;

    setGalleryImages((current) =>
      normalizeGalleryDrafts([
        ...current,
        {
          clientId: crypto.randomUUID(),
          imageUrl: galleryImageUrl,
          mediaAssetId: galleryForm.mediaAssetId ?? null,
          altText: galleryForm.altText?.trim() || "",
          caption: galleryForm.caption?.trim() || "",
          sortOrder: current.length,
        },
      ])
    );
    setGalleryForm({ ...emptyGalleryImage, sortOrder: galleryImages.length + 1 });
    setShowGalleryForm(false);
  }
  function updateGalleryImage(clientId: string, next: Partial<ProjectImageInput>) {
    setGalleryImages((current) =>
      current.map((image) => (image.clientId === clientId ? { ...image, ...next } : image))
    );
  }

  function removeGalleryImage(clientId: string) {
    setGalleryImages((current) => normalizeGalleryDrafts(current.filter((image) => image.clientId !== clientId)));
  }

  function moveGalleryImage(clientId: string, direction: -1 | 1) {
    setGalleryImages((current) => {
      const normalized = normalizeGalleryDrafts(current);
      const index = normalized.findIndex((image) => image.clientId === clientId);
      const swapWith = index + direction;
      if (index < 0 || swapWith < 0 || swapWith >= normalized.length) return normalized;

      const next = [...normalized];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next.map((image, itemIndex) => ({ ...image, sortOrder: itemIndex }));
    });
  }
  function addProjectDocument() {
    if (!canAddProjectDocument) return;

    setProjectDocuments((current) => [
      ...current,
      {
        clientId: crypto.randomUUID(),
        title: documentForm.title.trim(),
        description: documentForm.description?.trim() || "",
        fileUrl: documentForm.mediaAssetId ? documentForm.fileUrl.trim() : documentFileUrl,
        mediaAssetId: documentForm.mediaAssetId ?? null,
        fileType: documentForm.fileType?.trim() || "",
        sortOrder: normalizeSortOrder(documentForm.sortOrder ?? current.length),
      },
    ]);
    setDocumentForm({ ...emptyProjectDocument, sortOrder: projectDocuments.length + 1 });
    setShowDocumentForm(false);
  }

  function updateProjectDocumentDraft(clientId: string, next: Partial<ProjectDocumentInput>) {
    setProjectDocuments((current) =>
      current.map((doc) => (doc.clientId === clientId ? { ...doc, ...next } : doc))
    );
  }

  function removeProjectDocument(clientId: string) {
    setProjectDocuments((current) => current.filter((doc) => doc.clientId !== clientId));
  }

  function moveProjectDocument(clientId: string, direction: -1 | 1) {
    setProjectDocuments((current) => {
      const index = current.findIndex((doc) => doc.clientId === clientId);
      const swapWith = index + direction;
      if (index < 0 || swapWith < 0 || swapWith >= current.length) return current;

      const next = [...current];
      const currentOrder = next[index].sortOrder;
      next[index] = { ...next[index], sortOrder: next[swapWith].sortOrder };
      next[swapWith] = { ...next[swapWith], sortOrder: currentOrder };
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  }
  return (
    <div className="space-y-5">
      {(error || success) && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            error
              ? "border-red-800 bg-red-950/40 text-red-200"
              : "border-green-800 bg-green-950/40 text-green-200"
          }`}
        >
          {!error && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
          <p>{error || success}</p>
        </div>
      )}

      <section className="rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="border-b border-neutral-800 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
            Paso 1
          </p>
          <h2 className="text-base font-semibold text-neutral-100">Brief del proyecto</h2>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Material fuente / resumen tecnico
              </span>
              <textarea
                className={`${inputClass} min-h-32 resize-y leading-relaxed`}
                disabled={busy}
                value={input.description}
                placeholder="Pega aca resumenes tecnicos, notas o fragmentos relevantes del proyecto."
                onChange={(event) =>
                  setInput({ ...input, description: event.target.value })
                }
              />
              <p className="text-xs leading-5 text-neutral-500">
                Pega aca el resumen tecnico del proyecto, notas, fragmentos relevantes o una sintesis generada a partir de documentos tecnicos. Este texto no tiene que estar redactado para publicacion; sirve como base para que la IA comprenda el proyecto.
              </p>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Aspectos a destacar
              </span>
              <textarea
                className={`${inputClass} min-h-24 resize-y leading-relaxed`}
                disabled={busy}
                value={input.highlights ?? ""}
                placeholder="Ej: problema principal, importancia, resultados esperados e idea central para recordar."
                onChange={(event) =>
                  setInput({ ...input, highlights: event.target.value })
                }
              />
              <p className="text-xs leading-5 text-neutral-500">
                Pega aqui una sintesis elaborada a partir de las respuestas del formulario de los investigadores. Este texto ayudara a la IA a identificar que aspectos son mas importantes desde el punto de vista cientifico y comunicacional.
              </p>
            </label>

            <details className="group rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-neutral-200">
                <span>Objetivo de comunicacion</span>
                <span className="inline-flex max-w-[65%] items-center gap-2 rounded-full border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-400">
                  <span className="truncate">{objectiveSummary}</span>
                  <span aria-hidden="true" className="transition group-open:rotate-180">v</span>
                </span>
              </summary>
              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Selecciona que buscas lograr con la publicacion. Podes elegir mas de una opcion.
              </p>

              <div className="mt-3 grid gap-2">
                {communicationObjectiveOptions.map((option) => {
                  const selected = selectedObjectiveOptions.includes(option);

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={busy}
                      onClick={() => toggleObjectiveOption(option)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-xs font-semibold leading-5 transition disabled:opacity-60 ${
                        selected
                          ? "border-primary bg-primary/15 text-primary-light"
                          : "border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-neutral-500"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {customObjectiveSelected && (
                <label className="mt-3 block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Objetivo personalizado
                  </span>
                  <textarea
                    className={`${inputClass} min-h-20 resize-y leading-relaxed`}
                    disabled={busy}
                    value={input.objective}
                    placeholder="Ej: Presentar el proyecto a potenciales aliados tecnicos y educativos."
                    onChange={(event) =>
                      setInput({ ...input, objective: event.target.value })
                    }
                  />
                </label>
              )}

              {combinedObjective && (
                <p className="mt-3 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs leading-5 text-neutral-400">
                  Se enviara a la IA: {combinedObjective}
                </p>
              )}
            </details>

            <details className="group rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-neutral-200">
                <span>Publico objetivo</span>
                <span className="inline-flex max-w-[65%] items-center gap-2 rounded-full border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-400">
                  <span className="truncate">{targetAudienceSummary}</span>
                  <span aria-hidden="true" className="transition group-open:rotate-180">v</span>
                </span>
              </summary>
              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Elegi una o varias opciones. Si necesitas agregar un publico propio, selecciona la opcion personalizada.
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {targetAudienceSelectOptions.map((option) => {
                  const selected = selectedTargetAudiences.includes(option);

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={busy}
                      onClick={() => toggleTargetAudience(option)}
                      className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition disabled:opacity-60 ${
                        selected
                          ? "border-primary bg-primary/15 text-primary-light"
                          : "border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-neutral-500"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {customTargetAudienceSelected && (
                <label className="mt-3 block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Publico objetivo personalizado
                  </span>
                  <textarea
                    className={`${inputClass} min-h-20 resize-y leading-relaxed`}
                    disabled={busy}
                    value={input.targetAudience}
                    placeholder="Ej.: Personas interesadas en la conservacion de bosques nativos."
                    onChange={(event) =>
                      setInput({ ...input, targetAudience: event.target.value })
                    }
                  />
                </label>
              )}

              {combinedTargetAudience && (
                <p className="mt-3 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs leading-5 text-neutral-400">
                  Se enviara a la IA: {combinedTargetAudience}
                </p>
              )}
            </details>


            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                {inputImageUrl ? "Cambiar imagen principal" : "Seleccionar imagen principal"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy || uploadingMainImage}
                className="block w-full text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-100 hover:file:bg-neutral-700 disabled:opacity-60"
                onChange={(event) => onInputImageFileChange(event.target.files?.[0])}
              />
              {uploadingMainImage && <p className="text-xs text-neutral-400">Subiendo imagen...</p>}
              {inputImageUrl && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                  <span>Imagen actual: se reemplazara si elegis otro archivo.</span>
                  <button type="button" disabled={busy || uploadingMainImage} onClick={clearInputImage} className="font-semibold text-red-300 hover:text-red-200 disabled:opacity-50">Quitar imagen</button>
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
                  disabled={busy}
                  value={input.imageUrl ?? ""}
                  placeholder="/img/alerces.jpg"
                  onChange={(event) => {
                    setInput({ ...input, imageUrl: event.target.value });
                    setInputImageAssetId(null);
                  }}
                />
                {hasInvalidInputImageUrl && (
                  <p className="text-xs leading-5 text-yellow">
                    Usa una ruta publica como /img/alerces.jpg, /api/media/... o una URL https://. Las rutas C:\ no se pueden cargar desde el navegador.
                  </p>
                )}
              </label>
            </details>

          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-100">Flujo</p>
              <ol className="space-y-2 text-sm text-neutral-400">
                <li>1. Brief</li>
                <li>2. Borrador IA</li>
                <li>3. Edicion manual</li>
                <li>4. Guardado</li>
              </ol>
            </div>

          </div>
        </div>

        <div className="border-t border-neutral-800 p-4">
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
              Galeria del proyecto
            </p>
            <h3 className="mt-1 text-base font-semibold text-neutral-100">
              Imagenes asociadas
            </h3>
            <p className="mt-1 text-sm text-neutral-400">
              La imagen principal se mantiene separada. Agrega aca imagenes adicionales para la galeria publica.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {galleryImages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 p-5 text-sm text-neutral-400 sm:col-span-2 lg:col-span-3 2xl:col-span-4">
                  Todavia no agregaste imagenes de galeria para este proyecto.
                </div>
              ) : (
                galleryImages
                  .slice()
                  .sort((a, b) => normalizeSortOrder(a.sortOrder) - normalizeSortOrder(b.sortOrder))
                  .map((image, index) => {
                    const invalidSavedUrl = Boolean(image.imageUrl.trim()) && !getGalleryImageUrl(image.imageUrl);
                    return (
                      <article
                        key={image.clientId}
                        className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60"
                      >
                        {getGalleryImageUrl(image.imageUrl) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getGalleryImageUrl(image.imageUrl)}
                            alt={image.altText || image.caption || "Imagen de galeria"}
                            className="aspect-video w-full object-cover"
                          />
                        )}
                        <div className="space-y-2.5 p-2.5">
                          <label className="block space-y-1">
                            <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                              URL de imagen
                            </span>
                            <input
                              className={inputClass}
                              disabled={busy}
                              value={image.imageUrl}
                              onChange={(event) =>
                                updateGalleryImage(image.clientId, { imageUrl: event.target.value, mediaAssetId: null })
                              }
                            />
                            {invalidSavedUrl && (
                              <p className="text-xs leading-5 text-yellow">
                                Usa /img/... o una URL http(s). No se permiten rutas locales.
                              </p>
                            )}
                          </label>

                          <label className="block space-y-1">
                            <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                              Texto alternativo
                            </span>
                            <input
                              className={inputClass}
                              disabled={busy}
                              value={image.altText ?? ""}
                              onChange={(event) =>
                                updateGalleryImage(image.clientId, { altText: event.target.value })
                              }
                            />
                          </label>

                          <label className="block space-y-1">
                            <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                              Epigrafe
                            </span>
                            <textarea
                              className={`${inputClass} min-h-16 resize-y leading-relaxed`}
                              disabled={busy}
                              value={image.caption ?? ""}
                              onChange={(event) =>
                                updateGalleryImage(image.clientId, { caption: event.target.value })
                              }
                            />
                          </label>

                          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">

                            <div className="flex items-end gap-2">
                              <button
                                type="button"
                                disabled={busy || index === 0}
                                onClick={() => moveGalleryImage(image.clientId, -1)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
                                aria-label="Subir imagen"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                disabled={busy || index === galleryImages.length - 1}
                                onClick={() => moveGalleryImage(image.clientId, 1)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
                                aria-label="Bajar imagen"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => removeGalleryImage(image.clientId)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/70 text-red-200 hover:bg-red-950/50 disabled:opacity-40"
                                aria-label="Eliminar imagen"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })
              )}
              <button
                type="button"
                onClick={() => setShowGalleryForm((current) => !current)}
                className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-700 bg-neutral-900/30 p-4 text-center text-neutral-400 transition hover:border-primary/70 hover:bg-neutral-900/60 hover:text-primary-light"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-100">
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold">Agregar imagen</span>
              </button>
            </div>

            {showGalleryForm && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-primary-light">
                Agregar imagen
              </h4>
              <div className="mt-3 space-y-3">
                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    URL de imagen
                  </span>
                  <input
                    className={inputClass}
                    disabled={busy}
                    value={galleryForm.imageUrl}
                    placeholder="/img/proyectos/galeria-1.jpg"
                    onChange={(event) =>
                      setGalleryForm((current) => ({ ...current, imageUrl: event.target.value, mediaAssetId: null }))
                    }
                  />
                  {hasInvalidGalleryImageUrl && (
                    <p className="text-xs leading-5 text-yellow">
                      Usa /img/..., /api/media/... o una URL http(s). No se permiten rutas C:\.
                    </p>
                  )}
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Seleccionar imagen de galeria
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    disabled={busy || uploadingGalleryImage}
                    className="block w-full text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-100 hover:file:bg-neutral-700 disabled:opacity-60"
                    onChange={(event) => onGalleryImageFileChange(event.target.files)}
                  />
                  {uploadingGalleryImage && <p className="text-xs text-neutral-400">Subiendo imagenes...</p>}
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Texto alternativo
                  </span>
                  <input
                    className={inputClass}
                    disabled={busy}
                    value={galleryForm.altText ?? ""}
                    onChange={(event) =>
                      setGalleryForm((current) => ({ ...current, altText: event.target.value }))
                    }
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Epigrafe
                  </span>
                  <textarea
                    className={`${inputClass} min-h-24 resize-y leading-relaxed`}
                    disabled={busy}
                    value={galleryForm.caption ?? ""}
                    onChange={(event) =>
                      setGalleryForm((current) => ({ ...current, caption: event.target.value }))
                    }
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Orden
                  </span>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    disabled={busy}
                    value={galleryForm.sortOrder ?? 0}
                    onChange={(event) =>
                      setGalleryForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))
                    }
                  />
                </label>

                <button
                  type="button"
                  disabled={!canAddGalleryImage || busy}
                  onClick={addGalleryImage}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-100 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Agregar a galeria
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
        <div className="border-t border-neutral-800 p-4">
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
              Documentos del proyecto
            </p>
            <h3 className="mt-1 text-base font-semibold text-neutral-100">
              Archivos asociados
            </h3>
            <p className="mt-1 text-sm text-neutral-400">
              Agrega informes, fichas o materiales por archivo, URL publica o asset interno.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              {projectDocuments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 p-5 text-sm text-neutral-400">
                  Todavia no agregaste documentos para este proyecto.
                </div>
              ) : (
                projectDocuments
                  .slice()
                  .sort((a, b) => normalizeSortOrder(a.sortOrder) - normalizeSortOrder(b.sortOrder))
                  .map((doc, index) => {
                    const invalidSavedUrl = Boolean(doc.fileUrl.trim()) && !getProjectDocumentUrl(doc.fileUrl);
                    return (
                      <article
                        key={doc.clientId}
                        className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"
                      >
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="block space-y-1">
                            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                              Titulo
                            </span>
                            <input
                              className={inputClass}
                              disabled={busy}
                              value={doc.title}
                              onChange={(event) =>
                                updateProjectDocumentDraft(doc.clientId, { title: event.target.value })
                              }
                            />
                          </label>

                          <label className="block space-y-1">
                            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                              Tipo
                            </span>
                            <input
                              className={inputClass}
                              disabled={busy}
                              value={doc.fileType ?? ""}
                              placeholder="PDF"
                              onChange={(event) =>
                                updateProjectDocumentDraft(doc.clientId, { fileType: event.target.value })
                              }
                            />
                          </label>
                        </div>

                        <label className="mt-3 block space-y-1">
                          <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                            URL del archivo
                          </span>
                          <input
                            className={inputClass}
                            disabled={busy}
                            value={doc.fileUrl}
                            onChange={(event) =>
                              updateProjectDocumentDraft(doc.clientId, { fileUrl: event.target.value, mediaAssetId: null })
                            }
                          />
                          {invalidSavedUrl && (
                            <p className="text-xs leading-5 text-yellow">
                              Usa /docs/..., /files/... o una URL http(s). No se permiten rutas locales.
                            </p>
                          )}
                        </label>

                        <label className="mt-3 block space-y-1">
                          <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                            Descripcion
                          </span>
                          <textarea
                            className={`${inputClass} min-h-20 resize-y leading-relaxed`}
                            disabled={busy}
                            value={doc.description ?? ""}
                            onChange={(event) =>
                              updateProjectDocumentDraft(doc.clientId, { description: event.target.value })
                            }
                          />
                        </label>

                        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                          <label className="block space-y-1">
                            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                              Orden
                            </span>
                            <input
                              type="number"
                              min={0}
                              className={inputClass}
                              disabled={busy}
                              value={doc.sortOrder ?? 0}
                              onChange={(event) =>
                                updateProjectDocumentDraft(doc.clientId, { sortOrder: Number(event.target.value) })
                              }
                            />
                          </label>

                          <div className="flex items-end gap-2">
                            <button
                              type="button"
                              disabled={busy || index === 0}
                              onClick={() => moveProjectDocument(doc.clientId, -1)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
                              aria-label="Subir documento"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={busy || index === projectDocuments.length - 1}
                              onClick={() => moveProjectDocument(doc.clientId, 1)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
                              aria-label="Bajar documento"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => removeProjectDocument(doc.clientId)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-900/70 text-red-200 hover:bg-red-950/50 disabled:opacity-40"
                              aria-label="Eliminar documento"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })
              )}
              <button
                type="button"
                onClick={() => setShowDocumentForm((current) => !current)}
                className="flex min-h-28 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/30 p-4 text-center text-neutral-400 transition hover:border-primary/70 hover:bg-neutral-900/60 hover:text-primary-light"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-100">
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold">Agregar documento</span>
              </button>
            </div>

            {showDocumentForm && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-primary-light">
                Agregar documento
              </h4>
              <div className="mt-4 space-y-4">
                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Titulo
                  </span>
                  <input
                    className={inputClass}
                    disabled={busy}
                    value={documentForm.title}
                    onChange={(event) =>
                      setDocumentForm((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    URL del archivo
                  </span>
                  <input
                    className={inputClass}
                    disabled={busy}
                    value={documentForm.fileUrl}
                    placeholder="/docs/proyecto/informe.pdf"
                    onChange={(event) =>
                      setDocumentForm((current) => ({ ...current, fileUrl: event.target.value, mediaAssetId: null }))
                    }
                  />
                  {hasInvalidDocumentFileUrl && (
                    <p className="text-xs leading-5 text-yellow">
                      Usa /docs/..., /files/... o una URL http(s). No se permiten rutas C:\.
                    </p>
                  )}
                </label>

                <label className="block space-y-2 rounded-lg border border-dashed border-neutral-700 p-3 text-sm text-neutral-300">
                  <span className="inline-flex items-center gap-2 font-semibold text-neutral-100">
                    <Upload className="h-4 w-4" />
                    Seleccionar archivo
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={busy || uploadingDocument}
                    onChange={(event) => onDocumentFileChange(event.target.files)}
                    className="block w-full text-xs text-neutral-400 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark"
                  />
                  {uploadingDocument && <span className="text-xs text-primary-light">Subiendo documentos...</span>}
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Descripcion
                  </span>
                  <textarea
                    className={`${inputClass} min-h-24 resize-y leading-relaxed`}
                    disabled={busy}
                    value={documentForm.description ?? ""}
                    onChange={(event) =>
                      setDocumentForm((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Tipo
                    </span>
                    <input
                      className={inputClass}
                      disabled={busy}
                      value={documentForm.fileType ?? ""}
                      placeholder="PDF"
                      onChange={(event) =>
                        setDocumentForm((current) => ({ ...current, fileType: event.target.value }))
                      }
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Orden
                    </span>
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      disabled={busy}
                      value={documentForm.sortOrder ?? 0}
                      onChange={(event) =>
                        setDocumentForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))
                      }
                    />
                  </label>
                </div>

                <button
                  type="button"
                  disabled={!canAddProjectDocument || busy || uploadingDocument}
                  onClick={addProjectDocument}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-100 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Agregar documento
                </button>
              </div>
            </div>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-neutral-800 p-4">
          <button
            type="button"
            disabled={!canGenerate || busy}
            onClick={onGenerate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 sm:w-auto"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            Generar borrador
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="border-b border-neutral-800 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
            Paso 2
          </p>
          <h2 className="text-base font-semibold text-neutral-100">Proyecto generado</h2>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]">
          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Titulo
              </span>
              <input
                className={inputClass}
                disabled={!draft || busy}
                value={activeDraft.title}
                onChange={(event) => updateDraft({ title: event.target.value })}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Resumen
              </span>
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                disabled={!draft || busy}
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
                disabled={!draft || busy}
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
                  disabled={!draft || busy}
                  value={activeDraft.slug}
                  onChange={(event) => updateDraft({ slug: event.target.value })}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Estado
                </span>
                <select
                  className={inputClass}
                  disabled={!draft || busy}
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ProjectStatus)}
                >
                  <option value="PUBLISHED">Publicado</option>
                  <option value="DRAFT">Borrador</option>
                </select>
              </label>
            </div>
          </div>

          <article className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-primary-light">
              Preview sitio web
            </p>
            {draftImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draftImageUrl}
                alt={activeDraft.title || "Imagen del proyecto"}
                className="mb-5 aspect-video w-full rounded-lg border border-neutral-800 object-cover"
              />
            )}
            <h3 className="text-xl font-semibold leading-tight text-white">
              {activeDraft.title || "Titulo del proyecto"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-neutral-300">
              {activeDraft.summary || "Resumen del proyecto generado con IA."}
            </p>
            <div className="mt-5 whitespace-pre-wrap border-t border-neutral-800 pt-5 text-sm leading-7 text-neutral-200">
              {activeDraft.content || "El contenido editable aparecera aca."}
            </div>
            <p className="mt-5 rounded-lg bg-black/30 px-3 py-2 text-xs text-neutral-400">
              /proyectos/{activeDraft.slug || "slug-del-proyecto"}
            </p>
          </article>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-neutral-800 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={onCancelDraft}
            className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Volver
          </button>
          <button
            type="button"
            disabled={!canSaveProject || busy}
            onClick={onSave}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 sm:w-auto"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            Guardar proyecto
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="border-b border-neutral-800 px-4 py-4">
          <h2 className="text-base font-semibold text-neutral-100">Proyectos existentes</h2>
        </div>
        <div className="p-4">
          {loadingList ? (
            <p className="text-sm text-neutral-400">Cargando proyectos...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-neutral-400">Todavia no hay proyectos cargados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-neutral-400">
                  <tr>
                    <th className="px-3 py-2">Titulo</th>
                    <th className="px-3 py-2">Slug</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Imagen</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-t border-neutral-800">
                      <td className="px-3 py-2 text-neutral-100">{project.title}</td>
                      <td className="px-3 py-2 text-neutral-300">{project.slug}</td>
                      <td className="px-3 py-2 text-neutral-300">{project.status}</td>
                      <td className="px-3 py-2 text-neutral-400">
                        {project.imageUrl || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
