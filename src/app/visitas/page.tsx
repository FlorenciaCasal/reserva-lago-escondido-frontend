import type { Metadata } from "next";
import { Suspense } from "react";
import VisitaClient from "../../components/VisitaClient"
import { ogImage, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Visitas | Reserva Natural Lago Escondido",
  description:
    "Reserva tu visita a la Reserva Natural Lago Escondido y conoce el entorno natural de El Foyel con responsabilidad.",
  alternates: {
    canonical: "/visitas",
  },
  openGraph: {
    title: "Visitas | Reserva Natural Lago Escondido",
    description:
      "Reserva tu visita a la Reserva Natural Lago Escondido y conoce el entorno natural de El Foyel con responsabilidad.",
    url: siteUrl("/visitas"),
    images: [ogImage("/img/particular.jpg")],
    type: "website",
  },
};

export default function HomePage() {


  return (
    <Suspense fallback={null}>
      <VisitaClient />
    </Suspense>
  );
}
