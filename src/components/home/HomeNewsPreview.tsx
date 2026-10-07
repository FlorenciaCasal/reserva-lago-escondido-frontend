import Link from "next/link";
import { listPublicNews, newsDate, newsDisplayDate } from "@/services/news";
import type { HomeContent } from "@/types/home";

function dateParts(value?: string | null) {
  const date = newsDate(value) ?? new Date();
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: new Intl.DateTimeFormat("es-AR", { month: "short" })
      .format(date)
      .replace(".", "")
      .toUpperCase(),
  };
}

export default async function HomeNewsPreview({ content }: { content: HomeContent }) {
  const news = (await listPublicNews()).slice(0, 4);
  const [featuredNews, ...newsItems] = news;

  if (!featuredNews) return null;

  const featuredDate = dateParts(newsDisplayDate(featuredNews));

  return (
    <section className="bg-[#EFF4F2] px-6 py-14 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-900">
            {content.newsTitle}
          </h2>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <Link href={`/novedades/${featuredNews.slug}`} className="group block">
          <article className="transition-[transform,box-shadow] duration-300 ease-out [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-[0_18px_35px_-30px_rgba(15,23,42,0.35)]">
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
              {featuredNews.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredNews.imageUrl}
                  alt={featuredNews.title}
                  className="h-full w-full object-cover transition duration-300 [@media(hover:hover)]:group-hover:scale-[1.03]"
                />
              )}
              <div className="absolute left-4 top-4 flex h-14 w-12 flex-col items-center justify-center rounded-sm bg-primary text-white shadow-lg shadow-black/10">
                <span className="text-lg font-bold leading-none">{featuredDate.day}</span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wide">{featuredDate.month}</span>
              </div>
            </div>
            <div className="pt-5">
              <h3 className="text-lg font-semibold text-neutral-900">
                {featuredNews.title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-700">
                {featuredNews.summary}
              </p>
            </div>
          </article>
          </Link>

          <div className="space-y-5">
            {newsItems.map((item) => {
              const itemDate = dateParts(newsDisplayDate(item));

              return (
                <Link
                  key={item.id}
                  href={`/novedades/${item.slug}`}
                  className="group grid overflow-hidden rounded-sm bg-white shadow-[0_10px_28px_-28px_rgba(15,23,42,0.45)] transition-[transform,box-shadow] duration-300 ease-out [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-[0_18px_35px_-30px_rgba(15,23,42,0.45)] sm:grid-cols-[132px_minmax(0,1fr)]"
                >
                  <div className="relative h-40 overflow-hidden bg-neutral-200 sm:h-full sm:min-h-32">
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-contain transition duration-300 [@media(hover:hover)]:group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col justify-center p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                      Novedad
                      <span className="ml-2 text-neutral-400">
                        {itemDate.day} {itemDate.month}
                      </span>
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-neutral-900 transition-colors [@media(hover:hover)]:group-hover:text-primary-dark">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-700">
                      {item.summary}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="/novedades"
            className="group inline-flex text-xs font-bold uppercase tracking-[0.16em] text-primary transition hover:text-primary-dark"
          >
            {content.newsCtaLabel}
            <span className="ml-2 transition-transform duration-300 [@media(hover:hover)]:group-hover:translate-x-1" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
