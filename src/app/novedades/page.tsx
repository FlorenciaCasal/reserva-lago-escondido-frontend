import type { Metadata } from "next";
import PublicNewsListing from "@/components/news/PublicNewsListing";
import { listPublicNews } from "@/services/news";
import { ogImage, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Novedades | Reserva Natural Lago Escondido",
  description: "Noticias, actividades y actualizaciones de la Reserva Natural Lago Escondido.",
  alternates: {
    canonical: "/novedades",
  },
  openGraph: {
    title: "Novedades | Reserva Natural Lago Escondido",
    description: "Noticias, actividades y actualizaciones de la Reserva Natural Lago Escondido.",
    url: siteUrl("/novedades"),
    images: [ogImage()],
    type: "website",
  },
};

export default async function NewsPage() {
  const news = await listPublicNews();
  return <PublicNewsListing news={news} />;
}
