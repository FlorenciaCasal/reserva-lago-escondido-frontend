import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicProjectDetail from "@/components/projects/PublicProjectDetail";
import { getPublicProjectBySlug, listPublicProjectAdvances } from "@/services/projects";
import { ogImage, siteUrl } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

  if (!project) {
    return {
      title: "Proyecto | Reserva Natural Lago Escondido",
      description: "Proyecto institucional de la Reserva Natural Lago Escondido.",
    };
  }

  const canonical = `/proyectos/${project.slug}`;

  return {
    title: `${project.title} | Reserva Natural Lago Escondido`,
    description: project.summary,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${project.title} | Reserva Natural Lago Escondido`,
      description: project.summary,
      url: siteUrl(canonical),
      images: [ogImage(project.imageUrl)],
      type: "article",
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  const advances = project ? await listPublicProjectAdvances(slug) : [];

  if (!project) {
    notFound();
  }

  return <PublicProjectDetail project={project} advances={advances} />;
}
