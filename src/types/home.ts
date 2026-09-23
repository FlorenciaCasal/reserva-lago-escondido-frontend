export type HomePillarContent = {
  title: string;
  value: string;
  suffix: string;
  statLabel: string;
  text: string;
  ctaLabel: string;
};

export type HomeContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  introText: string;
  actionTitle: string;
  conservar: HomePillarContent;
  habitar: HomePillarContent;
  producir: HomePillarContent;
  projectsTitle: string;
  projectsCtaLabel: string;
  newsTitle: string;
  newsCtaLabel: string;
  visitsEyebrow: string;
  visitsTitle: string;
  visitsText: string;
  visitsCtaLabel: string;
  visitsImageUrl: string;
};

export type HomeContentInput = HomeContent;
