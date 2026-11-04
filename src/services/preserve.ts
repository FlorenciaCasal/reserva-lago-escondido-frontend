import type { PreserveContent, PreserveContentInput } from "@/types/preserve";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const fallbackPreserveContent: PreserveContent = {
  intro: "Conservamos la biodiversidad y los ecosistemas para las generaciones presentes y futuras.",
  heroAsideLines: ["Naturaleza", "hoy,", "mañana,", "siempre"],
  whatEyebrow: "Nuestra tarea",
  whatWeDoText:
    "Trabajamos en la protección de especies nativas, la restauración de ambientes y la investigación científica para comprender y cuidar nuestro entorno. Nuestro compromiso es integral y se basa en pilares técnicos y educativos.",
  bullets: [
    "Conservación de especies nativas",
    "Restauración de ecosistemas",
    "Investigación y monitoreo",
    "Educación ambiental",
  ],
  territoryEyebrow: "Nuestro enfoque",
  territoryTitle: "Conservar a partir del conocimiento",
  territoryText:
    "La conservación requiere comprender el territorio y observar cómo evoluciona en el tiempo. Por eso combinamos investigación, monitoreo y acciones concretas de protección y restauración, generando conocimiento que permita tomar decisiones responsables sobre el ambiente.",
  territoryMetricValue: "Monitorear",
  territoryMetricDescription: "Observar los ecosistemas y registrar sus cambios a lo largo del tiempo.",
  territoryResearchTitle: "Investigar",
  territoryResearchDescription: "Generar conocimiento sobre especies, ambientes y procesos naturales.",
  territoryEducationTitle: "Actuar",
  territoryEducationDescription: "Transformar ese conocimiento en acciones de conservación y restauración.",
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

function normalizeContent(data: Partial<PreserveContent> | null): PreserveContent {
  const intro = data?.intro?.trim() || fallbackPreserveContent.intro;
  const heroAsideLines =
    data?.heroAsideLines?.map((item) => item.trim()).filter(Boolean) ??
    fallbackPreserveContent.heroAsideLines;
  const whatEyebrow = data?.whatEyebrow?.trim() || fallbackPreserveContent.whatEyebrow;
  const whatWeDoText = data?.whatWeDoText?.trim() || fallbackPreserveContent.whatWeDoText;
  const bullets =
    data?.bullets?.map((item) => item.trim()).filter(Boolean) ?? fallbackPreserveContent.bullets;

  return {
    intro,
    heroAsideLines: heroAsideLines.length > 0 ? heroAsideLines : fallbackPreserveContent.heroAsideLines,
    whatEyebrow,
    whatWeDoText,
    bullets: bullets.length > 0 ? bullets : fallbackPreserveContent.bullets,
    territoryEyebrow: data?.territoryEyebrow?.trim() || fallbackPreserveContent.territoryEyebrow,
    territoryTitle: data?.territoryTitle?.trim() || fallbackPreserveContent.territoryTitle,
    territoryText: data?.territoryText?.trim() || fallbackPreserveContent.territoryText,
    territoryMetricValue: data?.territoryMetricValue?.trim() || fallbackPreserveContent.territoryMetricValue,
    territoryMetricDescription:
      data?.territoryMetricDescription?.trim() || fallbackPreserveContent.territoryMetricDescription,
    territoryResearchTitle:
      data?.territoryResearchTitle?.trim() || fallbackPreserveContent.territoryResearchTitle,
    territoryResearchDescription:
      data?.territoryResearchDescription?.trim() || fallbackPreserveContent.territoryResearchDescription,
    territoryEducationTitle:
      data?.territoryEducationTitle?.trim() || fallbackPreserveContent.territoryEducationTitle,
    territoryEducationDescription:
      data?.territoryEducationDescription?.trim() || fallbackPreserveContent.territoryEducationDescription,
  };
}

export async function getPublicPreserveContent(): Promise<PreserveContent> {
  try {
    const res = await fetch(`${API_URL}/api/preservar/content`, { cache: "no-store" });
    if (!res.ok) return fallbackPreserveContent;

    const data = await res.json();
    return normalizeContent(data as Partial<PreserveContent>);
  } catch {
    return fallbackPreserveContent;
  }
}

export async function getAdminPreserveContent(): Promise<PreserveContent> {
  const res = await fetch("/api/admin/preservar/content", { cache: "no-store" });
  return normalizeContent(await parseJson<PreserveContent>(res));
}

export async function updateAdminPreserveContent(input: PreserveContentInput): Promise<PreserveContent> {
  const res = await fetch("/api/admin/preservar/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return normalizeContent(await parseJson<PreserveContent>(res));
}
