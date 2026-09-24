"use client";

import { useEffect, useState } from "react";

export type ProjectDetailSection = {
  id: string;
  label: string;
};

const defaultSections: ProjectDetailSection[] = [
  { id: "descripcion", label: "Descripción" },
  { id: "galeria", label: "Galería" },
  { id: "avances", label: "Avances" },
  { id: "documentos", label: "Documentos" },
];

export default function ProjectDetailTabs({ sections = defaultSections }: { sections?: ProjectDetailSection[] }) {
  const [activeTab, setActiveTab] = useState(sections[0]?.id ?? "descripcion");

  useEffect(() => {
    const observedSections = sections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (observedSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveTab(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.05, 0.2, 0.45, 0.7],
      }
    );

    observedSections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;

    setActiveTab(id);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="-mx-4 px-3 min-[400px]:overflow-x-auto sm:mx-0 sm:overflow-visible sm:px-0">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-4 text-sm font-semibold text-neutral-700 min-[400px]:flex min-[400px]:min-w-max min-[400px]:gap-3 sm:w-auto sm:flex-wrap sm:gap-8 sm:py-5">
        {sections.map((section) => {
          const isActive = activeTab === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={`whitespace-nowrap border-b-2 px-0.5 pb-2 pt-1 text-left transition-colors min-[400px]:shrink-0 min-[400px]:px-1 ${
                isActive
                  ? "border-[#49A9A2] text-[#247E79]"
                  : "border-transparent text-neutral-600 hover:text-neutral-950"
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
