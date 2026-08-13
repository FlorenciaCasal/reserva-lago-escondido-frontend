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

function dateBadge(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat("es-AR", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("es-AR", { month: "short" }).format(date).replace(".", ""),
    year: new Intl.DateTimeFormat("es-AR", { year: "numeric" }).format(date),
  };
}

export default function PublicNewsListing({ news }: { news: News[] }) {
  return (
    <main className="bg-[#F5F6F4] text-neutral-900">
      <section className="relative isolate overflow-hidden bg-neutral-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/home.jpeg"
          alt="Paisaje de la Reserva Natural Lago Escondido"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/52 to-black/22" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl text-white">
            <h1 className="font-serif text-4xl font-semibold leading-tight [text-shadow:0_3px_14px_rgba(0,0,0,0.55)] sm:text-[48px]">
              Novedades
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/90 [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">
              Enterate de las ultimas noticias y actividades de la reserva. Un espacio dedicado a compartir nuestros logros y desafios diarios.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-9 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-6xl space-y-4">
          {news.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
              Todavia no hay novedades publicadas.
            </div>
          ) : (
            news.map((item) => {
              const badge = dateBadge(item.publishedAt);

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_10px_28px_-26px_rgba(15,23,42,0.4)] transition hover:shadow-[0_16px_36px_-28px_rgba(15,23,42,0.48)]"
                >
                  <Link href={`/novedades/${item.slug}`} className="group grid md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)]">
                    <div className="relative min-h-56 overflow-hidden bg-neutral-200 md:min-h-0">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full min-h-56 w-full items-center justify-center bg-neutral-200 px-6 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500 md:min-h-full">
                          Sin imagen principal
                        </div>
                      )}
                      {badge && (
                        <div className="absolute left-4 top-4 flex h-16 w-14 flex-col items-center justify-center rounded-sm bg-[#2FABA3] text-white shadow-lg">
                          <span className="text-lg font-bold leading-none">{badge.day}</span>
                          <span className="mt-1 text-[10px] font-semibold uppercase leading-none">{badge.month}</span>
                          <span className="mt-1 text-[10px] leading-none text-white/85">{badge.year}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex min-h-56 flex-col justify-center px-6 py-6 sm:px-8 lg:px-10">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 md:hidden">
                        {fmtDate(item.publishedAt)}
                      </p>
                      <h2 className="font-serif text-xl font-semibold leading-snug text-neutral-900 sm:text-2xl">
                        {item.title}
                      </h2>
                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-neutral-600">
                        {item.summary}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#2F9F99]">
                        Leer mas
                        <span aria-hidden="true">&rarr;</span>
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })
          )}
                </div>
      </section>
    </main>
  );
}
