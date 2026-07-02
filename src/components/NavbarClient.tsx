"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function NavbarClient({ isLogged, isAdmin, isAdminLimit }: { isLogged: boolean; isAdmin: boolean; isAdminLimit: boolean }) {
  const pathname = usePathname();
  const isHome = pathname == "/";
  const showHomeLink = pathname !== "/";
  const isVisitas = pathname == "/visitas";
  const showVisitasLink = pathname !== "/visitas";
  const isCalendario = pathname == "/admin/calendario";
  const isReservas = pathname == "/admin/reservas";
  const isUsuarios = pathname == "/admin/usuarios";
  const isProjectsPage = pathname === "/proyectos" || pathname.startsWith("/proyectos/");
  const canAccessAdmin = isLogged && (isAdmin || isAdminLimit);

  // 👇 rutas donde NO queremos mostrar el navbar
  const HIDE_ON: string[] = ["/politicas-de-visita"];

  const [open, setOpen] = useState(false); // ← menú mobile

  // cerrar drawer al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // return condicional DESPUÉS de hooks
  if (HIDE_ON.includes(pathname)) return null;


  return (
    <>
      <nav
        className={`
        w-full sticky top-0 z-50 transition-colors duration-300 
       bg-background text-primary border-b border-white
      `}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-12 xl:px-16">
          {/* <div className="flex items-center justify-between gap-4 py-1"> */}
          <div className="flex items-center justify-between py-3">

            {/* ===== IZQUIERDA: LOGO + NAV ===== */}
            <div className="flex items-center gap-0">
              {/* LOGO */}
              <Link href="/">
                <Image
                  src="/img/logoReserva.png"
                  alt="Reserva Natural Lago Escondido"
                  width={120}
                  height={40}
                  priority
                  // className="w-auto h-10 md:h-12 "
                   className="w-auto h-8 sm:h-10 md:h-12"
                />
              </Link>
              {/* NAV PÚBLICO (placeholders) */}
              <div className="hidden sm:flex items-center gap-4 pl-10 lg:pl-18 text-sm text-primary">
                <Link href="/proyectos" className="hover:text-secondary-dark transition">
                  PROYECTOS
                </Link>
                {/* <span className="cursor-default">CONTACTO</span> */}
                <Link href="/#footer" className="hover:text-secondary-dark transition">
                  CONTACTO
                </Link>
              </div>
            </div>


            {/* ===== DERECHA: ACCIONES ===== */}
            <div className="hidden sm:flex items-center gap-4 text-sm">

              {(isHome || isVisitas || isCalendario || isUsuarios || isReservas || isProjectsPage) && canAccessAdmin && (
                <Link
                  href="/admin"
                  className="text-primary hover:text-secondary-dark transition pl-4"
                >
                  ADMIN
                </Link>
              )}

              {!isLogged ? (
                <Link
                  href="/login"
                  className="text-primary hover:text-secondary-dark transition"
                >
                  INGRESAR
                </Link>
              ) : (
                <LogoutButton />
              )}

              {showHomeLink && (
                <Link
                  href="/"
                  className="text-primary transition hover:text-secondary-dark"
                > <span className=" cursor-pointer">
                    INICIO
                  </span>
                </Link>
              )}

              {showVisitasLink && (
                <Link
                  href="/visitas"
                  className="
          ml-2 rounded-full bg-primary px-4 py-1.5
          text-white text-sm 
          hover:opacity-90 transition
        "
                >
                  VISITANOS
                </Link>
              )}
            </div>

            {/* BOTÓN HAMBURGUESA (solo mobile) */}
            <button
              aria-label="Abrir menú"
              className="sm:hidden text-primary px-2 py-1"
              onClick={() => setOpen(true)}
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <rect x="3" y="6" width="18" height="2" rx="1" />
                <rect x="3" y="11" width="18" height="2" rx="1" />
                <rect x="3" y="16" width="18" height="2" rx="1" />
              </svg>
            </button>

          </div>
        </div>
      </nav>

      {/* --- DRAWER MOBILE CON ANIMACIÓN --- */}
      {/* overlay oscuro con fade y sin clics cuando está cerrado */}
      <div
        onClick={() => setOpen(false)}
        className={`
    fixed inset-0 z-40 bg-black/50 sm:hidden
    transition-opacity duration-300
    ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
  `}
      />

      {/* panel lateral con slide horizontal */}
      <div
        className={`
    fixed z-50 inset-y-0 left-0 w-72 max-w-[80vw]
    bg-neutral-950/90 border-r border-neutral-800
    p-4 shadow-2xl sm:hidden

    transform transition-transform duration-300 ease-out
    ${open ? "translate-x-0" : "-translate-x-full"}
  `}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-wide text-neutral-400">
            Menú
          </p>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="rounded-md px-2 py-1 hover:bg-neutral-900 text-neutral-300"
          >
            ✕
          </button>
        </div>

        <nav>
          <ul className="space-y-1 text-neutral-200 text-sm">
            {showHomeLink && (
              <li>
                <Link
                  href="/"
                  className="block rounded-xl px-3 py-2 hover:bg-neutral-800"
                >
                  Inicio
                </Link>
              </li>
            )}

            {showVisitasLink && (
              <li>
                <Link
                  href="/visitas"
                  className="block rounded-xl px-3 py-2 hover:bg-neutral-800"
                >
                  Visitanos
                </Link>
              </li>
            )}

            {(isHome || isVisitas || isCalendario || isUsuarios || isReservas || isProjectsPage) && canAccessAdmin && (
              <li>
                <Link
                  href="/admin"
                  className="block rounded-xl px-3 py-2 hover:bg-neutral-800"
                >
                  Panel de Administración
                </Link>
              </li>
            )}

            {!isLogged ? (
              <li>
                <Link
                  href="/login"
                  className="block rounded-xl px-3 py-2 hover:bg-neutral-800"
                >
                  Ingresar
                </Link>
              </li>
            ) : (
              <li>
                <LogoutButton isMobile />
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  )
}
