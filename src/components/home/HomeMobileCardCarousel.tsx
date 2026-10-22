"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  children: ReactNode;
  label: string;
  previousLabel: string;
  nextLabel: string;
  itemLabel: string;
};

export default function HomeMobileCardCarousel({
  children,
  label,
  previousLabel,
  nextLabel,
  itemLabel,
}: Props) {
  const items = Children.toArray(children);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(items.length > 1);

  const updateControls = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const width = carousel.clientWidth || 1;
    const nextIndex = Math.min(Math.max(Math.round(carousel.scrollLeft / width), 0), items.length - 1);
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

    setActiveIndex(nextIndex);
    setCanScrollPrev(carousel.scrollLeft > 2);
    setCanScrollNext(carousel.scrollLeft < maxScrollLeft - 2);
  }, [items.length]);

  useEffect(() => {
    updateControls();
    window.addEventListener("resize", updateControls);
    return () => window.removeEventListener("resize", updateControls);
  }, [updateControls]);

  function goTo(index: number) {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nextIndex = Math.min(Math.max(index, 0), items.length - 1);

    carousel.scrollTo({
      left: carousel.clientWidth * nextIndex,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <div className="sm:hidden">
      <div
        ref={carouselRef}
        onScroll={updateControls}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(activeIndex - 1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goTo(activeIndex + 1);
          }
        }}
        tabIndex={0}
        aria-label={label}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <div key={index} className="min-w-0 shrink-0 basis-full snap-start">
            {item}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            disabled={!canScrollPrev}
            aria-label={previousLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/35 text-primary transition hover:border-primary hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex max-w-[60vw] flex-wrap items-center justify-center gap-2" aria-label="Posición del carrusel">
            {items.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`${itemLabel} ${index + 1}`}
                aria-current={activeIndex === index ? "true" : undefined}
                className={`h-2.5 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                  activeIndex === index ? "w-6 bg-primary" : "w-2.5 bg-primary/30 hover:bg-primary/55"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            disabled={!canScrollNext}
            aria-label={nextLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/35 text-primary transition hover:border-primary hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
