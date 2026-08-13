import type { Metadata } from "next";
import { Sprout } from "lucide-react";
import PillarPage from "@/components/pillars/PillarPage";

export const metadata: Metadata = {
  title: "Producir | Reserva Natural Lago Escondido",
  description:
    "Promovemos actividades productivas sustentables que respeten la naturaleza y a las comunidades.",
  openGraph: {
    title: "Producir | Reserva Natural Lago Escondido",
    description:
      "Promovemos actividades productivas sustentables que respeten la naturaleza y a las comunidades.",
    images: ["/img/form.jpeg"],
  },
};

export default function ProducirPage() {
  return (
    <PillarPage
      title="Producir"
      intro="Promovemos actividades productivas sustentables que respeten la naturaleza y a las comunidades."
      icon={Sprout}
      iconTone="bg-[#FFC247]"
      iconRing="bg-[#FFC247]/25"
      body="Trabajamos en estandares de produccion artesanal y sustentable enfocados en potenciar el consumo de forma local y consciente. Cada proceso es disenado para minimizar el impacto ambiental y fortalecer el tejido social."
      bullets={[
        "Huerta agroecologica",
        "Talleres de oficios y saberes",
        "Produccion local",
        "Energias renovables",
      ]}
      mainImage={{
        src: "/img/form.jpeg",
        alt: "Trabajo productivo en huerta agroecologica",
      }}
      relatedActivities={[
        {
          title: "Huerta agroecologica",
          imageUrl: "/img/escuela.jpg",
          alt: "Sistema de riego en una huerta",
        },
        {
          title: "Produccion local",
          imageUrl: "/img/particular.jpg",
          alt: "Productos locales organizados en estanteria",
        },
        {
          title: "Energias renovables",
          imageUrl: "/img/agua.jpg",
          alt: "Lago de la reserva rodeado de bosque",
        },
      ]}
    />
  );
}
