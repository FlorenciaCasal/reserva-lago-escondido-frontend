import { backendFetch } from "@/app/api/_backend";
import type { NextRequest } from "next/server";

const allowedActions = new Set(["publish", "archive"]);

type Params = { params: Promise<{ id: string; action: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id, action } = await params;

  if (!allowedActions.has(action)) {
    return Response.json({ error: "Accion no permitida" }, { status: 400 });
  }

  const resp = await backendFetch(`/api/admin/news/${encodeURIComponent(id)}/${action}`, {
    method: "POST",
  });

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: {
      "content-type": resp.headers.get("content-type") ?? "application/json",
    },
  });
}
