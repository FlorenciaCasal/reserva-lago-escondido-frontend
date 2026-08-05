import Link from "next/link";
import type { News } from "@/types/news";

function fmtDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function paragraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function PublicNewsDetail({ news }: { news: News }) {
  return (
    <main className="bg-[#F6F8F5]">
      <article>
        <header className="px-6 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <Link href="/novedades" className="text-xs font-bold uppercase tracking-[0.16em] text-primary hover:text-primary-dark">
              Volver a novedades
            </Link>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {fmtDate(news.publishedAt)}
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
              {news.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-700">
              {news.summary}
            </p>
          </div>
        </header>

        {news.imageUrl && (
          <div className="px-6 sm:px-8">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-lg bg-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={news.imageUrl} alt={news.title} className="aspect-[16/8] w-full object-cover" />
            </div>
          </div>
        )}

        <section className="px-6 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-3xl text-base leading-8 text-neutral-800">
            {paragraphs(news.content).map((paragraph) => (
              <p key={paragraph} className="mb-6">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {news.images && news.images.length > 0 && (
          <section className="px-6 pb-16 sm:px-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Galeria
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {news.images.map((image) => (
                  <figure key={image.id} className="overflow-hidden rounded-lg bg-white shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.imageUrl}
                      alt={image.altText || image.caption || news.title}
                      className="aspect-[16/10] w-full object-cover"
                    />
                    {image.caption && (
                      <figcaption className="p-4 text-sm leading-6 text-neutral-600">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {news.videoUrl && (
          <section className="px-6 pb-20 sm:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Video
              </h2>
              <video controls className="mt-6 aspect-video w-full rounded-lg bg-neutral-950">
                <source src={news.videoUrl} type="video/mp4" />
              </video>
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
