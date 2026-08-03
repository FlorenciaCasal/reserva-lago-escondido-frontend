import { Leaf, Mountain, Sprout } from "lucide-react";

const pillars = [
  {
    title: "Preservar",
    icon: Leaf,
    tone: "bg-[#EEF6ED]",
    text: "Conservamos la naturaleza a partir de proyectos y monitoreos constantes del ecosistema.",
    items: ["Reserva natural", "Proyectos de conservacion", "Monitoreo", "Cuidado del ambiente"],
  },
  {
    title: "Producir",
    icon: Sprout,
    tone: "bg-[#F6F1E6]",
    text: "Desarrollamos actividades productivas sustentables que conviven con la proteccion del territorio.",
    items: ["Manejo responsable", "Produccion sustentable", "Investigacion", "Buenas practicas"],
  },
  {
    title: "Vivir y disfrutar",
    icon: Mountain,
    tone: "bg-[#EEF3F5]",
    text: "Invitamos a vivir experiencias de bajo impacto para conocer y valorar la reserva.",
    items: ["Visitas guiadas", "Educacion ambiental", "Recreacion responsable", "Cultura de naturaleza"],
  },
];

export default function HomePillars() {
  return (
    <section className="bg-[#FAFAF9] px-6 py-14 sm:px-8 sm:py-18">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-sm font-bold uppercase tracking-[0.18em] text-neutral-800">
          Nuestros 3 pilares
        </h2>

        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <article
                key={pillar.title}
                className={`${pillar.tone} flex min-h-[330px] flex-col items-center rounded-sm px-8 py-9 text-center`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-neutral-800">
                  {pillar.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-neutral-700">
                  {pillar.text}
                </p>
                <ul className="mt-5 space-y-2 text-left text-xs leading-5 text-neutral-700">
                  {pillar.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-auto pt-7 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Conoce mas
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
