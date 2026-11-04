import type { MediaAsset } from "@/types/project";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type UploadKind = "IMAGE" | "DOCUMENT" | "VIDEO";

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : typeof data?.message === "string"
          ? data.message
          : `Error ${response.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function uploadMediaAsset<T extends MediaAsset>(file: File, kind: UploadKind): Promise<T> {
  const grantResponse = await fetch("/api/admin/media/upload-authorizations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
    cache: "no-store",
  });
  const grant = await parseJson<{ token: string }>(grantResponse);

  const formData = new FormData();
  formData.append("file", file);

  const uploadResponse = await fetch(`${BACKEND}/api/admin/media/${kind.toLowerCase()}s`, {
    method: "POST",
    headers: { Authorization: `Bearer ${grant.token}` },
    body: formData,
  });

  return parseJson<T>(uploadResponse);
}
