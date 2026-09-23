import type { Metadata } from "next";
import { Leaf } from "lucide-react";
import PillarPage from "@/components/pillars/PillarPage";
import { getPublicPreserveContent } from "@/services/preserve";
import { listPublicProjectsCmsOnly } from "@/services/projects";
import { ogImage, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Conservar | Reserva Natural Lago Escondido",
  description:
    "Conservamos la biodiversidad y los ecosistemas para las generaciones presentes y futuras.",
  alternates: {
    canonical: "/conservar",
  },
  openGraph: {
    title: "Conservar | Reserva Natural Lago Escondido",
    description:
      "Conservamos la biodiversidad y los ecosistemas para las generaciones presentes y futuras.",
    url: siteUrl("/conservar"),
    images: [ogImage("/img/alerces.jpg")],
    type: "website",
  },
};

export default async function ConservarPage() {
  const [content, projects] = await Promise.all([
    getPublicPreserveContent(),
    listPublicProjectsCmsOnly(),
  ]);

  return (
    <PillarPage
      title="Conservar"
      sectionNav={{
        pageName: "Conservar",
        items: [
          { number: "01", label: "Qué hacemos", targetId: "que-hacemos" },
          { number: "02", label: "Nuestro enfoque", targetId: "nuestro-enfoque" },
          { number: "03", label: "Proyectos relacionados", targetId: "proyectos-relacionados" },
        ],
      }}
      intro={content.intro}
      icon={Leaf}
      iconTone="bg-[#2FABA3]"
      iconRing="bg-[#2FABA3]/20"
      heroAsideLines={content.heroAsideLines}
      whatEyebrow={content.whatEyebrow}
      body={content.whatWeDoText}
      bullets={content.bullets}
      mainImage={{
        src: "/img/alerces.jpg",
        alt: "Paisaje natural de lago y montanas",
        variant: "portrait",
      }}
      territorySection={{
        eyebrow: content.territoryEyebrow,
        title: content.territoryTitle,
        body: content.territoryText,
        metricValue: content.territoryMetricValue,
        metricDescription: content.territoryMetricDescription,
        researchTitle: content.territoryResearchTitle,
        researchDescription: content.territoryResearchDescription,
        educationTitle: content.territoryEducationTitle,
        educationDescription: content.territoryEducationDescription,
      }}
      relatedProjects={projects}
    />
  );
}
