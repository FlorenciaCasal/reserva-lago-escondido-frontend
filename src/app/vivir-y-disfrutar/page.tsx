import type { Metadata } from "next";
import { Mountain } from "lucide-react";
import PillarPage from "@/components/pillars/PillarPage";

export const metadata: Metadata = {
  title: "Vivir y disfrutar | Reserva Natural Lago Escondido",
  description:
    "Invitamos a conectar con la naturaleza a traves de experiencias unicas y responsables.",
  openGraph: {
    title: "Vivir y disfrutar | Reserva Natural Lago Escondido",
    description:
      "Invitamos a conectar con la naturaleza a traves de experiencias unicas y responsables.",
    images: ["/img/circuito4.jpg"],
  },
};

export default function VivirYDisfrutarPage() {
  return (
    <PillarPage
      title="Vivir y disfrutar"
      intro="Invitamos a conectar con la naturaleza a traves de experiencias unicas y responsables."
      icon={Mountain}
      iconTone="bg-[#A7E3CF]"
      iconRing="bg-[#A7E3CF]/45"
      whatTitle="Nuestra historia"
      body="Registro grafico y audiovisual de nuestros primeros 30 anos: Galeria de fotos Videos."
      bullets={[]}
      mainImage={{
        src: "/img/circuito4.jpg",
        alt: "Paisaje de montanas y valle en la reserva",
      }}
      lowerSection={{
        title: "Habitando la reserva",
        body: "Actividades que realizamos como comunidad atendiendo a que vivimos en una reserva:",
        lines: ["Jornadas", "Capacitaciones.", "Facilitaciones."],
      }}
    />
  );
}
