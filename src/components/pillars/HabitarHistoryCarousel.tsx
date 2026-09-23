"use client";

import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type MediaSlide =
  | { type: "image"; src: string; alt: string }
  | {
      type: "video";
      src: string;
      poster?: string;
      title?: string;
      captions?: { src: string; srcLang: string; label: string; default?: boolean }[];
    };

const mediaItems: MediaSlide[] = [
  {
    type: "image",
    src: "/img/circuito4.jpg",
    alt: "Lago y montañas de la Reserva Natural Lago Escondido",
  },
  {
    type: "image",
    src: "/img/home.jpg",
    alt: "Vista panorámica de montañas y lago",
  },
  {
    type: "image",
    src: "/img/alerces2.jpg",
    alt: "Detalle de vegetación nativa",
  },
  {
    type: "image",
    src: "/img/alerces.jpg",
    alt: "Bosque nativo de la reserva",
  },
  {
    type: "image",
    src: "/img/escuela.jpg",
    alt: "Registro histórico de actividades en la reserva",
  },
  {
    type: "image",
    src: "/img/agua.jpg",
    alt: "Lago rodeado de montañas",
  },
  {
    type: "image",
    src: "/img/didymo.jpg",
    alt: "Detalle de corteza y naturaleza",
  },
  {
    type: "image",
    src: "/img/circuito2.jpg",
    alt: "Muelle y paisaje lacustre",
  },
];

export default function HabitarHistoryCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const item = mediaItems[activeIndex];
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Pause on replacement or unmount, including navigation away from this page.
  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    if (videoRef.current && videoRef.current !== video) {
      videoRef.current.pause();
    }
    videoRef.current = video;
  }, []);

  function selectSlide(index: number) {
    const nextIndex = (index + mediaItems.length) % mediaItems.length;
    if (nextIndex === activeIndex) return;
    videoRef.current?.pause();
    setActiveIndex(nextIndex);
  }

  function slideDescription(slide: MediaSlide) {
    return slide.type === "image" ? slide.alt : slide.title ?? "Video de nuestra historia";
  }

  function moveSlide(offset: number) {
    selectSlide(activeIndex + offset);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    // Native video controls own their keyboard shortcuts (seek, play/pause, etc.).
    if (event.target instanceof Element && event.target.closest("video")) return;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        moveSlide(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        moveSlide(1);
        break;
      case "Home":
        event.preventDefault();
        selectSlide(0);
        break;
      case "End":
        event.preventDefault();
        selectSlide(mediaItems.length - 1);
        break;
    }
  }

  return (
    <div
      role="group"
      aria-roledescription="carrusel"
      aria-label="Fotografías y videos de nuestra historia"
      onKeyDown={handleKeyDown}
      className="relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-lg bg-neutral-200 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.55)]"
    >
      <div
        role="group"
        aria-roledescription="diapositiva"
        aria-label={`${activeIndex + 1} de ${mediaItems.length}`}
        className="absolute inset-0"
      >
        {item.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.src}
            src={item.src}
            alt={item.alt}
            loading={activeIndex === 0 ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            key={`${activeIndex}-${item.src}`}
            ref={attachVideo}
            src={item.src}
            poster={item.poster}
            aria-label={slideDescription(item)}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full bg-black object-contain focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
          >
            {item.captions?.map((track) => (
              <track key={`${track.srcLang}-${track.src}`} kind="captions" {...track} />
            ))}
            Tu navegador no admite video HTML5. <a href={item.src}>Abrir video</a>.
          </video>
        )}
      </div>

      <button
        type="button"
        aria-label="Mostrar elemento anterior"
        onClick={() => moveSlide(-1)}
        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white transition hover:bg-black/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Mostrar elemento siguiente"
        onClick={() => moveSlide(1)}
        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white transition hover:bg-black/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      <div role="group" aria-label="Elegir elemento" className={`pointer-events-none absolute inset-x-0 flex justify-center ${item.type === "video" ? "bottom-16" : "bottom-3"}`}>
        <div className="pointer-events-auto flex rounded-full bg-black/40 px-1">
          {mediaItems.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Mostrar ${slide.type === "video" ? "video" : "fotografía"} ${index + 1} de ${mediaItems.length}: ${slideDescription(slide)}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => selectSlide(index)}
              className="flex h-8 w-7 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
            >
              <span aria-hidden="true" className={`h-1.5 rounded-full ${index === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"}`} />
            </button>
          ))}
        </div>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {activeIndex + 1} de {mediaItems.length}. {item.type === "video" ? "Video." : "Fotografía."} {slideDescription(item)}
      </p>
    </div>
  );
}
