import type {
  CreateNewsInput,
  GeneratedNewsDraft,
  GenerateNewsInput,
  GenerateNewsSocialInput,
  News,
  NewsImage,
  NewsImageInput,
  NewsMediaAsset,
  NewsSocialContent,
  NewsSocialContentInput,
  NewsStatus,
  SocialPlatform,
  UpdateNewsInput,
} from "@/types/news";

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

function newsTime(value?: string | null) {
  return value ? new Date(value).getTime() : 0;
}

function sortPublicNews(news: News[]) {
  return news
    .filter((item) => item.status === "PUBLISHED")
    .sort((a, b) => {
      const publishedDiff = newsTime(b.publishedAt) - newsTime(a.publishedAt);
      if (publishedDiff !== 0) return publishedDiff;
      return newsTime(b.createdAt) - newsTime(a.createdAt);
    });
}

export async function listAdminNews(): Promise<News[]> {
  const res = await fetch("/api/admin/news", { cache: "no-store" });
  return parseJson<News[]>(res);
}

export async function createNews(input: CreateNewsInput): Promise<News> {
  const res = await fetch("/api/admin/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<News>(res);
}

export async function generateNewsDraft(input: GenerateNewsInput): Promise<GeneratedNewsDraft> {
  const res = await fetch("/api/admin/news/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<GeneratedNewsDraft>(res);
}

export async function getAdminNews(id: string): Promise<News> {
  const res = await fetch(`/api/admin/news/${id}`, { cache: "no-store" });
  return parseJson<News>(res);
}

export async function updateNews(id: string, input: UpdateNewsInput): Promise<News> {
  const res = await fetch(`/api/admin/news/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<News>(res);
}

async function newsAction(id: string, action: "publish" | "archive"): Promise<News> {
  const res = await fetch(`/api/admin/news/${id}/${action}`, {
    method: "POST",
  });

  return parseJson<News>(res);
}

export function publishNews(id: string) {
  return newsAction(id, "publish");
}

export function archiveNews(id: string) {
  return newsAction(id, "archive");
}

export async function uploadNewsImage(file: File): Promise<NewsMediaAsset> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/media/images", {
    method: "POST",
    body: formData,
  });

  return parseJson<NewsMediaAsset>(res);
}

export async function uploadNewsVideo(file: File): Promise<NewsMediaAsset> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/media/videos", {
    method: "POST",
    body: formData,
  });

  return parseJson<NewsMediaAsset>(res);
}

export async function listAdminNewsImages(newsId: string): Promise<NewsImage[]> {
  const res = await fetch(`/api/admin/news/${newsId}/images`, { cache: "no-store" });
  return parseJson<NewsImage[]>(res);
}

export async function createNewsImage(newsId: string, input: NewsImageInput): Promise<NewsImage> {
  const res = await fetch(`/api/admin/news/${newsId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<NewsImage>(res);
}

export async function updateNewsImage(newsId: string, imageId: string, input: NewsImageInput): Promise<NewsImage> {
  const res = await fetch(`/api/admin/news/${newsId}/images/${imageId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<NewsImage>(res);
}

export async function deleteNewsImage(newsId: string, imageId: string): Promise<void> {
  const res = await fetch(`/api/admin/news/${newsId}/images/${imageId}`, {
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

export async function listNewsSocialContents(newsId: string): Promise<NewsSocialContent[]> {
  const res = await fetch(`/api/admin/news/${newsId}/social`, { cache: "no-store" });
  return parseJson<NewsSocialContent[]>(res);
}

export async function generateNewsSocialContent(
  newsId: string,
  platform: SocialPlatform,
  input: GenerateNewsSocialInput
): Promise<NewsSocialContent> {
  const res = await fetch(`/api/admin/news/${newsId}/social/${platform}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<NewsSocialContent>(res);
}

export async function saveNewsSocialContent(
  newsId: string,
  platform: SocialPlatform,
  input: NewsSocialContentInput
): Promise<NewsSocialContent> {
  const res = await fetch(`/api/admin/news/${newsId}/social/${platform}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<NewsSocialContent>(res);
}

export async function listPublicNews(): Promise<News[]> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/news`, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? sortPublicNews(data as News[]) : [];
  } catch {
    return [];
  }
}

export async function getPublicNewsBySlug(slug: string): Promise<News | null> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/news/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });

    if (res.ok) return (await res.json()) as News;
    return null;
  } catch {
    return null;
  }
}

export type { NewsStatus };
