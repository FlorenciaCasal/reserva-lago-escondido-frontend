import type { MediaAsset } from "@/types/project";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type UploadKind = "IMAGE" | "DOCUMENT" | "VIDEO";

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2560;
const OPTIMIZATION_SIZE_THRESHOLD_BYTES = 8 * 1024 * 1024;
const MIN_HEAVY_IMAGE_REDUCTION_RATIO = 0.15;
const MIN_RESIZED_IMAGE_REDUCTION_RATIO = 0.05;
const OPTIMIZABLE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

function imageNameWithoutExtension(name: string) {
  const baseName = name.replace(/\.[^/.]+$/, "").trim();
  return baseName || "imagen";
}

function canvasToWebp(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.95));
}

async function optimizeImageForUpload(file: File): Promise<File> {
  if (!OPTIMIZABLE_IMAGE_TYPES.has(file.type)) return file;

  const startedAt = performance.now();
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const largestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const needsResize = largestSide > MAX_IMAGE_DIMENSION;
    if (!needsResize && file.size <= OPTIMIZATION_SIZE_THRESHOLD_BYTES) {
      return file;
    }

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / largestSide);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(image, 0, 0, width, height);

    const optimizedBlob = await canvasToWebp(canvas);
    const minimumReductionRatio = needsResize ? MIN_RESIZED_IMAGE_REDUCTION_RATIO : MIN_HEAVY_IMAGE_REDUCTION_RATIO;
    const maximumAcceptedSize = Math.floor(file.size * (1 - minimumReductionRatio));
    if (!optimizedBlob || optimizedBlob.size > maximumAcceptedSize) return file;

    const optimizedFile = new File([optimizedBlob], `${imageNameWithoutExtension(file.name)}.webp`, {
      type: "image/webp",
      lastModified: file.lastModified,
    });

    if (isDevelopment()) {
      console.info("[media-upload] imagen optimizada", {
        originalBytes: file.size,
        optimizedBytes: optimizedFile.size,
        preparationMs: Math.round(performance.now() - startedAt),
      });
    }
    return optimizedFile;
  } catch {
    if (isDevelopment()) {
      console.info("[media-upload] se conserva la imagen original", {
        originalBytes: file.size,
        preparationMs: Math.round(performance.now() - startedAt),
      });
    }
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

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
  if (kind === "IMAGE" && file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("La imagen supera el límite máximo de 20 MiB. Reducí su tamaño o convertí la fotografía a JPG o WebP antes de subirla.");
  }

  const preparationStartedAt = performance.now();
  const uploadFile = kind === "IMAGE" ? await optimizeImageForUpload(file) : file;
  const preparationMs = Math.round(performance.now() - preparationStartedAt);

  const grantResponse = await fetch("/api/admin/media/upload-authorizations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
    cache: "no-store",
  });
  const grant = await parseJson<{ token: string }>(grantResponse);

  const formData = new FormData();
  formData.append("file", uploadFile);

  const uploadStartedAt = performance.now();
  const uploadResponse = await fetch(`${BACKEND}/api/admin/media/${kind.toLowerCase()}s`, {
    method: "POST",
    headers: { Authorization: `Bearer ${grant.token}` },
    body: formData,
  });

  if (isDevelopment()) {
    console.info("[media-upload] transferencia completada", {
      kind,
      originalBytes: file.size,
      sentBytes: uploadFile.size,
      preparationMs,
      uploadMs: Math.round(performance.now() - uploadStartedAt),
    });
  }

  return parseJson<T>(uploadResponse);
}
