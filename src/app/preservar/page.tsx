import type { Metadata } from "next";
import { Leaf } from "lucide-react";
import PillarPage from "@/components/pillars/PillarPage";
import { listPublicProjectsCmsOnly } from "@/services/projects";

export const metadata: Metadata = {
  title: "Preservar | Reserva Natural Lago Escondido",
  description:
    "Conservamos la biodiversidad y los ecosistemas para las generaciones presentes y futuras.",
  openGraph: {
    title: "Preservar | Reserva Natural Lago Escondido",
    description:
      "Conservamos la biodiversidad y los ecosistemas para las generaciones presentes y futuras.",
    images: ["/img/alerces.jpg"],
  },
};

export default async function PreservarPage() {
  const projects = await listPublicProjectsCmsOnly();

  return (
    <PillarPage
      title="Preservar"
      intro="Conservamos la biodiversidad y los ecosistemas para las generaciones presentes y futuras."
      icon={Leaf}
      iconTone="bg-[#2FABA3]"
      iconRing="bg-[#2FABA3]/20"
      body="Trabajamos en la proteccion de especies nativas, la restauracion de ambientes y la investigacion cientifica para comprender y cuidar nuestro entorno. Nuestro compromiso es integral y se basa en pilares tecnicos y educativos."
      bullets={[
        "Conservacion de especies nativas",
        "Restauracion de ecosistemas",
        "Investigacion y monitoreo",
        "Educacion ambiental",
      ]}
      mainImage={{
        src: "/img/alerces.jpg",
        alt: "Paisaje natural de lago y montanas",
        variant: "portrait",
      }}
      relatedProjects={projects}
    />
  );
}
