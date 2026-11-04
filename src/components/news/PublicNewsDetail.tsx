import Link from "next/link";
import PublicMediaCarousel from "@/components/media/PublicMediaCarousel";
import RevealOnView from "@/components/ui/RevealOnView";
import { newsDate, newsDisplayDate } from "@/services/news";
import type { MediaGalleryItem } from "@/types/project";
import type { News } from "@/types/news";

function dateBadge(value?: string | null) {
  const date = newsDate(value);
  if (!date) return null;
  return {
    day: new Intl.DateTimeFormat("es-AR", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("es-AR", { month: "short" }).format(date).replace(".", ""),
    year: new Intl.DateTimeFormat("es-AR", { year: "numeric" }).format(date),
  };
}

function paragraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function newsMediaItems(news: News): MediaGalleryItem[] {
  if (news.gallery && news.gallery.length > 0) return news.gallery;

  const legacy: MediaGalleryItem[] = [];
  if (news.videoUrl) {
    legacy.push({
      id: `${news.id}-legacy-video`,
      ownerId: news.id,
      kind: "VIDEO",
      sourceType: "MEDIA_ASSET",
      mediaAssetId: news.videoAssetId ?? null,
      url: news.videoUrl,
      caption: null,
      altText: null,
      sortOrder: 0,
    });
  }
  for (const image of news.images ?? []) {
    legacy.push({
      id: image.id,
      ownerId: news.id,
      kind: "IMAGE",
      sourceType: "MEDIA_ASSET",
      mediaAssetId: image.mediaAssetId ?? null,
      url: image.imageUrl,
      caption: image.caption ?? null,
      altText: image.altText ?? null,
      sortOrder: (image.sortOrder ?? 0) + 1,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    });
  }
  return legacy;
}

export default function PublicNewsDetail({ news }: { news: News }) {
  const badge = dateBadge(newsDisplayDate(news));
  const gallery = newsMediaItems(news);

  return (
    <main className="bg-[#FAFAF9] text-neutral-900">
      <article className="mx-auto max-w-6xl px-6 py-10 sm:px-8 sm:py-14">
        <nav className="text-xs font-semibold text-neutral-600">
          <Link href="/novedades" className="hover:text-neutral-900">
            Novedades
          </Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-neutral-700">{news.title}</span>
        </nav>

        <RevealOnView className="[&:not(.opacity-100)]:translate-y-4" delay={100}>
          <header className="mt-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {badge && (
                <div className="flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center rounded-sm bg-[#2FABA3] text-white shadow-[0_12px_26px_-18px_rgba(47,171,163,0.9)]">
                  <span className="text-xl font-bold leading-none">{badge.day}</span>
                  <span className="mt-1 text-[10px] font-semibold uppercase leading-none">{badge.month}</span>
                  <span className="mt-1 text-[10px] leading-none text-white/85">{badge.year}</span>
                </div>
              )}

              <div>
                <h1 className="font-serif text-4xl font-semibold leading-tight text-neutral-950 sm:text-[44px]">
                  {news.title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
                  {news.summary}
                </p>
              </div>
            </div>
          </header>

          {news.imageUrl && (
            <div className="mt-9 overflow-hidden rounded-lg bg-neutral-200 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={news.imageUrl} alt={news.title} className="aspect-[16/9] w-full object-cover sm:aspect-[16/7]" />
            </div>
          )}
        </RevealOnView>

        <RevealOnView className="mt-8 max-w-3xl [&:not(.opacity-100)]:translate-y-4" delay={120}>
        <section>
          <div className="space-y-6 text-sm leading-7 text-neutral-800 md:text-base md:leading-8 lg:text-lg lg:leading-9">
            {paragraphs(news.content).map((paragraph, index) => (
              <p
                key={paragraph}
                className={index === 0 ? "text-lg leading-8 text-neutral-800 sm:text-[19px] sm:leading-9" : ""}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
        </RevealOnView>

        {gallery.length > 0 && (
          <RevealOnView className="mt-14 [&:not(.opacity-100)]:translate-y-4" delay={120}>
            <section>
              <PublicMediaCarousel items={gallery} imageAltFallback={news.title} />
            </section>
          </RevealOnView>
        )}

        <div className="mt-12">
          <Link
            href="/novedades"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#2F9F99] transition hover:text-neutral-900"
          >
            <span aria-hidden="true">&larr;</span>
            Volver a Novedades
          </Link>
        </div>
      </article>
    </main>
  );
}
