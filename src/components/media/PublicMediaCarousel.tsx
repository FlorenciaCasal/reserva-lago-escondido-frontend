"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { MediaGalleryItem } from "@/types/project";

type Props = {
  items: MediaGalleryItem[];
  imageAltFallback: string;
  compact?: boolean;
};

function isYoutube(item: MediaGalleryItem) {
  return item.kind === "VIDEO" && item.sourceType === "EXTERNAL_YOUTUBE" && item.embedUrl;
}

function isPlayableMp4(item: MediaGalleryItem) {
  return item.kind === "VIDEO" && (item.url.startsWith("/api/media/") || item.url.toLowerCase().endsWith(".mp4"));
}

export default function PublicMediaCarousel({ items, imageAltFallback, compact = false }: Props) {
  const sorted = React.useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder || (a.createdAt ?? "").localeCompare(b.createdAt ?? "")),
    [items]
  );
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [playingId, setPlayingId] = React.useState<string | null>(null);
  const active = sorted[activeIndex];

  if (!active) return null;

  function goTo(index: number) {
    setPlayingId(null);
    setActiveIndex((index + sorted.length) % sorted.length);
  }

  const frameClass = compact ? "aspect-[16/9] max-h-[360px]" : "aspect-video max-h-[520px]";
  const mediaShellClass = compact ? "mx-auto w-full max-w-[640px]" : "mx-auto w-full max-w-[924px]";

  return (
    <figure className="space-y-3">
      <div className={mediaShellClass}>
        <div className={`relative overflow-hidden rounded-[12px] border border-neutral-200 bg-neutral-100 ${frameClass}`}>
          {active.kind === "IMAGE" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={active.url}
              alt={active.altText || active.caption || imageAltFallback}
              className="h-full w-full object-contain"
            />
          ) : isYoutube(active) ? (
            playingId === active.id ? (
              <iframe
                src={`${active.embedUrl}?rel=0`}
                title={active.caption || imageAltFallback}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlayingId(active.id)}
                className="group relative h-full w-full bg-neutral-950"
                aria-label="Reproducir video"
              >
                {active.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={active.thumbnailUrl} alt="" className="h-full w-full object-cover opacity-90" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm text-white/70">Video</span>
                )}
                <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/10" />
                <span className="absolute left-1/2 top-1/2 inline-flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-950 shadow-lg transition group-hover:scale-105">
                  <Play className="ml-0.5 h-6 w-6 fill-current" />
                </span>
              </button>
            )
          ) : active.url && isPlayableMp4(active) ? (
            <video src={active.url} controls preload="metadata" className="h-full w-full bg-black object-contain" />
          ) : active.url ? (
            <a
              href={active.url}
              target="_blank"
              rel="noreferrer"
              className="flex h-full w-full items-center justify-center bg-neutral-50 px-6 text-center text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
            >
              Ver video relacionado
            </a>
          ) : null}

          {sorted.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-sm transition hover:bg-white"
                aria-label="Medio anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-sm transition hover:bg-white"
                aria-label="Medio siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {sorted.length > 1 && (
          <div
            className="mt-3 flex max-w-full flex-wrap items-center justify-center gap-2 px-4"
            aria-label={`Medio ${activeIndex + 1} de ${sorted.length}`}
          >
            {sorted.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                className={`h-2 w-2 rounded-full transition ${index === activeIndex ? "bg-[#2FABA3]" : "bg-neutral-300"}`}
                aria-label={`Ver medio ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {active.caption && (
        <figcaption className={`${mediaShellClass} text-sm leading-6 text-neutral-700`}>
          {active.caption}
        </figcaption>
      )}
    </figure>
  );
}
