import { backendFetch } from "@/app/api/_backend";
import type { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string; advanceId: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id, advanceId } = await params;
  const body = await req.text();
  const resp = await backendFetch(`/api/admin/projects/${id}/advances/${advanceId}`, {
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

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id, advanceId } = await params;
  const resp = await backendFetch(`/api/admin/projects/${id}/advances/${advanceId}`, {
    method: "DELETE",
  });

  return new Response(null, {
    status: resp.status,
  });
}
