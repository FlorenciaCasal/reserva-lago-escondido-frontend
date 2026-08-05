import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicNewsDetail from "@/components/news/PublicNewsDetail";
import { getPublicNewsBySlug } from "@/services/news";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await getPublicNewsBySlug(slug);

  if (!news) {
    return {
      title: "Novedad no encontrada | Reserva Natural Lago Escondido",
    };
  }

  return {
    title: `${news.title} | Reserva Natural Lago Escondido`,
    description: news.summary,
    openGraph: {
      title: news.title,
      description: news.summary,
      images: news.imageUrl ? [{ url: news.imageUrl }] : undefined,
      type: "article",
      publishedTime: news.publishedAt ?? undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const news = await getPublicNewsBySlug(slug);

  if (!news) notFound();

  return <PublicNewsDetail news={news} />;
}
