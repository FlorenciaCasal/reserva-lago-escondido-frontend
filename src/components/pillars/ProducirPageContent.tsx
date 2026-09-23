import PillarSectionNav from "./PillarSectionNav";
import type { ReactNode } from "react";
import { Handshake, Leaf, Ruler, Sprout } from "lucide-react";

const whatWeDoBullets = [
  "Huerta agroecológica de Ornamentales y Hortalizas",
  "Producción de frutas finas",
  "Producción Ganadera (Vacuna, Porcina, Camélidos)",
  "Apicultura y producción de miel",
  // "Talleres de oficios y saberes",
  "Producción de energía renovable mediante centrales hidroeléctricas de paso",
  "Aprovechamiento forestal",
];

const principles = [
  {
    title: "Escala",
    text: "Actividades pensadas en relación con las características del territorio.",
    icon: Ruler,
  },
  {
    title: "Comunidad",
    text: "Generación de oportunidades locales y fortalecimiento del tejido social.",
    icon: Handshake,
  },
  {
    title: "Cuidado",
    text: "Uso responsable de los recursos y atención al impacto sobre el entorno.",
    icon: Leaf,
  },
];

const initiatives = [
  {
    title: "Central hidroeléctrica de paso",
    text: "Generación de energía a partir del río mediante un sistema de paso, integrada a las actividades productivas de la Reserva.",
    image: "/img/agua.jpg",
    alt: "Agua y paisaje natural vinculado a energía renovable",
    href: "https://www.patagoniaenergia.com/",
  },
  {
    title: "Huerta y producción agroecológica",
    text: "Huerta, frutas y berries como líneas productivas a revisar, integradas al cuidado del entorno y al consumo local.",
    image: "/img/escuela.jpg",
    alt: "Actividad productiva vinculada a la huerta agroecológica",
  },
  {
    title: "Apicultura y producción de miel",
    text: "Producción de miel y trabajo apícola como actividad histórica a validar dentro del relato productivo de la Reserva.",
    image: "/img/particular.jpg",
    alt: "Productos locales y materiales de producción",
  },
  {
    title: "Aprovechamiento forestal",
    text: "Prácticas de manejo y cuidado orientadas a preservar la salud del bosque, los suelos y los procesos naturales.",
    image: "/img/alerces.jpg",
    alt: "Bosque nativo asociado al manejo forestal y cuidado de suelos",
  },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2F9F99]">
      {children}
    </p>
  );
}

export default function ProducirPageContent() {
  return (
    <main className="bg-[#FAFAF9] text-neutral-900">
      <section className="border-b border-neutral-100 bg-[#F7F7F5]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 sm:px-8 sm:py-12 md:grid-cols-[minmax(0,1fr)_310px] md:items-center">
          <div>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-neutral-900 sm:text-[48px]">
              Producir
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-neutral-600 md:text-base md:leading-8 lg:text-lg">
              Promovemos actividades productivas sustentables que respeten la naturaleza y a las comunidades.
            </p>
          </div>

          <div className="justify-self-start md:justify-self-end">
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FFC247]/25 sm:h-28 sm:w-28">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFC247]">
                  <Sprout className="h-10 w-10 text-neutral-800" strokeWidth={1.8} aria-hidden="true" />
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="h-24 w-px bg-[#2FABA3]/35" aria-hidden="true" />
                <p className="text-[11px] font-bold uppercase leading-5 tracking-[0.18em] text-[#2F9F99] sm:text-xs sm:leading-6">
                  <span className="block">Trabajo,</span>
                  <span className="block">territorio,</span>
                  <span className="block">futuro.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PillarSectionNav
        pageName="Producir"
        items={[
          { number: "01", label: "Qué hacemos", targetId: "que-hacemos" },
          { number: "02", label: "Nuestro enfoque", targetId: "nuestro-enfoque" },
          { number: "03", label: "Iniciativas y actividades", targetId: "iniciativas-actividades" },
        ]}
      />

      <section id="que-hacemos" className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:px-8 sm:py-14 md:grid-cols-[minmax(0,0.92fr)_minmax(320px,1.08fr)] md:items-center">
        <div>
          <h2 className="font-serif text-2xl font-semibold leading-tight text-neutral-900 lg:!text-[24px]">
            ¿Qué hacemos?
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-600 md:text-base md:leading-8 lg:text-lg lg:leading-9">
            Trabajamos en estándares de producción sustentable enfocados en potenciar el consumo de forma local y consciente.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-600 md:text-base md:leading-8 lg:text-lg lg:leading-9">
            Cada actividad es gestionada para minimizar el impacto ambiental y fortalecer el tejido social.
          </p>
          <ul className="mt-7 space-y-4 text-sm font-semibold text-neutral-700 md:text-base">
            {whatWeDoBullets.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#78B82A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:justify-self-end">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-200 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.55)] md:w-[390px] lg:w-[420px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/form.jpeg"
              alt="Trabajo productivo en huerta agroecológica"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section id="nuestro-enfoque" className="border-y border-neutral-100 bg-[#F0F6F3]">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-16">
          <Eyebrow>Nuestro enfoque</Eyebrow>
          <div className="mt-4 grid gap-8 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:items-start">
            <h2 className="font-serif text-2xl font-semibold leading-tight text-neutral-900 lg:!text-[24px]">
              Producir en equilibrio con el territorio
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-neutral-600 md:text-base md:leading-8 lg:text-lg lg:leading-9">
              Creemos en una forma de producir que valora los recursos locales, respeta los ciclos naturales y genera oportunidades para la comunidad. Buscamos desarrollar actividades a escala adecuada, donde la producción y la conservación se fortalezcan mutuamente.
            </p>
          </div>

          <div className="mt-10 grid gap-7 md:grid-cols-3 md:gap-0">
            {principles.map((principle, index) => {
              const PrincipleIcon = principle.icon;
              const borderClass = index < principles.length - 1 ? "md:border-r md:border-[#2FABA3]/20" : "";
              const spacingClass = index === 0 ? "md:pr-8" : index === 1 ? "md:px-8" : "md:pl-8";

              return (
                <div key={principle.title} className={`flex gap-4 ${borderClass} ${spacingClass}`}>
                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2FABA3]/15 text-[#2F9F99]">
                    <PrincipleIcon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-serif text-2xl font-semibold leading-tight text-neutral-900">
                      {principle.title}
                    </p>
                    <p className="mt-3 text-[11px] font-bold uppercase leading-5 tracking-[0.14em] text-neutral-600">
                      {principle.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="iniciativas-actividades" className="mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-16">
        <div className="max-w-3xl">
          <Eyebrow>Producción en la reserva</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight text-neutral-900 lg:!text-[24px]">
            Iniciativas y actividades
          </h2>
          <p className="mt-4 text-sm leading-7 text-neutral-600 md:text-base md:leading-8 lg:text-lg lg:leading-9">
            Algunas de las actividades que desarrollamos en la Reserva, integrando producción, conocimiento y cuidado del entorno.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {initiatives.map((initiative) => (
            <article key={initiative.title} className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.55)]">
              <div className="aspect-[4/3] overflow-hidden bg-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={initiative.image} alt={initiative.alt} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col px-5 py-6">
                <h3 className="font-serif text-lg font-semibold leading-tight text-neutral-900">
                  {initiative.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-neutral-600">
                  {initiative.text}
                </p>
                {/* {initiative.href ? (
                  <a
                    href={initiative.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex w-fit items-center gap-2 pt-5 text-xs font-bold uppercase tracking-wide text-[#2F9F99]"
                  >
                    Conocer más
                    <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <span className="mt-auto inline-flex w-fit items-center gap-2 pt-5 text-xs font-bold uppercase tracking-wide text-[#2F9F99]">
                    Conocer más
                    <span aria-hidden="true">→</span>
                  </span>
                )} */}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
