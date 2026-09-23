import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StructuredData from "@/components/seo/StructuredData";
import PublicNewsDetail from "@/components/news/PublicNewsDetail";
import { getPublicNewsBySlug } from "@/services/news";
import { newsArticleJsonLd, ogImage, siteUrl } from "@/lib/seo";

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

  const canonical = `/novedades/${news.slug}`;

  return {
    title: `${news.title} | Reserva Natural Lago Escondido`,
    description: news.summary,
    alternates: {
      canonical,
    },
    openGraph: {
      title: news.title,
      description: news.summary,
      url: siteUrl(canonical),
      images: [ogImage(news.imageUrl)],
      type: "article",
      publishedTime: news.publishedAt ?? undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const news = await getPublicNewsBySlug(slug);

  if (!news) notFound();

  return (
    <>
      <StructuredData data={newsArticleJsonLd(news)} />
      <PublicNewsDetail news={news} />
    </>
  );
}
