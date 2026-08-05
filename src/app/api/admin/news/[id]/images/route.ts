import { backendFetch } from "@/app/api/_backend";
import type { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const resp = await backendFetch(`/api/admin/news/${encodeURIComponent(id)}/images`);
  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: {
      "content-type": resp.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.text();
  const resp = await backendFetch(`/api/admin/news/${encodeURIComponent(id)}/images`, {
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
