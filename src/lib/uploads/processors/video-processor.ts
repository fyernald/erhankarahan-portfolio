import "server-only";
import sharp from "sharp";
import { env } from "@/lib/env";
import { UploadError } from "../errors";
import { MAX_VIDEO_SECONDS } from "../limits";
import { runProcess } from "../run-process";
import type { TempFileRegistry } from "../temp-files";
import type { ProcessedAsset, VerifiedFile } from "../types";
import { createBlurDataUrl } from "./blur-placeholder";
import type { MediaProcessor } from "./processor";

const PROBE_TIMEOUT = 60_000;
const REMUX_TIMEOUT = 20 * 60_000;
const POSTER_TIMEOUT = 60_000;
const ALLOWED_VIDEO_CODECS = new Set(["h264", "hevc", "vp8", "vp9", "av1"]);
const WEBM_AUDIO_CODECS = new Set(["opus", "vorbis"]);

type ProbeStream = { codec_type?: string; codec_name?: string; width?: number; height?: number };
type ProbeResult = { streams?: ProbeStream[]; format?: { format_name?: string; duration?: string } };

/**
 * Hardened ffmpeg flags: only the local file protocol is allowed and the demuxer is
 * forced, so crafted inputs (e.g. HLS playlists) can't read other files or reach
 * the network.
 */
const safeInput = (demuxer: string, path: string) => [
  "-nostdin",
  "-hide_banner",
  "-v",
  "error",
  "-protocol_whitelist",
  "file",
  "-f",
  demuxer,
  "-i",
  path,
];

/**
 * Validates the container/codecs with ffprobe, then remuxes the streams into a
 * fresh file: only the first video and audio track are kept and all metadata
 * (GPS, device info) is dropped. A poster frame is extracted for previews.
 */
export class VideoProcessor implements MediaProcessor {
  readonly kind = "video" as const;

  async process(file: VerifiedFile, temp: TempFileRegistry): Promise<ProcessedAsset> {
    const isWebm = file.mimeType === "video/webm";
    const demuxer = isWebm ? "matroska" : "mov";
    const probe = await this.probe(file.tempPath, demuxer);

    const video = probe.streams?.find((stream) => stream.codec_type === "video");
    const audio = probe.streams?.find((stream) => stream.codec_type === "audio");
    const duration = Number(probe.format?.duration ?? 0);

    if (!video?.codec_name || !ALLOWED_VIDEO_CODECS.has(video.codec_name)) {
      throw new UploadError("Unsupported video codec. Please export as H.264, H.265, VP9 or AV1.", 415);
    }
    if (!Number.isFinite(duration) || duration <= 0 || duration > MAX_VIDEO_SECONDS) {
      throw new UploadError("The video duration is invalid or too long.", 422);
    }

    const extension = isWebm ? "webm" : "mp4";
    const outputPath = await temp.create(extension);
    await this.remux(file.tempPath, demuxer, outputPath, { isWebm, videoCodec: video.codec_name, audioCodec: audio?.codec_name });

    const poster = await this.extractPoster(outputPath, extension === "webm" ? "matroska" : "mov", duration, temp);

    return {
      primary: { path: outputPath, contentType: isWebm ? "video/webm" : "video/mp4", extension },
      poster: poster?.file,
      width: video.width,
      height: video.height,
      durationSeconds: duration,
      blurDataUrl: poster?.blurDataUrl,
    };
  }

  private async probe(path: string, demuxer: string): Promise<ProbeResult> {
    try {
      const { stdout } = await runProcess(
        env().FFPROBE_PATH,
        [
          "-hide_banner", "-v", "error", "-protocol_whitelist", "file", "-f", demuxer,
          "-show_entries", "format=format_name,duration:stream=codec_type,codec_name,width,height",
          "-of", "json", path,
        ],
        PROBE_TIMEOUT,
      );
      return JSON.parse(stdout) as ProbeResult;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new UploadError("Video processing is unavailable on the server (ffmpeg missing).", 503);
      }
      console.warn("[upload] ffprobe failed", error);
      throw new UploadError("The video file is corrupt or not supported.", 422);
    }
  }

  private async remux(
    input: string,
    demuxer: string,
    output: string,
    options: { isWebm: boolean; videoCodec: string; audioCodec?: string },
  ) {
    const audioArgs = !options.audioCodec
      ? []
      : options.isWebm
        ? WEBM_AUDIO_CODECS.has(options.audioCodec) ? ["-c:a", "copy"] : ["-c:a", "libopus", "-b:a", "160k"]
        : ["-c:a", "aac", "-b:a", "192k"];
    const containerArgs = options.isWebm
      ? ["-f", "webm"]
      : ["-movflags", "+faststart", ...(options.videoCodec === "hevc" ? ["-tag:v", "hvc1"] : []), "-f", "mp4"];

    try {
      await runProcess(
        env().FFMPEG_PATH,
        [
          ...safeInput(demuxer, input),
          "-map", "0:v:0", "-map", "0:a:0?",
          "-c:v", "copy", ...audioArgs,
          "-map_metadata", "-1", "-map_chapters", "-1", "-dn", "-sn",
          ...containerArgs, "-y", output,
        ],
        REMUX_TIMEOUT,
      );
    } catch (error) {
      console.warn("[upload] ffmpeg remux failed", error);
      throw new UploadError("The video could not be processed.", 422);
    }
  }

  private async extractPoster(videoPath: string, demuxer: string, duration: number, temp: TempFileRegistry) {
    const framePath = await temp.create("png");
    const posterPath = await temp.create("webp");
    try {
      await runProcess(
        env().FFMPEG_PATH,
        [
          "-ss", String(Math.min(1, duration / 2)),
          ...safeInput(demuxer, videoPath),
          "-frames:v", "1", "-vf", "scale='min(1920,iw)':-2", "-y", framePath,
        ],
        POSTER_TIMEOUT,
      );
      await sharp(framePath).webp({ quality: 82 }).toFile(posterPath);
      return {
        file: { path: posterPath, contentType: "image/webp", extension: "webp" },
        blurDataUrl: await createBlurDataUrl(posterPath),
      };
    } catch (error) {
      console.warn("[upload] poster extraction failed", error);
      return undefined;
    }
  }
}
