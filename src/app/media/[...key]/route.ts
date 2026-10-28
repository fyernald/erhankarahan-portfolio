import { Readable } from "node:stream";
import { STORAGE_KEY_PATTERN } from "@/lib/media/urls";
import { getStorage } from "@/lib/storage/object-storage";

/**
 * Serves objects from the private bucket. Only well-formed keys are accepted, the
 * stored Content-Type is authoritative, MIME sniffing is disabled and a sandbox CSP
 * guarantees nothing served here can ever execute script in our origin.
 * Supports HTTP Range requests for video seeking and ETag revalidation.
 */
export async function GET(request: Request, context: RouteContext<"/media/[...key]">) {
  const { key: segments } = await context.params;
  const key = segments.join("/");
  if (!STORAGE_KEY_PATTERN.test(key)) return new Response("Not found", { status: 404 });

  const range = request.headers.get("range") ?? undefined;
  const ifNoneMatch = request.headers.get("if-none-match") ?? undefined;

  try {
    const object = await getStorage().get(key, { range, ifNoneMatch });
    if (!object.Body) return new Response("Not found", { status: 404 });

    const headers = new Headers({
      "Content-Type": object.ContentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Accept-Ranges": "bytes",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "Cross-Origin-Resource-Policy": "same-origin",
    });
    if (object.ETag) headers.set("ETag", object.ETag);
    if (object.ContentLength !== undefined) headers.set("Content-Length", String(object.ContentLength));
    if (object.ContentRange) headers.set("Content-Range", object.ContentRange);
    if (object.ContentDisposition) headers.set("Content-Disposition", object.ContentDisposition);
    else if (key.startsWith("documents/")) headers.set("Content-Disposition", "attachment");

    const body = Readable.toWeb(object.Body as Readable) as ReadableStream;
    return new Response(body, { status: object.ContentRange ? 206 : 200, headers });
  } catch (error) {
    return storageErrorResponse(error);
  }
}

function storageErrorResponse(error: unknown): Response {
  const status = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
  if (status === 304) return new Response(null, { status: 304 });
  if (status === 416) return new Response("Range not satisfiable", { status: 416 });
  if (status === 404 || (error as { name?: string })?.name === "NoSuchKey") {
    return new Response("Not found", { status: 404 });
  }
  console.error("[media] failed to read object", error);
  return new Response("Unavailable", { status: 503 });
}
