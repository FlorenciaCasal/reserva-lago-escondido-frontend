"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M7.75 2C4.57 2 2 4.57 2 7.75v8.5C2 19.43 4.57 22 7.75 22h8.5C19.43 22 22 19.43 22 16.25v-8.5C22 4.57 19.43 2 16.25 2h-8.5zm0 1.5h8.5A4.25 4.25 0 0 1 20.5 7.75v8.5A4.25 4.25 0 0 1 16.25 20.5h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5A4.25 4.25 0 0 1 7.75 3.5zM12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10zm0 1.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7zm4.75-.88a.88.88 0 1 0 0 1.76a.88.88 0 0 0 0-1.76z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12a10 10 0 1 0-11.5 9.95v-7.04H7.9V12h2.6V9.8c0-2.57 1.53-4 3.88-4 1.12 0 2.3.2 2.3.2v2.5h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.86l-.46 2.9h-2.4v7.04A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.98 3.5a2.48 2.48 0 1 0 0 4.96a2.48 2.48 0 0 0 0-4.96zM3 8.98h3.96V21H3zM9.98 8.98H13.8v1.64h.05c.53-1 1.84-2.05 3.8-2.05c4.06 0 4.8 2.67 4.8 6.14V21h-3.96v-5.3c0-1.26-.02-2.88-1.76-2.88c-1.76 0-2.03 1.37-2.03 2.78V21H9.98z" />
    </svg>
  );
}

function LocationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M12 21s7-5.3 7-11a7 7 0 0 0-14 0c0 5.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function EmailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const HIDE_ON: string[] = ["/politicas-de-visita"];
  if (HIDE_ON.includes(pathname)) return null;

  return (
    <footer id="footer" className="w-full scroll-mt-24 bg-primary text-white">
      <div className="mx-auto max-w-6xl px-2 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1.3fr_1fr_1fr] sm:items-start">
          <div>
            <Link href="/" aria-label="Ir al inicio">
              <Image
                src="/img/logoReserva.png"
                alt="Reserva Natural Lago Escondido"
                width={140}
                height={48}
                className="h-auto w-32 brightness-0 invert"
              />
            </Link>
          </div>

          <div>
            <h4 className="mb-3 text-xs tracking-wide opacity-90 md:text-sm">
              CONTACTO
            </h4>
            <div className="space-y-2 text-xs leading-relaxed opacity-85 md:text-sm">
              <a href="mailto:info@reservalagoescondido.com.ar" className="flex items-start gap-2 break-all hover:underline">
                <EmailIcon className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
                <span>info@reservalagoescondido.com.ar</span>
              </a>
              <p className="flex items-start gap-2">
                <LocationIcon className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
                <span>Ruta 40 kilómetro 1948, El Foyel, Río Negro, Argentina</span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs tracking-wide opacity-90 md:text-sm">
              SEGUINOS
            </h4>
            <div className="flex items-center gap-4">
              <Link href="https://www.instagram.com/reservalagoescondido" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon className="h-5 w-5 opacity-80 transition hover:opacity-100" />
              </Link>
              <Link href="https://www.facebook.com/profile.php?id=61586309443182" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookIcon className="h-5 w-5 opacity-80 transition hover:opacity-100" />
              </Link>
              <LinkedinIcon className="h-5 w-5 opacity-80 transition hover:opacity-100" />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/20 pt-5">
          <div className="flex flex-col gap-3 text-xs text-white/75 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Reserva Natural Lago Escondido. Todos los derechos reservados.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="#" className="transition hover:text-white">
                Términos y condiciones
              </a>
              <a href="#" className="transition hover:text-white">
                Política de privacidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
