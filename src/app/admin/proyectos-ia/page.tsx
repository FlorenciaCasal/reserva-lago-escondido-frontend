import ProjectAiForm from "@/components/admin/projects-ai/ProjectAiForm";
import { getAuthInfo } from "@/lib/auth";
import Link from "next/link";

export const metadata = {
  title: "Proyectos con IA",
};

export default async function ProyectosIaPage() {
  const { isAdmin, isAdminLimit } = await getAuthInfo();
  const canAccess = isAdmin || isAdminLimit;

  if (!canAccess) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
          <h1 className="text-xl font-semibold text-white">Acceso restringido</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Esta seccion esta disponible solo para usuarios administradores.
          </p>
          <Link
            href="/admin"
            className="mt-4 inline-flex rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-100 transition hover:bg-neutral-800"
          >
            Volver al panel
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-2 py-4 sm:px-4">
      <header className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
          Administracion
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          Proyectos con IA
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
          Generacion de borradores para proyectos de conservacion, revision manual y guardado en el backend.
        </p>
      </header>

      <ProjectAiForm />
    </div>
  );
}
