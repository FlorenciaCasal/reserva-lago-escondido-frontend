"use client";

import React from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Loader2, Plus, Save, Sparkles, Trash2, Upload } from "lucide-react";
import ProjectGalleryManager from "@/components/admin/projects/ProjectGalleryManager";
import { getYouTubeThumbnailUrl, parseYouTubeVideoId } from "@/lib/youtube";
import {
  createProject,
  createProjectDocument,
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
  "Público general",
  "Instituciones educativas",
  "Comunidad científica",
  "Organismos públicos",
  "Visitantes de la reserva",
  "Comunidad local",
  "Medios de comunicación",
  "Organizaciones ambientales",
];

const customTargetAudienceOption = "Otro / público objetivo personalizado";

const customObjectiveOption = "Otro / objetivo personalizado";

const communicationObjectiveOptions = [
  "Informar",
  "Educar",
  "Concientizar",
  "Difundir",
  "Convocar",
  "Visibilizar",
  "Actualizar",
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

type DraftProjectDocument = ProjectDocumentInput & {
  clientId: string;
};

type MainMediaType = "IMAGE" | "YOUTUBE";

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
  const [mainMediaType, setMainMediaType] = React.useState<MainMediaType>("IMAGE");
  const [mainYoutubeUrl, setMainYoutubeUrl] = React.useState("");
  const [createdProject, setCreatedProject] = React.useState<Project | null>(null);
  const [projectDocuments, setProjectDocuments] = React.useState<DraftProjectDocument[]>([]);
  const [documentForm, setDocumentForm] = React.useState<ProjectDocumentInput>(emptyProjectDocument);
  const [showDocumentForm, setShowDocumentForm] = React.useState(false);
  const [status, setStatus] = React.useState<ProjectStatus>("PUBLISHED");
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loadingList, setLoadingList] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploadingMainImage, setUploadingMainImage] = React.useState(false);
  const [uploadingDocument, setUploadingDocument] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!success) return;

    const timeout = window.setTimeout(() => setSuccess(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [success]);

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
  const uploadingFiles = uploadingMainImage || uploadingDocument;
  const busy = generating || saving || uploadingFiles;
  const inputImageUrl = getPublicImageUrl(input.imageUrl);
  const draftImageUrl = getPublicImageUrl(activeDraft.imageUrl);
  const mainYoutubeVideoId = parseYouTubeVideoId(mainYoutubeUrl);
  const hasInvalidMainYoutubeUrl =
    mainMediaType === "YOUTUBE" && Boolean(mainYoutubeUrl.trim()) && !mainYoutubeVideoId;
  const documentFileUrl = getProjectDocumentUrl(documentForm.fileUrl);
  const hasInvalidDocumentFileUrl = Boolean(documentForm.fileUrl?.trim()) && !documentFileUrl;
  const hasInvalidSavedProjectDocument = projectDocuments.some(
    (doc) => Boolean(doc.fileUrl.trim()) && !getProjectDocumentUrl(doc.fileUrl)
  );
  const canAddProjectDocument =
    Boolean(documentForm.title.trim()) && (Boolean(documentForm.mediaAssetId) || Boolean(documentFileUrl)) && !hasInvalidDocumentFileUrl;
  const canSaveProject = Boolean(canSave) && !hasInvalidMainYoutubeUrl && !hasInvalidSavedProjectDocument;

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
      setMainMediaType("IMAGE");
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
    if (uploadingFiles) {
      setError("Esperá a que terminen las subidas antes de generar el borrador.");
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);
    setCreatedProject(null);

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
    if (uploadingFiles) {
      setError("Esperá a que terminen las subidas antes de guardar el proyecto.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const saved = await createProject({
        ...draft,
        imageUrl: mainMediaType === "IMAGE" ? getPublicImageUrl(draft.imageUrl) : null,
        imageAssetId: mainMediaType === "IMAGE" ? inputImageAssetId : null,
        videoUrl: mainMediaType === "YOUTUBE" ? mainYoutubeUrl.trim() || null : null,
        videoAssetId: null,
        status,
      });

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
      setCreatedProject(saved);
      setDraft(null);
      setInput(initialInput);
      setSelectedObjectiveOptions([]);
      setSelectedTargetAudiences([]);
      setInputImageAssetId(null);
      setMainMediaType("IMAGE");
      setMainYoutubeUrl("");
      setProjectDocuments([]);
      setDocumentForm(emptyProjectDocument);
      setStatus("PUBLISHED");
      const failureParts = [];
      if (failedDocumentCount > 0) failureParts.push(`${failedDocumentCount} documento(s)`);
      if (failureParts.length > 0) {
        setError(
          `Proyecto guardado, pero no se pudieron asociar ${failureParts.join(" y ")}. Podes completarlo desde la edición del proyecto.`
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
          className={`fixed left-1/2 top-16 z-50 flex w-fit max-w-[calc(100%-2rem)] -translate-x-1/2 items-start gap-3 rounded-xl border p-4 text-sm shadow-2xl shadow-black/40 backdrop-blur-md sm:top-4 sm:max-w-3xl ${
            error
              ? "border-red-800 bg-red-950/95 text-red-200"
              : "border-green-800 bg-green-950/95 text-green-200"
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
                Material fuente / resumen técnico
              </span>
              <textarea
                className={`${inputClass} min-h-32 resize-y leading-relaxed`}
                disabled={busy}
                value={input.description}
                placeholder="Pega aca resumenes técnicos, notas o fragmentos relevantes del proyecto."
                onChange={(event) =>
                  setInput({ ...input, description: event.target.value })
                }
              />
              <p className="text-xs leading-5 text-neutral-500">
                Pega aca el resumen técnico del proyecto, notas, fragmentos relevantes o una síntesis generada a partir de documentos técnicos. Este texto no tiene que estar redactado para publicación; sirve como base para que la IA comprenda el proyecto.
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
                Pega aqui una sintesis elaborada a partir de las respuestas del formulario de los investigadores. Este texto ayudara a la IA a identificar que aspectos son mas importantes desde el punto de vista científico y comunicacional.
              </p>
            </label>

            <details className="group rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-neutral-200">
                <span>Objetivo de comunicación</span>
                <span className="inline-flex max-w-[65%] items-center gap-2 rounded-full border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-400">
                  <span className="truncate">{objectiveSummary}</span>
                  <span aria-hidden="true" className="transition group-open:rotate-180">v</span>
                </span>
              </summary>
              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Selecciona que buscas lograr con la publicación. Podes elegir mas de una opción.
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
                    placeholder="Ej: Presentar el proyecto a potenciales aliados técnicos y educativos."
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
                <span>Público objetivo</span>
                <span className="inline-flex max-w-[65%] items-center gap-2 rounded-full border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-400">
                  <span className="truncate">{targetAudienceSummary}</span>
                  <span aria-hidden="true" className="transition group-open:rotate-180">v</span>
                </span>
              </summary>
              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Elegi una o varias opciones. Si necesitas agregar un público propio, selecciona la opción personalizada.
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
                    Público objetivo personalizado
                  </span>
                  <textarea
                    className={`${inputClass} min-h-20 resize-y leading-relaxed`}
                    disabled={busy}
                    value={input.targetAudience}
                    placeholder="Ej.: Personas interesadas en la conservación de bosques nativos."
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


            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Medio principal
              </span>
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-950 p-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setMainMediaType("IMAGE")}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                    mainMediaType === "IMAGE"
                      ? "bg-primary text-white"
                      : "text-neutral-300 hover:bg-neutral-900"
                  }`}
                >
                  Imagen
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setMainMediaType("YOUTUBE")}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                    mainMediaType === "YOUTUBE"
                      ? "bg-primary text-white"
                      : "text-neutral-300 hover:bg-neutral-900"
                  }`}
                >
                  Video de YouTube
                </button>
              </div>
            </label>

            {mainMediaType === "IMAGE" && (
              <>
                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Imagen principal
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                    disabled={busy || uploadingMainImage}
                    className="sr-only"
                    onChange={(event) => onInputImageFileChange(event.target.files?.[0])}
                  />
                  <span className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition hover:bg-neutral-800 aria-disabled:pointer-events-none aria-disabled:opacity-60" aria-disabled={busy || uploadingMainImage}>
                    {inputImageUrl ? "Cambiar imagen" : "Seleccionar imagen"}
                  </span>
                  {uploadingMainImage && <p className="text-xs text-neutral-400">Subiendo imagen...</p>}
                  {inputImageUrl && (
                    <button type="button" disabled={busy || uploadingMainImage} onClick={clearInputImage} className="text-left text-xs font-semibold text-neutral-500 hover:text-red-200 disabled:opacity-50">Quitar imagen</button>
                  )}
                </label>
                {inputImageUrl && (
                  <figure className="w-40 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/70 sm:w-44">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={inputImageUrl}
                      alt="Imagen principal del proyecto"
                      className="aspect-video w-full object-cover"
                    />
                  </figure>
                )}
              </>
            )}

            {mainMediaType === "YOUTUBE" && (
              <>
                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Video principal de YouTube
                  </span>
                  <input
                    className={inputClass}
                    disabled={busy}
                    value={mainYoutubeUrl}
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={(event) => setMainYoutubeUrl(event.target.value)}
                  />
                  <p className="text-xs leading-5 text-neutral-500">
                    Al guardar, este video quedara como medio principal y la imagen principal anterior dejara de estar activa.
                  </p>
                  {hasInvalidMainYoutubeUrl && (
                    <p className="text-xs leading-5 text-yellow">
                      Pega un enlace valido de YouTube, no HTML ni iframe.
                    </p>
                  )}
                </label>

                {mainYoutubeVideoId && (
                  <figure className="w-40 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/70 sm:w-44">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getYouTubeThumbnailUrl(mainYoutubeVideoId)}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                  </figure>
                )}
              </>
            )}
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-100">Flujo</p>
              <ol className="space-y-2 text-sm text-neutral-400">
                <li>1. Brief</li>
                <li>2. Borrador IA</li>
                <li>3. Edición manual</li>
                <li>4. Guardado</li>
              </ol>
            </div>

          </div>
        </div>

        <div className="border-t border-neutral-800 p-4">
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
              Galeria multimedia del proyecto
            </p>
            <h3 className="mt-1 text-base font-semibold text-neutral-100">
              Imagenes y videos de YouTube
            </h3>
            <p className="mt-1 text-sm text-neutral-400">
              La imagen y el video principal se mantienen separados. Guarda el proyecto para habilitar la gestion multimedia compartida.
            </p>
          </div>

          {createdProject ? (
            <ProjectGalleryManager projectId={createdProject.id} />
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 p-5 text-sm text-neutral-400">
              Guarda el proyecto generado para agregar multiples imagenes y videos de YouTube con el gestor multimedia.
            </div>
          )}
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
                            Descripción
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
                    Descripción
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
          {uploadingFiles && (
            <p className="mr-4 self-center text-xs text-primary-light">
              Esperá a que terminen las subidas para continuar.
            </p>
          )}
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
