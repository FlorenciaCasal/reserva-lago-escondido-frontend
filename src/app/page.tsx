import type { Metadata } from "next";
import HomeFeaturedProjects from "@/components/home/HomeFeaturedProjects";
import HomeHero from "@/components/home/HomeHero";
import HomeNewsPreview from "@/components/home/HomeNewsPreview";
import HomePillars from "@/components/home/HomePillars";
import HomeVisitsCTA from "@/components/home/HomeVisitsCTA";
import RevealOnView from "@/components/ui/RevealOnView";
import { defaultDescription, ogImage, siteName, siteUrl } from "@/lib/seo";
import { getPublicHomeContent } from "@/services/home";

export const metadata: Metadata = {
  title: siteName,
  description: defaultDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteName,
    description: defaultDescription,
    url: siteUrl("/"),
    images: [ogImage()],
    type: "website",
  },
};

export default async function Page() {
  const content = await getPublicHomeContent();

  return (
    <main className="flex flex-col bg-[#FAFAF9]">
      <HomeHero content={content} />
      <RevealOnView>
      <section className="bg-[#FAFAF9] px-6 pb-8 pt-10 sm:px-8 sm:pt-12">
        <p className="mx-auto max-w-[850px] text-center text-lg leading-[1.6] text-neutral-700 sm:text-xl">
          {/* Resguardamos bosques milenarios y fauna local a través de la investigación, educación ambiental y producción sostenible. */}
{content.introText}
        </p>
      </section>
      </RevealOnView>
      <HomePillars content={content} />
      <RevealOnView>
        <HomeFeaturedProjects content={content} />
      </RevealOnView>
      <RevealOnView>
        <HomeNewsPreview content={content} />
      </RevealOnView>
      <RevealOnView>
        <HomeVisitsCTA content={content} />
      </RevealOnView>
    </main>
  );
}
