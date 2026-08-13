import Link from "next/link";
import type { News } from "@/types/news";

function dateBadge(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
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

export default function PublicNewsDetail({ news }: { news: News }) {
  const badge = dateBadge(news.publishedAt);
  const gallery = news.images ?? [];

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

        <section className="mt-8 max-w-3xl">
          <div className="space-y-6 text-base leading-8 text-neutral-800 sm:text-[17px] sm:leading-9">
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

        {news.videoUrl && (
          <section className="mt-10 max-w-4xl">
            <video controls className="aspect-video w-full rounded-lg bg-neutral-950 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45)]">
              <source src={news.videoUrl} type="video/mp4" />
            </video>
          </section>
        )}

        {gallery.length > 0 && (
          <section className="mt-14">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 sm:grid sm:overflow-visible sm:pb-0 sm:grid-cols-3 sm:gap-5">
              {gallery.map((image) => (
                <figure key={image.id} className="w-full shrink-0 snap-center overflow-hidden rounded-lg bg-white shadow-[0_14px_34px_-30px_rgba(15,23,42,0.35)] sm:w-auto sm:shrink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.imageUrl}
                    alt={image.altText || image.caption || news.title}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  {image.caption && (
                    <figcaption className="p-3 text-sm leading-6 text-neutral-600">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
            <div className="mt-2 flex justify-center gap-2 sm:hidden" aria-hidden="true">
              {gallery.map((image) => (
                <span key={image.id} className="h-1.5 w-1.5 rounded-full bg-[#2FABA3]/70" />
              ))}
            </div>
          </section>
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
