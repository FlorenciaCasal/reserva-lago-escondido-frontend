"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Leaf, Mountain, Sprout } from "lucide-react";
import type { HomeContent, HomePillarContent } from "@/types/home";

const pillarConfig = [
  {
    key: "conservar",
    href: "/conservar",
    icon: Leaf,
    tone: "bg-[#EEF6ED]",
  },
  {
    key: "habitar",
    href: "/habitar",
    icon: Mountain,
    tone: "bg-[#EEF3F5]",
  },
  {
    key: "producir",
    href: "/producir",
    icon: Sprout,
    tone: "bg-[#F6F1E6]",
  },
] as const;

export default function HomePillars({ content }: { content: HomeContent }) {
  const pillars = useMemo(
    () =>
      pillarConfig.map((pillar) => ({
        ...pillar,
        content: content[pillar.key] as HomePillarContent,
      })),
    [content],
  );
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasAnimated = useRef(false);
  const [entered, setEntered] = useState(false);
  const [counts, setCounts] = useState(() => pillarConfig.map(() => 0));

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      hasAnimated.current = true;
      setEntered(true);
      setCounts(pillars.map((pillar) => pillarValue(pillar.content)));
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    const animateCounts = () => {
      const duration = 1050;
      const startedAt = performance.now();
      const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = easeOutCubic(progress);

        setCounts(pillars.map((pillar) => Math.round(pillarValue(pillar.content) * eased)));

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasAnimated.current) return;

        hasAnimated.current = true;
        setEntered(true);
        animateCounts();
        observer.disconnect();
      },
      { threshold: 0.25 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [pillars]);

  return (
    <section ref={sectionRef} className="bg-[#FAFAF9] px-6 py-8 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-sm font-bold uppercase tracking-[0.18em] text-neutral-800">
          {content.actionTitle}
          {/* Nuestros 3 pilares */}
        </h2>
        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const value = counts[index] ?? 0;

            return (
              <Link
                key={pillar.key}
                href={pillar.href}
                style={{ transitionDelay: entered ? `${index * 100}ms` : "0ms" }}
                className={`${pillar.tone} group flex min-h-[330px] flex-col items-center rounded-sm px-8 py-9 text-center opacity-0 shadow-none transition-[opacity,transform,box-shadow] duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 md:px-7 ${entered ? "translate-y-0 opacity-100" : "translate-y-4"
                  } [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-[0_18px_35px_-28px_rgba(15,23,42,0.45)]`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-sm transition-transform duration-300 [@media(hover:hover)]:group-hover:scale-[1.05]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-neutral-800">
                  {pillar.content.title}
                </h3>
                <div className="mt-6">
                  <p className="text-[40px] font-bold leading-none text-neutral-900 sm:text-[44px] lg:text-[46px]">
                    {value}
                    {pillar.content.suffix}
                  </p>
                  <p className="mx-auto mt-3 max-w-[220px] text-xs font-semibold uppercase leading-5 tracking-[0.12em] text-neutral-600">
                    {pillar.content.statLabel}
                  </p>
                </div>
                <p className="mt-5 text-sm leading-6 text-neutral-700">
                  {pillar.content.text}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-7 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  {pillar.content.ctaLabel}
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 [@media(hover:hover)]:group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function pillarValue(pillar: HomePillarContent) {
  const value = Number(pillar.value);
  return Number.isFinite(value) ? value : 0;
}
