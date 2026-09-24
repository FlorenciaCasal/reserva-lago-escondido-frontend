import Link from "next/link";
import type React from "react";
import PublicMediaCarousel from "@/components/media/PublicMediaCarousel";
import ProjectDetailTabs from "@/components/projects/ProjectDetailTabs";
import RevealOnView from "@/components/ui/RevealOnView";
import type { MediaGalleryItem, Project, ProjectAdvance } from "@/types/project";
function isUploadedVideo(videoUrl?: string | null, videoAssetId?: string | null) {
  const url = videoUrl?.trim();
  return Boolean(videoAssetId) || Boolean(url?.startsWith("/api/media/"));
}

function renderLinkedText(value?: string | null) {
  const text = value ?? "";
  const urlPattern = /(https?:\/\/[^\s<>"']+)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = urlPattern.exec(text)) !== null) {
    const rawUrl = match[0];
    const trailing = rawUrl.match(/[.,;:!?)]$/)?.[0] ?? "";
    const href = trailing ? rawUrl.slice(0, -trailing.length) : rawUrl;

    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    nodes.push(
      <a
        key={`${href}-${match.index}`}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-[#247E79] underline decoration-[#49A9A2]/70 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-950"
      >
        {href}
      </a>
    );
    if (trailing) nodes.push(trailing);
    lastIndex = match.index + rawUrl.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes.length > 0 ? nodes : text;
}

function formatTimelineDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return {
    day: date.toLocaleDateString("es-AR", { day: "2-digit" }),
    month: date.toLocaleDateString("es-AR", { month: "short" }).toUpperCase(),
    year: date.toLocaleDateString("es-AR", { year: "numeric" }),
  };
}

function advanceMediaItems(advance: ProjectAdvance): MediaGalleryItem[] {
  if (advance.gallery && advance.gallery.length > 0) return advance.gallery;

  const legacy: MediaGalleryItem[] = [];
  if (advance.imageUrl) {
    legacy.push({
      id: `${advance.id}-legacy-image`,
      ownerId: advance.id,
      kind: "IMAGE",
      sourceType: "MEDIA_ASSET",
      mediaAssetId: advance.imageAssetId ?? null,
      url: advance.imageUrl,
      caption: null,
      altText: advance.title,
      sortOrder: 0,
    });
  }
  if (advance.videoUrl) {
    legacy.push({
      id: `${advance.id}-legacy-video`,
      ownerId: advance.id,
      kind: "VIDEO",
      sourceType: "MEDIA_ASSET",
      mediaAssetId: advance.videoAssetId ?? null,
      url: advance.videoUrl,
      caption: null,
      altText: null,
      sortOrder: 1,
    });
  }
  return legacy;
}

export default function PublicProjectDetail({
  project,
  advances,
}: {
  project: Project;
  advances: ProjectAdvance[];
}) {
  const gallery = project.gallery ?? [];
  const documents = project.documents ?? [];
  const projectTitle = project.title;
  const projectSummary = project.summary;
  const hasProjectVideo = Boolean(project.videoUrl?.trim());
  const hasGallery = gallery.length > 0;
  const hasAdvances = advances.length > 0;
  const hasDocuments = documents.length > 0;

  return (
    <main className="bg-[#FAFAF9] text-neutral-900">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
        <nav className="text-sm font-semibold text-neutral-600">
          <Link href="/proyectos" className="hover:text-neutral-900">
            Proyectos
          </Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-neutral-700">{projectTitle}</span>
        </nav>

        <RevealOnView className="[&:not(.opacity-100)]:translate-y-4" delay={100}>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.08fr)] lg:items-center">
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-4xl font-semibold leading-tight text-neutral-950 sm:text-[40px]">
                  {projectTitle}
                </h1>
                <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-neutral-700">
                  {projectSummary}
                </p>
              </div>

              {project.featured && (
                <span className="inline-flex rounded-full bg-[#EEF6ED] px-6 py-2 text-sm font-semibold uppercase tracking-wide text-[#5D8259]">
                  Proyecto destacado
                </span>
              )}

            </div>

            <div className="overflow-hidden rounded-[18px] shadow-[0_22px_54px_-34px_rgba(15,23,42,0.48)]">
              {hasProjectVideo && project.videoUrl ? (
                isUploadedVideo(project.videoUrl, project.videoAssetId) ? (
                  <video
                    src={project.videoUrl}
                    controls
                    preload="metadata"
                    className="aspect-[16/10] w-full bg-black object-contain"
                  />
                ) : (
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex aspect-[16/10] w-full items-center justify-center bg-neutral-100 px-8 text-center text-sm font-semibold uppercase tracking-wide text-neutral-500 transition hover:bg-neutral-200"
                  >
                    Ver video principal
                  </a>
                )
              ) : project.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.imageUrl}
                  alt={projectTitle}
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/10] w-full items-center justify-center bg-neutral-100 px-8 text-center text-sm font-medium uppercase tracking-wide text-neutral-400">
                  Sin imagen principal
                </div>
              )}
            </div>
              </div>
        </RevealOnView>
      </section>

      <section className="border-y border-neutral-200 bg-[#FAFAF9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <ProjectDetailTabs />
        </div>
      </section>

      <section id="descripcion" className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-14">
        <RevealOnView className="max-w-3xl [&:not(.opacity-100)]:translate-y-4" delay={120}>
          <article>
            <h2 className="font-serif text-3xl font-semibold text-neutral-900">Descripción</h2>
            <div className="mt-6 whitespace-pre-wrap text-sm font-normal leading-7 text-neutral-700 md:text-base md:leading-8 lg:text-lg lg:leading-9">
              {renderLinkedText(project.content)}
            </div>
          </article>
        </RevealOnView>
      </section>

      {hasGallery && (
        <section id="galeria" className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <RevealOnView className="space-y-6 [&:not(.opacity-100)]:translate-y-4" delay={120}>
            <PublicMediaCarousel items={gallery} imageAltFallback={`Imagen del proyecto ${projectTitle}`} />
          </RevealOnView>
        </section>
      )}

      {hasAdvances && (
        <section id="avances" className="mx-auto max-w-7xl px-4 py-4 sm:px-8">
          <RevealOnView className="space-y-6 [&:not(.opacity-100)]:translate-y-4" delay={100}>
            <div>
              <h2 className="font-serif text-3xl font-semibold text-neutral-900">Avances del proyecto</h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-neutral-700 sm:text-[17px]">
                Seguimiento cronológico de los principales hitos y acciones realizadas en el marco de este proyecto.
              </p>
            </div>

            <div className="relative space-y-8 pl-7 sm:space-y-10 sm:pl-14">
              <div className="absolute left-4 top-0 h-full w-px bg-neutral-200 sm:left-7" />
              {advances.map((advance, index) => {
                const formattedDate = formatTimelineDate(advance.advanceDate);
                return (
                  <article key={advance.id} className="relative grid gap-4 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-6">
                    <div className="relative flex gap-4 sm:block">
                      <div className="absolute left-[-2.45rem] top-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#49A9A2] text-sm font-semibold text-white shadow-[0_10px_22px_-18px_rgba(73,169,162,0.9)] sm:left-[-3.55rem] sm:top-2 sm:h-12 sm:w-12">
                        {index + 1}
                      </div>
                      <div className="ml-4 min-w-[68px] pt-1 text-left text-neutral-700 sm:ml-0 sm:pt-16 sm:text-center">
                        <div className="text-xl font-semibold leading-none text-neutral-800">{formattedDate.day}</div>
                        <div className="mt-1 text-xs font-semibold tracking-wide text-neutral-700">{formattedDate.month}</div>
                        <div className="mt-1 text-xs text-neutral-600">{formattedDate.year}</div>
                      </div>
                    </div>

                    <div className="rounded-[14px] border border-neutral-200 bg-white p-4 shadow-[0_16px_38px_-32px_rgba(15,23,42,0.35)] sm:p-6">
                      <h3 className="font-serif text-xl font-semibold text-neutral-900 sm:text-2xl">{advance.title}</h3>
                      <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-neutral-700 sm:text-[17px] sm:leading-8">
                        {renderLinkedText(advance.description)}
                      </p>
                      {advanceMediaItems(advance).length > 0 && (
                        <div className="mt-5 sm:mt-6">
                          <PublicMediaCarousel
                            compact
                            items={advanceMediaItems(advance)}
                            imageAltFallback={advance.title}
                          />
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </RevealOnView>
        </section>
      )}

      {hasDocuments && (
        <section id="documentos" className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
          <RevealOnView className="space-y-6 [&:not(.opacity-100)]:translate-y-4" delay={100}>
            <h2 className="font-serif text-3xl font-semibold text-neutral-900">Documentos</h2>
            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              {documents.map((document) => (
                <article
                  key={document.id}
                  className="min-w-0 rounded-[14px] border border-neutral-200 bg-white p-6 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.34)] transition-[transform,box-shadow] duration-300 ease-out [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-[0_18px_35px_-28px_rgba(15,23,42,0.45)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {document.fileType && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#49A9A2]">
                          {document.fileType}
                        </p>
                      )}
                      <h3 className="mt-2 overflow-hidden break-words font-serif text-xl font-semibold text-neutral-900">
                        {document.title}
                      </h3>
                    </div>
                  </div>
                  {document.description && (
                    <p className="mt-3 overflow-hidden break-words text-[17px] leading-8 text-neutral-700">
                      {renderLinkedText(document.description)}
                    </p>
                  )}
                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-800 transition hover:border-[#49A9A2] hover:bg-neutral-100 hover:text-[#247E79]"
                  >
                    Abrir documento
                  </a>
                </article>
              ))}
            </div>
          </RevealOnView>
        </section>
      )}
    </main>
  );
}
