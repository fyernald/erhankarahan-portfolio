import "server-only";
import type { MediaKind } from "../types";
import { DocumentProcessor } from "./document-processor";
import { ImageProcessor } from "./image-processor";
import type { MediaProcessor } from "./processor";
import { VideoProcessor } from "./video-processor";

const processors: Record<MediaKind, MediaProcessor> = {
  image: new ImageProcessor(),
  video: new VideoProcessor(),
  document: new DocumentProcessor(),
};

export function processorFor(kind: MediaKind): MediaProcessor {
  return processors[kind];
}
