/** Media objects are always addressed through our own origin. */
export const MEDIA_ROUTE_PREFIX = "/media/";

/** `images/<uuid>.jpg` style keys; anything else is rejected by the media route. */
export const STORAGE_KEY_PATTERN = /^(images|videos|documents|posters)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{2,5}$/;

export function mediaUrl(storageKey: string): string;
export function mediaUrl(storageKey: string | null | undefined): string | null;
export function mediaUrl(storageKey: string | null | undefined): string | null {
  return storageKey ? `${MEDIA_ROUTE_PREFIX}${storageKey}` : null;
}
