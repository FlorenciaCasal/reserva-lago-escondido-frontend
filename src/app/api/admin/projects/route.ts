import { backendFetch } from "@/app/api/_backend";
import type { NextRequest } from "next/server";

export async function GET() {
  const resp = await backendFetch("/api/admin/projects");
  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: {
      "content-type": resp.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const resp = await backendFetch("/api/admin/projects", {
    method: "POST",
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
