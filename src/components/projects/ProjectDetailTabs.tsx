"use client";

import { useEffect, useState } from "react";

const tabs = [
  { id: "descripcion", label: "Descripcion" },
  { id: "avances", label: "Avances" },
  { id: "galeria", label: "Galeria" },
  { id: "documentos", label: "Documentos" },
];

export default function ProjectDetailTabs() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

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

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;

    setActiveTab(id);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="-mx-4 px-3 min-[400px]:overflow-x-auto sm:mx-0 sm:overflow-visible sm:px-0">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-4 text-sm font-semibold text-neutral-700 min-[400px]:flex min-[400px]:min-w-max min-[400px]:gap-3 sm:w-auto sm:flex-wrap sm:gap-8 sm:py-5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollToSection(tab.id)}
              className={`whitespace-nowrap border-b-2 px-0.5 pb-2 pt-1 text-left transition-colors min-[400px]:shrink-0 min-[400px]:px-1 ${
                isActive
                  ? "border-[#49A9A2] text-[#247E79]"
                  : "border-transparent text-neutral-600 hover:text-neutral-950"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
