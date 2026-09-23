import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { listPublicNews } from "@/services/news";
import { listPublicProjectsCmsOnly } from "@/services/projects";

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/proyectos", priority: 0.8 },
  { path: "/novedades", priority: 0.8 },
  { path: "/conservar", priority: 0.7 },
  { path: "/producir", priority: 0.7 },
  { path: "/habitar", priority: 0.7 },
  { path: "/visitas", priority: 0.8 },
] as const;

function validSlug(value?: string | null) {
  return Boolean(value?.trim());
}

function lastModified(...values: Array<string | null | undefined>) {
  const value = values.find(Boolean);
  return value ? new Date(value) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, news] = await Promise.all([
    listPublicProjectsCmsOnly(),
    listPublicNews(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: siteUrl(route.path),
    changeFrequency: route.path === "/" ? "weekly" : "monthly",
    priority: route.priority,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects
    .filter((project) => project.status === "PUBLISHED" && validSlug(project.slug))
    .map((project) => ({
      url: siteUrl(`/proyectos/${project.slug}`),
      lastModified: lastModified(project.updatedAt, project.publishedAt, project.createdAt),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const newsEntries: MetadataRoute.Sitemap = news
    .filter((item) => item.status === "PUBLISHED" && validSlug(item.slug))
    .map((item) => ({
      url: siteUrl(`/novedades/${item.slug}`),
      lastModified: lastModified(item.updatedAt, item.publishedAt, item.createdAt),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticEntries, ...projectEntries, ...newsEntries];
}
