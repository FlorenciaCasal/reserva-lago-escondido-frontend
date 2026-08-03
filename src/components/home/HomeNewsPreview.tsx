const featuredNews = {
  date: "14",
  month: "MAY",
  title: "Nueva temporada en la huerta",
  summary:
    "Compartimos avances en la produccion sustentable y las practicas agroecologicas que acompanian la vida cotidiana de la reserva.",
  imageUrl: "/img/escuela.jpg",
};

const newsItems = [
  {
    tag: "Clima",
    title: "Monitoreo de flora con nuevas alarmas",
    summary: "Registros y observaciones para anticipar condiciones ambientales relevantes.",
  },
  {
    tag: "Proyecto",
    title: "Avances en el proyecto Alerces I",
    summary: "Nuevas tareas de seguimiento y restauracion en sectores de bosque nativo.",
  },
  {
    tag: "Reserva",
    title: "Visita educativa",
    summary: "Actividades de educacion ambiental junto a instituciones de la region.",
  },
];

export default function HomeNewsPreview() {
  return (
    <section className="bg-[#EFF4F2] px-6 py-14 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-900">
            Novedades
          </h2>
          <a
            href="#"
            aria-disabled="true"
            className="inline-flex text-xs font-bold uppercase tracking-[0.16em] text-primary transition hover:text-primary-dark"
          >
            Ver todas las novedades
            <span className="ml-2" aria-hidden="true">
              &rarr;
            </span>
          </a>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <article className="group">
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredNews.imageUrl}
                alt={featuredNews.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute left-4 top-4 flex h-14 w-12 flex-col items-center justify-center rounded-sm bg-primary text-white shadow-lg shadow-black/10">
                <span className="text-lg font-bold leading-none">{featuredNews.date}</span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wide">{featuredNews.month}</span>
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

          <div className="space-y-5">
            {newsItems.map((item) => (
              <article key={item.title} className="grid grid-cols-[44px_minmax(0,1fr)] gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
                  <span className="text-xs font-bold uppercase">{item.tag.slice(0, 2)}</span>
                </div>
                <div className="border-b border-neutral-200 pb-5 last:border-b-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                    {item.tag}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-neutral-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">
                    {item.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
