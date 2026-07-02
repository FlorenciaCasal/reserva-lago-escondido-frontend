import Link from "next/link";
import type { Project } from "@/types/project";

export default function PublicProjectsListing({ projects }: { projects: Project[] }) {
  return (
    <main className="bg-[#FAFAF9] text-neutral-900">
      <section className="relative isolate overflow-hidden bg-neutral-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/home.jpeg"
          alt="Paisaje de la reserva"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/76 via-black/48 to-black/18" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl text-white">
            <h1 className="font-serif text-4xl font-semibold leading-tight [text-shadow:0_3px_14px_rgba(0,0,0,0.55)] sm:text-[44px]">
              Proyectos
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/90 [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">
              Conoce los proyectos que impulsamos para preservar, investigar y regenerar la naturaleza.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-14">
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="overflow-hidden rounded-[12px] border border-neutral-200 bg-white shadow-[0_14px_34px_-30px_rgba(15,23,42,0.34)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-32px_rgba(15,23,42,0.42)]"
            >
              <Link href={`/proyectos/${project.slug}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                  {project.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-6 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                      Sin imagen principal
                    </div>
                  )}
                  {project.featured && (
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#5D8259]">
                      Destacado
                    </span>
                  )}
                </div>

                <div className="space-y-4 px-6 py-6">
                  <h2 className="font-serif text-2xl font-semibold text-neutral-900">
                    {project.title}
                  </h2>
                  <p className="min-h-20 text-base leading-8 text-neutral-700">
                    {project.summary}
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#2F9F99]">
                    Ver proyecto
                    <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
