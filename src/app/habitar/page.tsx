import type { Metadata } from "next";
import HabitarPageContent from "@/components/pillars/HabitarPageContent";
import { ogImage, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Habitar | Reserva Natural Lago Escondido",
  description:
    "Invitamos a conectar con la naturaleza a traves de experiencias unicas y responsables.",
  alternates: {
    canonical: "/habitar",
  },
  openGraph: {
    title: "Habitar | Reserva Natural Lago Escondido",
    description:
      "Invitamos a conectar con la naturaleza a traves de experiencias unicas y responsables.",
    url: siteUrl("/habitar"),
    images: [ogImage("/img/circuito4.jpg")],
    type: "website",
  },
};

export default function HabitarPage() {
  return <HabitarPageContent />;
}
