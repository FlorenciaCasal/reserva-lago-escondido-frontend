import Link from "next/link";
import { listPublicProjects } from "@/services/projects";

export default async function HomeFeaturedProjects() {
  const projects = (await listPublicProjects()).slice(0, 4);

  return (
    <section className="bg-white px-6 py-14 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] ">
              Proyectos destacados
            </h2>
            {/* <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
              Conservacion en accion
            </h2> */}
          </div>
          <Link
            href="/proyectos"
            className="inline-flex text-xs font-bold uppercase tracking-[0.16em] text-primary transition hover:text-primary-dark"
          >
            Ver todos los proyectos
            <span className="ml-2" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <article key={project.id} className="group overflow-hidden rounded-sm bg-white">
              <Link href={`/proyectos/${project.slug}`} className="block">
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.imageUrl || "/img/home.jpeg"}
                    alt={project.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="pt-5">
                  <h3 className="line-clamp-2 text-base font-semibold text-neutral-900">
                    {project.title}
                  </h3>
                  {project.summary && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-700">
                      {project.summary}
                    </p>
                  )}
                  <span className="mt-4 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-primary transition group-hover:text-primary-dark">
                    Ver proyecto
                    <span className="ml-2" aria-hidden="true">
                      &rarr;
                    </span>
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
