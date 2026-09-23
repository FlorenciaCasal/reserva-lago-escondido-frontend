import Link from "next/link";
import { listPublicProjects } from "@/services/projects";
import type { HomeContent } from "@/types/home";

export default async function HomeFeaturedProjects({ content }: { content: HomeContent }) {
  const projects = (await listPublicProjects()).slice(0, 4);

  return (
    <section className="bg-white px-6 py-14 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] ">
              {content.projectsTitle}
            </h2>
          </div>
          <Link
            href="/proyectos"
            className="group inline-flex text-xs font-bold uppercase tracking-[0.16em] text-primary transition hover:text-primary-dark"
          >
            {content.projectsCtaLabel}
            <span className="ml-2 transition-transform duration-300 [@media(hover:hover)]:group-hover:translate-x-1" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <article key={project.id} className="group overflow-hidden rounded-sm bg-white transition-[transform,box-shadow] duration-300 ease-out [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-[0_18px_35px_-28px_rgba(15,23,42,0.45)]">
              <Link href={`/proyectos/${project.slug}`} className="block">
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.imageUrl || "/img/home.jpg"}
                    alt={project.title}
                    className="h-full w-full object-cover transition duration-300 [@media(hover:hover)]:group-hover:scale-[1.03]"
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
                    <span className="ml-2 transition-transform duration-300 [@media(hover:hover)]:group-hover:translate-x-1" aria-hidden="true">
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
