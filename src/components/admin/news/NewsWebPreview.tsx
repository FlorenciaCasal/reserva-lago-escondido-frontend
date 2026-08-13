"use client";

import type { NewsImage } from "@/types/news";

type Props = {
  title: string;
  summary: string;
  content: string;
  slug: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  images?: NewsImage[];
};

export default function NewsWebPreview({
  title,
  summary,
  content,
  slug,
  imageUrl,
  videoUrl,
  images = [],
}: Props) {
  const displayTitle = title.trim() || "Titulo de la novedad";
  const displaySummary = summary.trim() || "Resumen breve de la novedad para listados y tarjetas.";
  const displayContent = content.trim() || "El contenido editable aparecera aca para revisar la publicacion antes de guardarla.";
  const gallery = images.filter((image) => image.imageUrl);

  return (
    <article className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-primary-light">
        Preview web
      </p>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={displayTitle}
          className="mb-5 aspect-video w-full rounded-lg border border-neutral-800 object-cover"
        />
      )}
      <h3 className="text-xl font-semibold leading-tight text-white">{displayTitle}</h3>
      <p className="mt-3 text-sm leading-6 text-neutral-300">{displaySummary}</p>
      <div className="mt-5 whitespace-pre-wrap border-t border-neutral-800 pt-5 text-sm leading-7 text-neutral-200">
        {displayContent}
      </div>
      {videoUrl && (
        <video controls className="mt-5 aspect-video w-full rounded-lg border border-neutral-800">
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}
      {gallery.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-2">
          {gallery.slice(0, 4).map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.id}
              src={image.imageUrl}
              alt={image.altText || displayTitle}
              className="aspect-video rounded-lg border border-neutral-800 object-cover"
            />
          ))}
        </div>
      )}
      <p className="mt-5 rounded-lg bg-black/30 px-3 py-2 text-xs text-neutral-400">
        /novedades/{slug || "slug-de-la-novedad"}
      </p>
    </article>
  );
}
