import ProjectEditForm from "@/components/admin/projects/ProjectEditForm";
import { getAuthInfo } from "@/lib/auth";
import Link from "next/link";

export const metadata = {
  title: "Editar proyecto | Admin",
};

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isAdmin, isAdminLimit } = await getAuthInfo();
  const { id } = await params;

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

  return <ProjectEditForm projectId={id} />;
}
