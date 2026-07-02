import Link from "next/link";
import { listPublicProjects } from "@/services/projects";

export default async function ProjectsGrid() {
    const projects = await listPublicProjects();

    return (
        <section id="proyectos" className="py-10 px-6 bg-primary scroll-mt-24">
            <h3 className="text-center text-white text-lg font-semibold mb-4">
                PROYECTOS DE CONSERVACION
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {projects.map((project) => (
                    <Link
                        key={project.title}
                        href={`/proyectos/${project.slug}`}
                        className="rounded-2xl border-2 border-primary p-2 flex flex-col items-center bg-white"
                    >
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={project.imageUrl || "/img/home.jpeg"}
                                alt={project.title}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <p className="mt-4 text-primary font-semibold text-sm tracking-wide">
                            {project.title}
                        </p>
                        {project.summary && (
                            <p className="mt-2 px-2 pb-2 text-center text-xs leading-5 text-primary/80">
                                {project.summary}
                            </p>
                        )}
                    </Link>
                ))}
            </div>
        </section>
    );
}
