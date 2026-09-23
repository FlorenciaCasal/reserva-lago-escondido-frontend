import Image from "next/image";
import type { HomeContent } from "@/types/home";

export default function HomeHero({ content }: { content: HomeContent }) {
  return (
    <section className="relative isolate min-h-[520px] overflow-hidden bg-neutral-950 text-white sm:min-h-[600px] lg:min-h-[44vh]">
      <Image
        src={content.heroImageUrl}
        alt="Reserva Natural Lago Escondido"
        fill
        priority
        className="object-cover object-center lg:object-[center_25%]"
      />
      <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-start px-6 pb-0 pt-80 sm:min-h-[70vh] sm:px-8 xl:px-0 lg:pb-10 lg:pt-66">
        <div className="max-w-[590px]">
          {/* <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-white/80 [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">
            Reserva Natural Lago Escondido
          </p> */}
          <h1 className="text-[34px] font-bold leading-[1.08] text-white [text-shadow:0_5px_30px_rgba(0,0,0,0.95)] sm:text-[40px] lg:text-[40px]">
            {content.heroTitle}
          </h1>
          <p className="mt-2 max-w-[430px] text-base font-medium leading-7 text-white/90 [text-shadow:0_4px_24px_rgba(0,0,0,0.95)] sm:text-lg">
            {content.heroSubtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
