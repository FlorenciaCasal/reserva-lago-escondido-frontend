import ProjectAdminList from "@/components/admin/projects/ProjectAdminList";
import { getAuthInfo } from "@/lib/auth";
import Link from "next/link";

export const metadata = {
  title: "Proyectos | Admin",
};

export default async function AdminProjectsPage() {
  const { isAdmin, isAdminLimit } = await getAuthInfo();

  if (!isAdmin && !isAdminLimit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
          <h1 className="text-xl font-semibold text-white">Acceso restringido</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Esta seccion esta disponible solo para usuarios administradores.
          </p>
          <Link href="/admin" className="mt-4 inline-flex rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-100">
            Volver al panel
          </Link>
        </section>
      </div>
    );
  }

  return <ProjectAdminList />;
}
