const DEFAULT_PRODUCTION_ORIGIN = "https://www.reservalagoescondido.com.ar";
const LOCAL_ORIGIN = "http://localhost:3000";

export const siteName = "Reserva Natural Lago Escondido";
export const defaultDescription =
  "Reserva Natural Lago Escondido: conservación, producción sustentable, visitas y proyectos ambientales en El Foyel, Río Negro.";
export const defaultOgImage = "/img/home.jpg";
export const organizationId = "#organization";
export const websiteId = "#website";

function normalizeOrigin(value: string) {
  return value.replace(/\/+$/, "");
}

function isLocalOrigin(value: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);
}

export function getSiteOrigin() {
  const explicitOrigin = process.env.APP_ORIGIN?.trim();
  if (explicitOrigin) {
    const normalizedOrigin = normalizeOrigin(explicitOrigin);
    if (process.env.NODE_ENV === "development" || !isLocalOrigin(normalizedOrigin)) {
      return normalizedOrigin;
    }
  }

  return process.env.NODE_ENV === "development" ? LOCAL_ORIGIN : DEFAULT_PRODUCTION_ORIGIN;
}

export function siteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${getSiteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ogImage(url?: string | null) {
  return {
    url: siteUrl(url || defaultOgImage),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": siteUrl(organizationId),
    name: siteName,
    url: siteUrl("/"),
    logo: siteUrl("/img/logoReserva.png"),
    email: "info@reservalagoescondido.com.ar",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ruta 40 kilometro 1948",
      addressLocality: "El Foyel",
      addressRegion: "Rio Negro",
      addressCountry: "AR",
    },
    sameAs: [
      "https://www.instagram.com/reservalagoescondido",
      "https://www.facebook.com/profile.php?id=61586309443182",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": siteUrl(websiteId),
    name: siteName,
    url: siteUrl("/"),
    inLanguage: "es-AR",
    publisher: {
      "@id": siteUrl(organizationId),
    },
  };
}

export function newsArticleJsonLd({
  title,
  summary,
  slug,
  imageUrl,
  editorialDate,
  publishedAt,
  updatedAt,
}: {
  title: string;
  summary: string;
  slug: string;
  imageUrl?: string | null;
  editorialDate?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
}) {
  const canonical = siteUrl(`/novedades/${slug}`);
  const displayDate = editorialDate || publishedAt || undefined;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: summary,
    image: [siteUrl(imageUrl || defaultOgImage)],
    datePublished: displayDate,
    dateModified: updatedAt || displayDate,
    inLanguage: "es-AR",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    publisher: {
      "@id": siteUrl(organizationId),
    },
  };
}
