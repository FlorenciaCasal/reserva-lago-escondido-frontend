import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "content-length",
  "accept-ranges",
  "content-range",
  "cache-control",
  "etag",
  "last-modified",
] as const;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const range = req.headers.get("range");
  const backendHeaders = new Headers();

  if (token) backendHeaders.set("authorization", `Bearer ${token}`);
  if (range) backendHeaders.set("range", range);

  const resp = await fetch(`${BACKEND}/api/media/${id}`, {
    headers: backendHeaders,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  for (const header of FORWARDED_RESPONSE_HEADERS) {
    const value = resp.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }

  if (!responseHeaders.has("content-type")) {
    responseHeaders.set("content-type", "application/octet-stream");
  }
  if (!responseHeaders.has("cache-control")) {
    responseHeaders.set("cache-control", "no-store");
  }

  return new Response(resp.body, {
    status: resp.status,
    headers: responseHeaders,
  });
}
