import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicProjectDetail from "@/components/projects/PublicProjectDetail";
import { getPublicProjectBySlug, listPublicProjectAdvances } from "@/services/projects";

const ORIGIN = process.env.APP_ORIGIN ?? "http://localhost:3000";

function absoluteImage(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${ORIGIN}${url}`;
}

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

  const image = absoluteImage(project.imageUrl);

  return {
    title: `${project.title} | Reserva Natural Lago Escondido`,
    description: project.summary,
    openGraph: {
      title: `${project.title} | Reserva Natural Lago Escondido`,
      description: project.summary,
      ...(image ? { images: [image] } : {}),
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
