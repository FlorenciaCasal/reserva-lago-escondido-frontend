import Link from "next/link";
import type { HomeContent } from "@/types/home";

export default function HomeVisitsCTA({ content }: { content: HomeContent }) {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-950 px-6 py-16 text-white sm:px-8 sm:py-20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={content.visitsImageUrl}
        alt="Visitantes recorriendo la reserva"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/56 to-black/22" />

      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">
            {content.visitsEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
            {content.visitsTitle}
          </h2>
          <p className="mt-5 text-base leading-8 text-white/88">
            {content.visitsText}
          </p>
          <Link
            href="/visitas"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {content.visitsCtaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
