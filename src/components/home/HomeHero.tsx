import Image from "next/image";
import Link from "next/link";

export default function HomeHero() {
  return (
    <section className="relative isolate min-h-[520px] overflow-hidden bg-neutral-950 text-white sm:min-h-[600px] lg:min-h-[75vh]">
      <Image
        src="/img/home.jpeg"
        alt="Reserva Natural Lago Escondido"
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />

      <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-start px-6 pb-16 pt-32 sm:min-h-[600px] sm:px-8 sm:pt-36 lg:min-h-[75vh] lg:pt-40">
        <div className="max-w-[620px]">
          <h1 className="text-[34px] font-semibold leading-tight text-white [text-shadow:0_3px_18px_rgba(0,0,0,0.55)] sm:text-[44px] lg:text-[50px]">
            Preservar, producir y habitar la naturaleza de manera sustentable
          </h1>
          <p className="mt-6 max-w-[560px] text-base font-medium leading-8 text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.55)] sm:text-lg">
            Somos un espacio protegido en el paraje El Foyel, Rio Negro. Conservamos bosques milenarios y protegemos la fauna a traves de proyectos de investigacion, produccion sustentable y educacion ambiental.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/visitas"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Comenzar la reserva
            </Link>
            <Link
              href="/proyectos"
              className="inline-flex items-center justify-center rounded-full border border-white/70 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-neutral-950"
            >
              Ver proyectos
            </Link>
            <Link
              href="/visitas"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Visitar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
