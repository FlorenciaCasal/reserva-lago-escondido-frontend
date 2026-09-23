"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";


type FormValues = {
  email: string;
  password: string;
  //   remember?: boolean;
};

const schema = yup
  .object({
    email: yup
      .string()
      .email("Ingresá un correo válido")
      .required("El correo es obligatorio"),
    password: yup
      .string()
      .min(6, "Mínimo 6 caracteres")
      .required("La contraseña es obligatoria"),
    // remember: yup.boolean().optional(),
  })
  .required();

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      setErrorMsg("");
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
        credentials: "include",
      });
      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e.message || "Credenciales inválidas");
      }
      // // cookie quedó seteada por el route; listo
      // router.push("/admin");
      if (resp.redirected) {
        // server devolvió 303 → seguí esa URL
        window.location.href = resp.url;
        return;
      }

      // Fallback (si por algo no vino redirect)
      const rawNext = new URLSearchParams(window.location.search).get("next") || "/admin";
      const next = rawNext.startsWith("/") ? rawNext : `/${rawNext}`;  // 👈
      window.location.replace(next);
    } catch (error) {
      console.error("Error en login:", error);
      setErrorMsg(error instanceof Error ? error.message : "Error al iniciar sesión");
    }
  };

  return (
    <main className="min-h-[calc(100dvh-4rem)] w-full bg-gray-800 text-neutral-100 grid place-items-center px-4">
      {/* Contenedor */}
      <div className="w-full max-w-md">
        {/* Tarjeta */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 shadow-2xl backdrop-blur p-6 sm:p-8">
          {/* Encabezado */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Ingresar</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Si todavía no tenés cuenta, {" "}
              <Link href="/admin/usuarios" className="text-white underline-offset-4 hover:underline">
                creá una
              </Link>
              .
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {errorMsg && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {errorMsg}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1 w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-0 placeholder:text-neutral-500"
                placeholder="tu@correo.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                  Contraseña
                </label>
                <button
                  type="button"
                  tabIndex={-1}                    // ← fuera del orden de TAB
                  onMouseDown={(e) => e.preventDefault()} // ← no roba foco al clickear
                  onClick={() => setShowPwd((v) => !v)}
                  className="text-xs text-neutral-400 hover:text-neutral-200 select-none"
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPwd ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-0 placeholder:text-neutral-500"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              {/* <Link href="/forgot" className="text-xs text-neutral-400 hover:text-neutral-200">
                ¿Olvidaste tu contraseña?
              </Link> */}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-white/95 text-neutral-900 py-2 text-sm font-semibold hover:bg-white focus:outline-none disabled:opacity-70"
            >
              {isSubmitting ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
