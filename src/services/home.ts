import type { MediaAsset } from "@/types/project";
import type { HomeContent, HomeContentInput } from "@/types/home";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const fallbackHomeContent: HomeContent = {
  heroTitle: "Conservar, habitar y producir de manera sostenible",
  heroSubtitle: "Área natural privada, Paraje El Foyel, Río Negro.",
  heroImageUrl: "/img/home.jpg",
  introText:
    "Trabajamos para conservar los ecosistemas, desarrollar actividades productivas responsables y promover una forma sostenible de habitar el territorio.",
  actionTitle: "Nuestras líneas de acción",
  conservar: {
    title: "Conservar",
    value: "42",
    suffix: "%",
    statLabel: "del territorio destinado a conservación",
    text: "Protegemos áreas de alto valor natural a través de la investigación, el monitoreo y la educación ambiental.",
    ctaLabel: "CONOCÉ MÁS",
  },
  habitar: {
    title: "Habitar",
    value: "200",
    suffix: "",
    statLabel: "personas habitan la reserva",
    text: "Promovemos una forma responsable de habitar el territorio, en convivencia con el entorno natural.",
    ctaLabel: "CONOCÉ MÁS",
  },
  producir: {
    title: "Producir",
    value: "58",
    suffix: "%",
    statLabel: "del territorio destinado a producción sostenible",
    text: "Desarrollamos actividades productivas responsables, compatibles con la conservación y el cuidado del territorio.",
    ctaLabel: "CONOCÉ MÁS",
  },
  projectsTitle: "Proyectos destacados",
  projectsCtaLabel: "Ver todos los proyectos",
  newsTitle: "Novedades",
  newsCtaLabel: "Ver todas las novedades",
  visitsEyebrow: "Visitas",
  visitsTitle: "Viví la reserva y conocé su entorno natural",
  visitsText:
    "Organizamos visitas para acercar la experiencia de la Reserva Natural Lago Escondido a quienes desean conocer, aprender y disfrutar este territorio con responsabilidad.",
  visitsCtaLabel: "Reservar visita",
  visitsImageUrl: "/img/particular.jpg",
};

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

function normalizeContent(data: Partial<HomeContent> | null): HomeContent {
  return {
    heroTitle: data?.heroTitle?.trim() || fallbackHomeContent.heroTitle,
    heroSubtitle: data?.heroSubtitle?.trim() || fallbackHomeContent.heroSubtitle,
    heroImageUrl: data?.heroImageUrl?.trim() || fallbackHomeContent.heroImageUrl,
    introText: data?.introText?.trim() || fallbackHomeContent.introText,
    actionTitle: data?.actionTitle?.trim() || fallbackHomeContent.actionTitle,
    conservar: normalizePillar(data?.conservar, fallbackHomeContent.conservar),
    habitar: normalizePillar(data?.habitar, fallbackHomeContent.habitar),
    producir: normalizePillar(data?.producir, fallbackHomeContent.producir),
    projectsTitle: data?.projectsTitle?.trim() || fallbackHomeContent.projectsTitle,
    projectsCtaLabel: data?.projectsCtaLabel?.trim() || fallbackHomeContent.projectsCtaLabel,
    newsTitle: data?.newsTitle?.trim() || fallbackHomeContent.newsTitle,
    newsCtaLabel: data?.newsCtaLabel?.trim() || fallbackHomeContent.newsCtaLabel,
    visitsEyebrow: data?.visitsEyebrow?.trim() || fallbackHomeContent.visitsEyebrow,
    visitsTitle: data?.visitsTitle?.trim() || fallbackHomeContent.visitsTitle,
    visitsText: data?.visitsText?.trim() || fallbackHomeContent.visitsText,
    visitsCtaLabel: data?.visitsCtaLabel?.trim() || fallbackHomeContent.visitsCtaLabel,
    visitsImageUrl: data?.visitsImageUrl?.trim() || fallbackHomeContent.visitsImageUrl,
  };
}

function normalizePillar(
  data: Partial<HomeContent["conservar"]> | undefined,
  fallback: HomeContent["conservar"],
): HomeContent["conservar"] {
  return {
    title: data?.title?.trim() || fallback.title,
    value: data?.value?.trim() || fallback.value,
    suffix: data?.suffix?.trim() ?? fallback.suffix,
    statLabel: data?.statLabel?.trim() || fallback.statLabel,
    text: data?.text?.trim() || fallback.text,
    ctaLabel: data?.ctaLabel?.trim() || fallback.ctaLabel,
  };
}

export async function getPublicHomeContent(): Promise<HomeContent> {
  try {
    const res = await fetch(`${API_URL}/api/home/content`, { cache: "no-store" });
    if (!res.ok) return fallbackHomeContent;

    return normalizeContent(await res.json());
  } catch {
    return fallbackHomeContent;
  }
}

export async function getAdminHomeContent(): Promise<HomeContent> {
  const res = await fetch("/api/admin/home/content", { cache: "no-store" });
  return normalizeContent(await parseJson<HomeContent>(res));
}

export async function updateAdminHomeContent(input: HomeContentInput): Promise<HomeContent> {
  const res = await fetch("/api/admin/home/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return normalizeContent(await parseJson<HomeContent>(res));
}

export async function uploadHomeImage(file: File): Promise<MediaAsset> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/media/images", {
    method: "POST",
    body: formData,
  });

  return parseJson<MediaAsset>(res);
}
