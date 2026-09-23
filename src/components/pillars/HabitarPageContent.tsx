import PillarSectionNav from "./PillarSectionNav";
import { BookOpen, Leaf, Mountain, Users } from "lucide-react";
import HabitarHistoryCarousel from "./HabitarHistoryCarousel";

const historyParagraphs = [
  "La Reserva Natural Lago Escondido nació del compromiso de conservar un territorio único y de la convicción de que es posible convivir con la naturaleza en equilibrio.",
  "A lo largo de estas tres décadas, hemos construido una historia junto a personas que creen en este lugar: familias, trabajadores, investigadores, visitantes y una comunidad que comparte el respeto por el entorno natural.",
  "Hoy seguimos habitando la reserva con la misma vocación de cuidado, aprendiendo del territorio y proyectando un futuro donde la conservación y la vida en comunidad se fortalezcan mutuamente.",
];

const activities = [
  {
    title: "Jornadas",
    text: "Encuentros de trabajo y participación comunitaria para compartir experiencias, planificar acciones y fortalecer el vínculo con la reserva.",
    image: "/img/escuela.jpg",
    alt: "Grupo participando de una jornada en la reserva",
    icon: Users,
  },
  {
    title: "Capacitaciones",
    text: "Espacios de formación para seguir aprendiendo sobre el territorio, sus ecosistemas y las buenas prácticas para su cuidado.",
    image: "/img/alerces2.jpg",
    alt: "Ave y vegetación nativa como referencia de capacitación ambiental",
    icon: BookOpen,
  },
  {
    title: "Facilitaciones",
    text: "Acompañamos procesos, brindamos herramientas y generamos espacios de diálogo para una convivencia sostenible.",
    image: "/img/agua.jpg",
    alt: "Paisaje de lago y montañas de la reserva",
    icon: Leaf,
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2F9F99]">
      {children}
    </p>
  );
}

export default function HabitarPageContent() {
  return (
    <main className="bg-[#FAFAF9] text-neutral-900">
      <section className="border-b border-neutral-100 bg-[#F7F7F5]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 sm:px-8 sm:py-12 md:grid-cols-[minmax(0,1fr)_310px] md:items-center">
          <div>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-neutral-900 sm:text-[48px]">
              Habitar
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-neutral-600 md:text-base md:leading-8 lg:text-lg">
              Invitamos a conectar con la naturaleza a través de experiencias únicas y responsables.
            </p>
          </div>

          <div className="justify-self-start md:justify-self-end">
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#A7E3CF]/45 sm:h-28 sm:w-28">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#A7E3CF]">
                  <Mountain className="h-10 w-10 text-neutral-800" strokeWidth={1.8} aria-hidden="true" />
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="h-24 w-px bg-[#2FABA3]/35" aria-hidden="true" />
                <p className="text-[11px] font-bold uppercase leading-5 tracking-[0.18em] text-[#2F9F99] sm:text-xs sm:leading-6">
                  <span className="block">Personas,</span>
                  <span className="block">territorio,</span>
                  <span className="block">comunidad.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PillarSectionNav
        pageName="Habitar"
        items={[
          { number: "01", label: "Nuestra historia", targetId: "nuestra-historia" },
          { number: "02", label: "Habitando la Reserva", targetId: "habitando-la-reserva" },
        ]}
      />

      <section id="nuestra-historia">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-14 pb-10 sm:px-8 sm:pt-16 sm:pb-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)] lg:items-center">
          <div>
            <Eyebrow>Nuestra historia</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight text-neutral-900 lg:!text-[24px]">
              30 años habitando la Reserva
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-neutral-600 md:text-base md:leading-8 lg:text-lg lg:leading-9">
              {historyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <HabitarHistoryCarousel />
        </div>
      </section>

      <section id="habitando-la-reserva" className="mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-16">
        <div className="max-w-4xl">
          <Eyebrow>Habitando la reserva</Eyebrow>
          <h2 className="mt-3 max-w-4xl font-serif text-2xl font-semibold leading-tight text-neutral-900 lg:!text-[24px]">
            Habitar la Reserva en comunidad
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600 md:text-base md:leading-8 lg:text-lg lg:leading-9">
            El habitar la reserva implica cuidados, compromiso y participación. 
            </p>
            <p className="max-w-3xl text-sm leading-7 text-neutral-600 md:text-base md:leading-8 lg:text-lg lg:leading-9">
            A través de jornadas, capacitaciones y facilitaciones, fortalecemos la vida en comunidad y promovemos una convivencia respetuosa con el ambiente.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {activities.map((activity) => {
            const ActivityIcon = activity.icon;

            return (
              <article key={activity.title} className="overflow-hidden rounded-lg bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.55)]">
                <div className="relative aspect-[16/9] overflow-hidden bg-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activity.image} alt={activity.alt} className="h-full w-full object-cover" />
                  <span className="absolute -bottom-7 left-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#D8F1E8] text-neutral-800 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.5)]">
                    <ActivityIcon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </div>
                <div className="flex min-h-[230px] flex-col px-6 pb-6 pt-11">
                  <h3 className="font-serif text-xl font-semibold leading-tight text-neutral-900">
                    {activity.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-neutral-600">
                    {activity.text}
                  </p>
                  {/* <button
                    type="button"
                    className="mt-auto inline-flex w-fit items-center gap-2 pt-5 text-xs font-bold uppercase tracking-wide text-[#2F9F99]"
                  >
                    Ver más
                    <span aria-hidden="true">&rarr;</span>
                  </button> */}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
