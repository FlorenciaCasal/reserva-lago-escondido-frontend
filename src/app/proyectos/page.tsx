import type { Metadata } from "next";
import PublicProjectsListing from "@/components/projects/PublicProjectsListing";
import { listPublicProjectsCmsOnly } from "@/services/projects";
import { ogImage, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Proyectos | Reserva Natural Lago Escondido",
  description: "Conoce los proyectos de conservación, investigación y regeneración impulsados por la Reserva Natural Lago Escondido.",
  alternates: {
    canonical: "/proyectos",
  },
  openGraph: {
    title: "Proyectos | Reserva Natural Lago Escondido",
    description:
      "Conoce los proyectos de conservación, investigación y regeneración impulsados por la Reserva Natural Lago Escondido.",
    url: siteUrl("/proyectos"),
    images: [ogImage()],
    type: "website",
  },
};

export default async function ProjectsPage() {
  const projects = await listPublicProjectsCmsOnly();
  return <PublicProjectsListing projects={projects} />;
}
