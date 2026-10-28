import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getRateLimiter } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/same-origin";
import { UploadError } from "@/lib/uploads/errors";
import { handleUpload } from "@/lib/uploads/pipeline";
import { MEDIA_KINDS, type MediaKind } from "@/lib/uploads/types";

export const maxDuration = 1800;

const uploadLimiter = () => getRateLimiter("uploads", 120, 10 * 60_000);

function parseAcceptedKinds(value: string | null): MediaKind[] {
  if (!value) return [...MEDIA_KINDS];
  const kinds = value.split(",").filter((kind): kind is MediaKind => MEDIA_KINDS.includes(kind as MediaKind));
  return kinds.length > 0 ? kinds : [...MEDIA_KINDS];
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * POST /api/uploads?kinds=image,video
 * Body: multipart/form-data with a single `file` field.
 */
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return errorResponse("Cross-origin uploads are not allowed.", 403);

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return errorResponse("You must be signed in to upload files.", 401);

  const limit = uploadLimiter().consume(user.id);
  if (!limit.allowed) return errorResponse(`Too many uploads. Try again in ${limit.retryAfterSeconds}s.`, 429);

  const acceptedKinds = parseAcceptedKinds(new URL(request.url).searchParams.get("kinds"));

  try {
    const item = await handleUpload({ request, acceptedKinds, uploadedById: user.id });
    return NextResponse.json({ item }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof UploadError) return errorResponse(error.message, error.status);
    console.error("[upload] unexpected failure", error);
    return errorResponse("The upload failed. Please try again.", 500);
  }
}
