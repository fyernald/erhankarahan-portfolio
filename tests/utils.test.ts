import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/utils/slugify";
import { formatBytes, formatDuration } from "@/lib/utils/format";
import { parseTags, toParagraphs } from "@/lib/utils/text";
import { RateLimiter } from "@/lib/security/rate-limit";

describe("slugify", () => {
  it("handles Turkish characters and punctuation", () => {
    expect(slugify("İstanbul'da Güneş Batımı!")).toBe("istanbul-da-gunes-batimi");
    expect(slugify("  Hello -- World  ")).toBe("hello-world");
  });
});

describe("format helpers", () => {
  it("formats bytes and durations", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatDuration(75)).toBe("1:15");
    expect(formatDuration(3725)).toBe("1:02:05");
  });
});

describe("text helpers", () => {
  it("parses tags and paragraphs", () => {
    expect(parseTags("Travel, travel , Film,")).toEqual(["travel", "film"]);
    expect(toParagraphs("a\n\n\nb\n c")).toEqual(["a", "b\n c"]);
  });
});

describe("RateLimiter", () => {
  it("blocks after the limit within a window", () => {
    const limiter = new RateLimiter(2, 60_000);
    expect(limiter.consume("k").allowed).toBe(true);
    expect(limiter.consume("k").allowed).toBe(true);
    expect(limiter.consume("k").allowed).toBe(false);
    expect(limiter.consume("other").allowed).toBe(true);
  });
});
