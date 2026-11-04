import { backendFetch } from "@/app/api/_backend";
import type { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string; imageId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id, imageId } = await params;
  const body = await req.text();
  const resp = await backendFetch(
    `/api/admin/news/${encodeURIComponent(id)}/images/${encodeURIComponent(imageId)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
    }
  );

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: {
      "content-type": resp.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, imageId } = await params;
  const resp = await backendFetch(
    `/api/admin/news/${encodeURIComponent(id)}/images/${encodeURIComponent(imageId)}`,
    {
      method: "DELETE",
    }
  );

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: {
      "content-type": resp.headers.get("content-type") ?? "application/json",
    },
  });
}
