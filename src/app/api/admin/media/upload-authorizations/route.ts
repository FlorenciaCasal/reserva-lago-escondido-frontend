import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(req: NextRequest) {
  const token = (await cookies()).get("auth_token")?.value;

  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.text();
  const response = await fetch(`${BACKEND}/api/admin/media/upload-authorizations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  });
}
