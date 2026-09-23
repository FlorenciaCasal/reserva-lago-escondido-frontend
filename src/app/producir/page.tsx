import type { Metadata } from "next";
import ProducirPageContent from "@/components/pillars/ProducirPageContent";
import { ogImage, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Producir | Reserva Natural Lago Escondido",
  description:
    "Promovemos actividades productivas sustentables que respeten la naturaleza y a las comunidades.",
  alternates: {
    canonical: "/producir",
  },
  openGraph: {
    title: "Producir | Reserva Natural Lago Escondido",
    description:
      "Promovemos actividades productivas sustentables que respeten la naturaleza y a las comunidades.",
    url: siteUrl("/producir"),
    images: [ogImage("/img/form.jpeg")],
    type: "website",
  },
};

export default function ProducirPage() {
  return <ProducirPageContent />;
}
