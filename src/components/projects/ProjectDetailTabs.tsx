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
    <div className="flex flex-wrap gap-8 py-5 text-sm font-semibold text-neutral-700">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => scrollToSection(tab.id)}
            className={`border-b-2 pb-2 transition-colors ${
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
  );
}
