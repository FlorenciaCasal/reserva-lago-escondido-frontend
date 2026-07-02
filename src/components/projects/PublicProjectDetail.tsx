import Link from "next/link";
import type React from "react";
import ProjectDetailTabs from "@/components/projects/ProjectDetailTabs";
import type { Project, ProjectAdvance } from "@/types/project";

function PlaceholderCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[14px] border border-neutral-200 bg-white p-6 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.35)]">
      <h3 className="font-serif text-xl font-semibold text-neutral-900">{title}</h3>
      <p className="mt-3 text-[17px] leading-8 text-neutral-700">{text}</p>
    </div>
  );
}

function isUploadedVideo(videoUrl?: string | null, videoAssetId?: string | null) {
  const url = videoUrl?.trim();
  return Boolean(videoAssetId) || Boolean(url?.startsWith("/api/media/"));
}

function repairMojibake(value?: string | null) {
  if (!value) return "";
  if (!/[ÃÂâ€]/.test(value)) return value;

  let repaired = value;
  for (let index = 0; index < 3; index += 1) {
    try {
      const next = decodeURIComponent(escape(repaired));
      if (next === repaired) break;
      repaired = next;
    } catch {
      break;
    }
  }

  return repaired;
}

function renderLinkedText(value?: string | null) {
  const text = repairMojibake(value);
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

export default function PublicProjectDetail({
  project,
  advances,
}: {
  project: Project;
  advances: ProjectAdvance[];
}) {
  const gallery = project.gallery ?? [];
  const documents = project.documents ?? [];
  const projectTitle = repairMojibake(project.title);
  const projectSummary = repairMojibake(project.summary);

  return (
    <main className="bg-[#FAFAF9] text-neutral-900">
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
        <nav className="text-sm font-semibold text-neutral-600">
          <Link href="/proyectos" className="hover:text-neutral-900">
            Proyectos
          </Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-neutral-700">{projectTitle}</span>
        </nav>

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
            {project.imageUrl ? (
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
      </section>

      <section className="border-y border-neutral-200 bg-[#FAFAF9]">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <ProjectDetailTabs />
        </div>
      </section>

      <section id="descripcion" className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <div className="max-w-3xl">
          <article>
            <h2 className="font-serif text-3xl font-semibold text-neutral-900">Descripcion</h2>
            <div className="mt-6 whitespace-pre-wrap text-[17px] font-normal leading-9 text-neutral-700">
              {renderLinkedText(project.content)}
            </div>
          </article>
        </div>
      </section>

      <section id="avances" className="mx-auto max-w-7xl px-6 py-4 sm:px-8">
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-neutral-900">Avances del proyecto</h2>
            <p className="mt-4 max-w-3xl text-[17px] leading-8 text-neutral-700">
              Seguimiento cronologico de los principales hitos y acciones realizadas en el marco de este proyecto.
            </p>
          </div>

          {advances.length === 0 ? (
            <PlaceholderCard
              title="Todavia no hay avances publicados"
              text="Cuando el proyecto comparta sus primeros hitos, esta linea de tiempo mostrara cada avance con fecha, descripcion y recursos asociados."
            />
          ) : (
            <div className="relative space-y-10 pl-10 sm:pl-14">
              <div className="absolute left-5 top-0 h-full w-px bg-neutral-200 sm:left-7" />
              {advances.map((advance, index) => {
                const formattedDate = formatTimelineDate(advance.advanceDate);
                return (
                  <article key={advance.id} className="relative grid gap-4 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-6">
                    <div className="relative flex gap-4 sm:block">
                      <div className="absolute left-[-2.55rem] top-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#49A9A2] text-sm font-semibold text-white shadow-[0_10px_22px_-18px_rgba(73,169,162,0.9)] sm:left-[-3.55rem] sm:h-12 sm:w-12">
                        {index + 1}
                      </div>
                      <div className="min-w-[68px] pt-14 text-center text-neutral-700 sm:pt-16">
                        <div className="text-xl font-semibold leading-none text-neutral-800">{formattedDate.day}</div>
                        <div className="mt-1 text-xs font-semibold tracking-wide text-neutral-700">{formattedDate.month}</div>
                        <div className="mt-1 text-xs text-neutral-600">{formattedDate.year}</div>
                      </div>
                    </div>

                    <div className="rounded-[14px] border border-neutral-200 bg-white p-6 shadow-[0_16px_38px_-32px_rgba(15,23,42,0.35)]">
                      <h3 className="font-serif text-2xl font-semibold text-neutral-900">{repairMojibake(advance.title)}</h3>
                      <p className="mt-3 whitespace-pre-wrap text-[17px] leading-8 text-neutral-700">
                        {renderLinkedText(advance.description)}
                      </p>

                      {(advance.imageUrl || advance.videoUrl) && (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                          {advance.imageUrl && (
                            <div className="overflow-hidden rounded-[10px] border border-neutral-200 bg-neutral-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={advance.imageUrl}
                                alt={repairMojibake(advance.title)}
                                className="aspect-[16/10] w-full object-cover"
                              />
                            </div>
                          )}
                          {advance.videoUrl && (
                            isUploadedVideo(advance.videoUrl, advance.videoAssetId) ? (
                              <div className="overflow-hidden rounded-[10px] border border-neutral-200 bg-black">
                                <video
                                  src={advance.videoUrl}
                                  controls
                                  preload="metadata"
                                  className="aspect-[16/10] w-full bg-black object-contain"
                                />
                              </div>
                            ) : (
                              <a
                                href={advance.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex min-h-40 items-center justify-center rounded-[10px] border border-neutral-200 bg-neutral-50 px-6 text-center text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
                              >
                                Ver video relacionado
                              </a>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="galeria" className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="space-y-6">
          <h2 className="font-serif text-3xl font-semibold text-neutral-900">Galeria</h2>
          {gallery.length === 0 ? (
            <PlaceholderCard
              title="Todavia no hay imagenes en la galeria"
              text="Cuando se publiquen imagenes asociadas a este proyecto, se mostraran aqui como registro visual de sus acciones y avances."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {gallery.map((image) => {
                const imageCaption = repairMojibake(image.caption);
                const imageAlt =
                  repairMojibake(image.altText) ||
                  imageCaption ||
                  `Imagen del proyecto ${projectTitle}`;

                return (
                  <figure
                    key={image.id}
                    className="overflow-hidden rounded-[12px] border border-neutral-200 bg-white shadow-[0_14px_34px_-30px_rgba(15,23,42,0.34)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.imageUrl}
                      alt={imageAlt}
                      className="aspect-video w-full object-cover"
                    />
                    {imageCaption && (
                      <figcaption className="px-4 py-3 text-sm leading-6 text-neutral-700">
                        {imageCaption}
                      </figcaption>
                    )}
                  </figure>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="documentos" className="mx-auto max-w-7xl px-6 pb-16 sm:px-8">
        <div className="space-y-6">
          <h2 className="font-serif text-3xl font-semibold text-neutral-900">Documentos</h2>
          {documents.length === 0 ? (
            <PlaceholderCard
              title="Todavia no hay documentos publicados"
              text="Cuando se publiquen fichas tecnicas, informes o materiales de apoyo, se mostraran en esta seccion."
            />
          ) : (
            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              {documents.map((document) => (
                <article
                  key={document.id}
                  className="min-w-0 rounded-[14px] border border-neutral-200 bg-white p-6 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.34)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {document.fileType && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#49A9A2]">
                          {document.fileType}
                        </p>
                      )}
                      <h3 className="mt-2 overflow-hidden break-words font-serif text-xl font-semibold text-neutral-900">
                        {repairMojibake(document.title)}
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
          )}
        </div>
      </section>
    </main>
  );
}
