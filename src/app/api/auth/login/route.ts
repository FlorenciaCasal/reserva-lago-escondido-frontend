// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { publicFetch } from "@/app/api/_backend";

// const COOKIE_NAME = "auth_token";

export async function POST(req: NextRequest) {
    const body = await req.json();

    let resp: Response;
    try {
        resp = await publicFetch(`/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    } catch {
        return NextResponse.json(
            { code: "BACKEND_UNAVAILABLE", message: "No se pudo conectar con el servidor" },
            { status: 502 }
        );
    }

    const text = await resp.text();
    if (!resp.ok) {
        return new NextResponse(text || JSON.stringify({ message: "Login failed" }), {
            status: resp.status,
            headers: { "content-type": resp.headers.get("content-type") ?? "application/json" },
        });
    }

    const data = JSON.parse(text) as { token: string};

    // Leer ?next del referer y SANITIZAR
    const referer = req.headers.get("referer") || "";
    const refUrl = new URL(referer || "http://localhost:3000/login");
    const rawNext = refUrl.searchParams.get("next") || "/admin";
    const next = rawNext.startsWith("/") ? rawNext : `/${rawNext}`;  // 👈 importante

    const res = NextResponse.redirect(new URL(next, req.url), { status: 303 });

    res.cookies.set("auth_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8,
    });

    return res;
}

