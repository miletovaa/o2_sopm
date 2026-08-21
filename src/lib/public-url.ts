import { NextRequest } from "next/server";

// The app runs as a standalone Next.js server behind the shared edge Caddy
// reverse proxy. Its Node server binds to HOSTNAME=0.0.0.0 / PORT=3000, and
// request.url / request.nextUrl are built from that bind address rather
// than the client-facing host — even though Caddy correctly forwards
// X-Forwarded-Host/Proto (and preserves the original Host header). Route
// handlers that build an absolute redirect URL must use this instead of
// request.url/nextUrl to land back on the public domain.
export function publicUrl(request: NextRequest, path: string): URL {
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  return new URL(path, `${proto}://${host}`);
}