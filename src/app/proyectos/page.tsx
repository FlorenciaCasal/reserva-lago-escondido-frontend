import type { Metadata } from "next";
import PublicProjectsListing from "@/components/projects/PublicProjectsListing";
import { listPublicProjects } from "@/services/projects";

export const metadata: Metadata = {
  title: "Proyectos | Reserva Natural Lago Escondido",
  description: "Conoce los proyectos de conservacion, investigacion y regeneracion impulsados por la Reserva Natural Lago Escondido.",
  openGraph: {
    title: "Proyectos | Reserva Natural Lago Escondido",
    description:
      "Conoce los proyectos de conservacion, investigacion y regeneracion impulsados por la Reserva Natural Lago Escondido.",
    images: ["/img/home.jpeg"],
  },
};

export default async function ProjectsPage() {
  const projects = await listPublicProjects();
  return <PublicProjectsListing projects={projects} />;
}
