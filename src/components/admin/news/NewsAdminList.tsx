"use client";

import React from "react";
import Link from "next/link";
import { Archive, Eye, Pencil, Plus } from "lucide-react";
import { archiveNews, listAdminNews, publishNews } from "@/services/news";
import type { News, NewsStatus } from "@/types/news";

function statusLabel(status: NewsStatus) {
  if (status === "PUBLISHED") return "Publicado";
  if (status === "ARCHIVED") return "Archivado";
  return "Borrador";
}

function statusClass(status: NewsStatus) {
  if (status === "PUBLISHED") return "border-green-700 bg-green-900/30 text-green-300";
  if (status === "ARCHIVED") return "border-neutral-700 bg-neutral-800 text-neutral-300";
  return "border-yellow-700 bg-yellow-900/30 text-yellow-300";
}

function fmtDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-AR");
}

export default function NewsAdminList() {
  const [news, setNews] = React.useState<News[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<NewsStatus | "ALL">("ALL");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    listAdminNews()
      .then(setNews)
      .catch(() => setError("No se pudieron cargar las novedades."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = news.filter((item) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q);
    const matchesStatus = status === "ALL" || item.status === status;
    return matchesQuery && matchesStatus;
  });

  async function runAction(item: News, action: "publish" | "archive") {
    if (action === "archive" && !window.confirm("Archivar esta novedad? No se mostrara publicamente.")) {
      return;
    }

    setSavingId(item.id);
    setError(null);

    try {
      const updated = action === "publish" ? await publishNews(item.id) : await archiveNews(item.id);
      setNews((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la novedad.");
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
            Novedades
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Gestiona publicaciones, imagen principal, galeria y estado editorial.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/admin/novedades-ia"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Crear novedad
          </Link>
        </div>
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
            onChange={(event) => setStatus(event.target.value as NewsStatus | "ALL")}
          >
            <option value="ALL">Todos los estados</option>
            <option value="PUBLISHED">Publicadas</option>
            <option value="DRAFT">Borradores</option>
            <option value="ARCHIVED">Archivadas</option>
          </select>
        </div>
      </section>

      {error && (
        <div className="fixed left-1/2 top-16 z-50 w-fit max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl border border-red-800 bg-red-950/95 p-4 text-sm text-red-200 shadow-2xl shadow-black/40 backdrop-blur-md sm:top-4 sm:max-w-3xl">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
        {loading ? (
          <p className="p-4 text-sm text-neutral-400">Cargando novedades...</p>
        ) : filtered.length === 0 ? (
          <p className="p-4 text-sm text-neutral-400">No hay novedades para mostrar.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[700px] table-fixed text-left text-sm">
              <thead className="border-b border-neutral-800 bg-neutral-900 text-neutral-400">
                <tr>
                  <th className="w-[44%] px-3 py-3 sm:px-4">Novedad</th>
                  <th className="w-[16%] px-3 py-3 sm:px-4">Estado</th>
                  <th className="w-[14%] px-3 py-3 sm:px-4">Publicado</th>
                  <th className="w-[18%] px-3 py-3 text-right sm:px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const busy = savingId === item.id;
                  return (
                    <tr key={item.id} className="border-b border-neutral-800 last:border-0">
                      <td className="px-3 py-3 sm:px-4">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt={item.title} className="h-12 w-12 shrink-0 rounded-md object-cover" />
                          ) : (
                            <div className="h-12 w-12 shrink-0 rounded-md bg-neutral-800" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-neutral-100">{item.title}</p>
                            <p className="max-h-9 overflow-hidden text-xs leading-[18px] text-neutral-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{item.summary}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <span className={`rounded-full border px-2 py-1 text-xs ${statusClass(item.status)}`}>
                          {statusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-neutral-300 sm:px-4">{fmtDate(item.publishedAt)}</td>
                      <td className="px-3 py-3 sm:px-4">
                        <div className="flex justify-end gap-1.5 sm:gap-2">
                          <Link
                            href={`/admin/novedades/${item.id}/editar`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                            aria-label="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                          <button
                            disabled={busy || item.status === "PUBLISHED"}
                            onClick={() => runAction(item, "publish")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
                            aria-label="Publicar"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            disabled={busy || item.status === "ARCHIVED"}
                            onClick={() => runAction(item, "archive")}
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
