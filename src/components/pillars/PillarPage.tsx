import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { Project } from "@/types/project";

type RelatedActivity = {
  title: string;
  imageUrl: string;
  alt: string;
};

type PillarPageProps = {
  title: string;
  intro: string;
  icon: LucideIcon;
  iconTone: string;
  iconRing: string;
  whatTitle?: string;
  body: string;
  bullets: string[];
  mainImage: {
    src: string;
    alt: string;
    variant?: "portrait" | "landscape";
  };
  relatedProjects?: Project[];
  relatedActivities?: RelatedActivity[];
  lowerSection?: {
    title: string;
    body?: string;
    lines: string[];
  };
};

export default function PillarPage({
  title,
  intro,
  icon: Icon,
  iconTone,
  iconRing,
  whatTitle = "¿Qué hacemos?",
  body,
  bullets,
  mainImage,
  relatedProjects,
  relatedActivities,
  lowerSection,
}: PillarPageProps) {
  const imageClass =
    mainImage.variant === "portrait"
      ? "aspect-[4/5] sm:aspect-[5/6]"
      : "aspect-[4/3]";

  return (
    <main className="bg-[#FAFAF9] text-neutral-900">
      <section className="border-b border-neutral-100 bg-[#F7F7F5]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:px-8 sm:py-20 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
          <div>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-neutral-900 sm:text-[48px]">
              {title}
            </h1>
            <p className="mt-5 max-w-md text-base leading-8 text-neutral-600">
              {intro}
            </p>
          </div>
          <div className="hidden justify-self-end md:block">
            <div className={`flex h-28 w-28 items-center justify-center rounded-full ${iconRing}`}>
              <span className={`flex h-20 w-20 items-center justify-center rounded-full ${iconTone}`}>
                <Icon className="h-10 w-10 text-neutral-800" strokeWidth={1.8} aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:px-8 sm:py-18 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-neutral-900">
            {whatTitle}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-600">
            {body}
          </p>
          {bullets.length > 0 && (
            <ul className="mt-7 space-y-4 text-sm font-semibold text-neutral-700">
              {bullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2FABA3]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="md:justify-self-end">
          <div className={`${imageClass} w-full overflow-hidden rounded-lg bg-neutral-200 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.55)] md:w-[390px]`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mainImage.src} alt={mainImage.alt} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {relatedProjects && (
        <section className="border-t border-neutral-100 bg-[#F5F6F4]">
          <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-16">
            <h2 className="font-serif text-3xl font-semibold text-neutral-900">
              Proyectos relacionados
            </h2>
            {relatedProjects.length === 0 ? (
              <p className="mt-7 rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
                Todavia no hay proyectos publicados para mostrar.
              </p>
            ) : (
              <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProjects.slice(0, 3).map((project) => (
                  <Link key={project.id} href={`/proyectos/${project.slug}`} className="group block">
                    <article>
                      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-neutral-200 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.4)]">
                        {project.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                            Sin imagen principal
                          </div>
                        )}
                      </div>
                      <h3 className="mt-4 inline-flex items-center gap-3 font-serif text-base font-semibold text-neutral-900">
                        {project.title}
                        <span className="text-[#2FABA3]" aria-hidden="true">&rarr;</span>
                      </h3>
                    </article>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/proyectos"
              className="mt-9 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-[#2F9F99]"
            >
              Ver todos los proyectos
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </section>
      )}

      {relatedActivities && (
        <section className="border-t border-neutral-100 bg-[#F5F6F4]">
          <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-16">
            <h2 className="font-serif text-3xl font-semibold text-neutral-900">
              Actividades relacionadas
            </h2>
            <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {relatedActivities.map((activity) => (
                <article key={activity.title}>
                  <div className="aspect-[4/3] overflow-hidden rounded-lg bg-neutral-200 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.4)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activity.imageUrl} alt={activity.alt} className="h-full w-full object-cover" />
                  </div>
                  <h3 className="mt-4 font-serif text-base font-semibold text-neutral-900">
                    {activity.title}
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {lowerSection && (
        <section className="border-t border-neutral-100 bg-[#F5F6F4]">
          <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-20">
            <h2 className="font-serif text-3xl font-semibold text-neutral-900">
              {lowerSection.title}
            </h2>
            {lowerSection.body && (
              <p className="mt-5 max-w-3xl text-sm font-semibold leading-7 text-neutral-800">
                {lowerSection.body}
              </p>
            )}
            <div className="mt-4 space-y-2 text-sm font-semibold leading-6 text-neutral-800">
              {lowerSection.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
