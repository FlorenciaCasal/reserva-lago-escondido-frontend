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

export default function PublicNewsListing({ news }: { news: News[] }) {
  return (
    <main className="bg-[#F6F8F5]">
      <section className="px-6 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Reserva Natural Lago Escondido
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-neutral-950 sm:text-5xl">
            Novedades
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-700">
            Noticias, actividades y actualizaciones de conservacion, educacion ambiental y vida cotidiana de la reserva.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <Link key={item.id} href={`/novedades/${item.slug}`} className="group block">
              <article className="h-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-200">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="h-full w-full bg-neutral-200" />
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    {fmtDate(item.publishedAt)}
                  </p>
                  <h2 className="mt-3 text-lg font-semibold text-neutral-950">
                    {item.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-neutral-700">
                    {item.summary}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
