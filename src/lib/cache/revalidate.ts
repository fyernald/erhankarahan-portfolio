import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Content changes affect both the public site and dashboard lists. Pages render per
 * request, so this mainly clears the client-side router cache for every route.
 */
export function revalidateSite() {
  revalidatePath("/", "layout");
}
