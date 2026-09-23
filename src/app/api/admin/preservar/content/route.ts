import { backendFetch } from "@/app/api/_backend";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const resp = await backendFetch("/api/admin/preservar/content", { cache: "no-store" });
  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: {
      "content-type": resp.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.text();
  const resp = await backendFetch("/api/admin/preservar/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: {
      "content-type": resp.headers.get("content-type") ?? "application/json",
    },
  });
}
