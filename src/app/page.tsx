import HomeFeaturedProjects from "@/components/home/HomeFeaturedProjects";
import HomeHero from "@/components/home/HomeHero";
import HomeNewsPreview from "@/components/home/HomeNewsPreview";
import HomePillars from "@/components/home/HomePillars";
import HomeVisitsCTA from "@/components/home/HomeVisitsCTA";

export default function Page() {
  return (
    <main className="flex flex-col bg-[#FAFAF9]">
      <HomeHero />
      <HomePillars />
      <HomeFeaturedProjects />
      <HomeNewsPreview />
      <HomeVisitsCTA />
    </main>
  );
}
