"use client";

import React from "react";
import Link from "next/link";
import {
  Archive,
  Eye,
  EyeOff,
  Pencil,
  Sparkles,
  Star,
  StarOff,
} from "lucide-react";
import {
  archiveProject,
  featureProject,
  listAdminProjects,
  publishProject,
  unfeatureProject,
  unpublishProject,
} from "@/services/projects";
import type { Project, ProjectStatus } from "@/types/project";

function statusLabel(status: ProjectStatus) {
  if (status === "PUBLISHED") return "Publicado";
  if (status === "ARCHIVED") return "Archivado";
  return "Borrador";
}

function statusClass(status: ProjectStatus) {
  if (status === "PUBLISHED") return "border-green-700 bg-green-900/30 text-green-300";
  if (status === "ARCHIVED") return "border-neutral-700 bg-neutral-800 text-neutral-300";
  return "border-yellow-700 bg-yellow-900/30 text-yellow-300";
}

function fmtDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-AR");
}

export default function ProjectAdminList() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<ProjectStatus | "ALL">("ALL");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    listAdminProjects()
      .then(setProjects)
      .catch(() => setError("No se pudieron cargar los proyectos."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((project) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      project.title.toLowerCase().includes(q) ||
      project.summary.toLowerCase().includes(q) ||
      project.slug.toLowerCase().includes(q);
    const matchesStatus = status === "ALL" || project.status === status;
    return matchesQuery && matchesStatus;
  });

  async function runAction(project: Project, action: "publish" | "unpublish" | "feature" | "unfeature" | "archive") {
    if (action === "archive" && !window.confirm("Archivar este proyecto? No se mostrara publicamente.")) {
      return;
    }

    setSavingId(project.id);
    setError(null);

    try {
      const updated =
        action === "publish"
          ? await publishProject(project.id)
          : action === "unpublish"
            ? await unpublishProject(project.id)
            : action === "feature"
              ? await featureProject(project.id)
              : action === "unfeature"
                ? await unfeatureProject(project.id)
                : await archiveProject(project.id);

      setProjects((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el proyecto.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-2 py-4 sm:px-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
            Administracion
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            Proyectos
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Gestiona estado, destacado y contenido de proyectos de conservacion.
          </p>
        </div>
        <Link
          href="/admin/proyectos-ia"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Crear proyecto con IA
        </Link>
      </header>

      <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <input
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
            placeholder="Buscar por titulo, resumen o slug..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-primary"
            value={status}
            onChange={(event) => setStatus(event.target.value as ProjectStatus | "ALL")}
          >
            <option value="ALL">Todos los estados</option>
            <option value="PUBLISHED">Publicados</option>
            <option value="DRAFT">Borradores</option>
            <option value="ARCHIVED">Archivados</option>
          </select>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
        {loading ? (
          <p className="p-4 text-sm text-neutral-400">Cargando proyectos...</p>
        ) : filtered.length === 0 ? (
          <p className="p-4 text-sm text-neutral-400">No hay proyectos para mostrar.</p>
        ) : (
          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-neutral-800 bg-neutral-900 text-neutral-400">
                <tr>
                  <th className="w-[42%] px-4 py-3">Proyecto</th>
                  <th className="w-[15%] px-4 py-3">Estado</th>
                  <th className="w-[12%] px-4 py-3">Destacado</th>
                  <th className="w-[13%] px-4 py-3">Publicado</th>
                  <th className="w-[18%] px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => {
                  const busy = savingId === project.id;
                  return (
                    <tr key={project.id} className="border-b border-neutral-800 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {project.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={project.imageUrl}
                              alt={project.title}
                              className="h-12 w-12 shrink-0 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 shrink-0 rounded-md bg-neutral-800" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-neutral-100">{project.title}</p>
                            <p className="max-h-9 overflow-hidden text-xs leading-[18px] text-neutral-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{project.summary}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2 py-1 text-xs ${statusClass(project.status)}`}>
                          {statusLabel(project.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {project.featured ? "Si" : "No"}
                      </td>
                      <td className="px-4 py-3 text-neutral-300">{fmtDate(project.publishedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/proyectos/${project.id}/editar`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                            aria-label="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                          <button
                            disabled={busy || project.status === "ARCHIVED"}
                            onClick={() => runAction(project, project.status === "PUBLISHED" ? "unpublish" : "publish")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
                            aria-label={project.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
                          >
                            {project.status === "PUBLISHED" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            disabled={busy || project.status === "ARCHIVED"}
                            onClick={() => runAction(project, project.featured ? "unfeature" : "feature")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
                            aria-label={project.featured ? "Quitar destacado" : "Destacar"}
                          >
                            {project.featured ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            disabled={busy || project.status === "ARCHIVED"}
                            onClick={() => runAction(project, "archive")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/70 text-red-200 hover:bg-red-950/50 disabled:opacity-40"
                            aria-label="Archivar"
                          >
                            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
