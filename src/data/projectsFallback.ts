import type { Project } from "@/types/project";

export const fallbackProjects: Project[] = [
  {
    id: "fallback-huemul",
    title: "Huemules",
    summary: "Protección y seguimiento de la población de huemules en el parque.",
    content:
      "Proyecto orientado al monitoreo de poblaciones de huemules y a la protección de su habitat natural dentro de la reserva. Esta ficha publica funciona como respaldo cuando el backend no esta disponible.",
    slug: "huemules",
    imageUrl: "/img/huemul2.png",
    videoUrl: null,
    featured: true,
    status: "PUBLISHED",
    publishedAt: null,
    archivedAt: null,
  },
  {
    id: "fallback-alerce",
    title: "Alerces I",
    summary: "Investigación y conservación de alerces milenarios en la zona sur de la reserva.",
    content:
      "Proyecto centrado en el estudio, seguimiento y conservación de ejemplares de alerce en sectores de difícil acceso. Esta ficha pública funciona como respaldo cuando el backend no esta disponible.",
    slug: "alerce",
    imageUrl: "/img/alerces.jpg",
    videoUrl: null,
    featured: true,
    status: "PUBLISHED",
    publishedAt: null,
    archivedAt: null,
  },
  {
    id: "fallback-didymo",
    title: "Didymo",
    summary: "Estudio y cuidado de la biodiversidad en la cuenca del Didymo.",
    content:
      "Proyecto enfocado en prevención, monitoreo y concientización sobre especies invasoras acuaticas. Esta ficha pública funciona como respaldo cuando el backend no esta disponible.",
    slug: "didymo",
    imageUrl: "/img/didymo.jpg",
    videoUrl: null,
    featured: false,
    status: "PUBLISHED",
    publishedAt: null,
    archivedAt: null,
  },
];
