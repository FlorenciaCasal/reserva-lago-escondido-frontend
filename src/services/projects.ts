import type {
  CreateProjectInput,
  GenerateProjectAdvanceInput,
  GenerateProjectInput,
  GeneratedProjectAdvanceDraft,
  GeneratedProjectDraft,
  MediaAsset,
  ProjectAdvance,
  ProjectAdvanceInput,
  Project,
  ProjectDocument,
  ProjectDocumentInput,
  ProjectImage,
  ProjectImageInput,
  UpdateProjectInput,
} from "@/types/project";
import { fallbackProjects } from "@/data/projectsFallback";

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : typeof data?.message === "string"
          ? data.message
          : `Error ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export async function listAdminProjects(): Promise<Project[]> {
  const res = await fetch("/api/admin/projects", { cache: "no-store" });
  return parseJson<Project[]>(res);
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function projectTime(value?: string | null) {
  return value ? new Date(value).getTime() : 0;
}

function sortPublicProjects(projects: Project[]) {
  return projects
    .filter((project) => project.status === "PUBLISHED")
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;

      const publishedDiff = projectTime(b.publishedAt) - projectTime(a.publishedAt);
      if (publishedDiff !== 0) return publishedDiff;

      return projectTime(b.createdAt) - projectTime(a.createdAt);
    });
}


export async function uploadProjectImage(file: File): Promise<MediaAsset> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/media/images", {
    method: "POST",
    body: formData,
  });

  return parseJson<MediaAsset>(res);
}

export async function uploadProjectDocument(file: File): Promise<MediaAsset> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/media/documents", {
    method: "POST",
    body: formData,
  });

  return parseJson<MediaAsset>(res);
}
export async function uploadProjectVideo(file: File): Promise<MediaAsset> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/media/videos", {
    method: "POST",
    body: formData,
  });

  return parseJson<MediaAsset>(res);
}
export async function generateProjectDraft(
  input: GenerateProjectInput
): Promise<GeneratedProjectDraft> {
  const res = await fetch("/api/admin/projects/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<GeneratedProjectDraft>(res);
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const res = await fetch("/api/admin/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<Project>(res);
}

export async function getAdminProject(id: string): Promise<Project> {
  const res = await fetch(`/api/admin/projects/${id}`, { cache: "no-store" });
  return parseJson<Project>(res);
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const res = await fetch(`/api/admin/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<Project>(res);
}

async function projectAction(id: string, action: string): Promise<Project> {
  const res = await fetch(`/api/admin/projects/${id}/${action}`, {
    method: "POST",
  });

  return parseJson<Project>(res);
}

export function publishProject(id: string) {
  return projectAction(id, "publish");
}

export function unpublishProject(id: string) {
  return projectAction(id, "unpublish");
}

export function featureProject(id: string) {
  return projectAction(id, "feature");
}

export function unfeatureProject(id: string) {
  return projectAction(id, "unfeature");
}

export function archiveProject(id: string) {
  return projectAction(id, "archive");
}

export async function listAdminProjectAdvances(projectId: string): Promise<ProjectAdvance[]> {
  const res = await fetch(`/api/admin/projects/${projectId}/advances`, { cache: "no-store" });
  return parseJson<ProjectAdvance[]>(res);
}

export async function generateProjectAdvanceDraft(
  projectId: string,
  input: GenerateProjectAdvanceInput
): Promise<GeneratedProjectAdvanceDraft> {
  const res = await fetch(`/api/admin/projects/${projectId}/advances/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<GeneratedProjectAdvanceDraft>(res);
}

export async function createProjectAdvance(
  projectId: string,
  input: ProjectAdvanceInput
): Promise<ProjectAdvance> {
  const res = await fetch(`/api/admin/projects/${projectId}/advances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<ProjectAdvance>(res);
}

export async function updateProjectAdvance(
  projectId: string,
  advanceId: string,
  input: ProjectAdvanceInput
): Promise<ProjectAdvance> {
  const res = await fetch(`/api/admin/projects/${projectId}/advances/${advanceId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<ProjectAdvance>(res);
}

export async function deleteProjectAdvance(projectId: string, advanceId: string): Promise<void> {
  const res = await fetch(`/api/admin/projects/${projectId}/advances/${advanceId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message =
      typeof data?.error === "string"
        ? data.error
        : typeof data?.message === "string"
          ? data.message
          : `Error ${res.status}`;
    throw new Error(message);
  }
}

export async function listAdminProjectImages(projectId: string): Promise<ProjectImage[]> {
  const res = await fetch(`/api/admin/projects/${projectId}/images`, { cache: "no-store" });
  return parseJson<ProjectImage[]>(res);
}

export async function createProjectImage(
  projectId: string,
  input: ProjectImageInput
): Promise<ProjectImage> {
  const res = await fetch(`/api/admin/projects/${projectId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<ProjectImage>(res);
}

export async function updateProjectImage(
  projectId: string,
  imageId: string,
  input: ProjectImageInput
): Promise<ProjectImage> {
  const res = await fetch(`/api/admin/projects/${projectId}/images/${imageId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<ProjectImage>(res);
}

export async function deleteProjectImage(projectId: string, imageId: string): Promise<void> {
  const res = await fetch(`/api/admin/projects/${projectId}/images/${imageId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message =
      typeof data?.error === "string"
        ? data.error
        : typeof data?.message === "string"
          ? data.message
          : `Error ${res.status}`;
    throw new Error(message);
  }
}

export async function listAdminProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
  const res = await fetch(`/api/admin/projects/${projectId}/documents`, { cache: "no-store" });
  return parseJson<ProjectDocument[]>(res);
}

export async function createProjectDocument(
  projectId: string,
  input: ProjectDocumentInput
): Promise<ProjectDocument> {
  const res = await fetch(`/api/admin/projects/${projectId}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<ProjectDocument>(res);
}

export async function updateProjectDocument(
  projectId: string,
  documentId: string,
  input: ProjectDocumentInput
): Promise<ProjectDocument> {
  const res = await fetch(`/api/admin/projects/${projectId}/documents/${documentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<ProjectDocument>(res);
}

export async function deleteProjectDocument(projectId: string, documentId: string): Promise<void> {
  const res = await fetch(`/api/admin/projects/${projectId}/documents/${documentId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message =
      typeof data?.error === "string"
        ? data.error
        : typeof data?.message === "string"
          ? data.message
          : `Error ${res.status}`;
    throw new Error(message);
  }
}

export async function listPublicProjects(): Promise<Project[]> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/projects`, { cache: "no-store" });
    if (!res.ok) return fallbackProjects;

    const data = await res.json();
    const projects = Array.isArray(data) ? sortPublicProjects(data as Project[]) : [];
    return projects.length > 0 ? projects : sortPublicProjects(fallbackProjects);
  } catch {
    return sortPublicProjects(fallbackProjects);
  }
}

export async function listPublicProjectsCmsOnly(): Promise<Project[]> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/projects`, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? sortPublicProjects(data as Project[]) : [];
  } catch {
    return [];
  }
}

export async function getPublicProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/projects/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });

    if (res.ok) return (await res.json()) as Project;
    return fallbackProjects.find((project) => project.slug === slug) ?? null;
  } catch {
    return fallbackProjects.find((project) => project.slug === slug) ?? null;
  }
}

export async function listPublicProjectAdvances(slug: string): Promise<ProjectAdvance[]> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/projects/${encodeURIComponent(slug)}/advances`, {
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as ProjectAdvance[]) : [];
  } catch {
    return [];
  }
}
