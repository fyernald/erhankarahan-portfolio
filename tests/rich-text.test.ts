import { describe, expect, it } from "vitest";
import { renderRichText } from "@/lib/rich-text/render";
import { sanitizeRichHtml } from "@/lib/rich-text/sanitize";

const MEDIA_ID = "123e4567-e89b-12d3-a456-426614174000";

describe("renderRichText", () => {
  it("renders supported nodes and computes reading time", () => {
    const result = renderRichText({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Title" }] },
        { type: "paragraph", content: [{ type: "text", text: "Hello world" }] },
        { type: "image", attrs: { src: `/media/images/${MEDIA_ID}.jpg`, alt: "Photo" } },
      ],
    });
    expect(result.html).toContain("<h2>Title</h2>");
    expect(result.html).toContain(`src="/media/images/${MEDIA_ID}.jpg"`);
    expect(result.plainText).toBe("Title Hello world");
    expect(result.readingMinutes).toBe(1);
  });

  it("drops javascript: links and foreign images", () => {
    const { html } = renderRichText({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "x", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] }],
        },
        { type: "image", attrs: { src: "https://evil.example/x.png" } },
      ],
    });
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("evil.example");
  });

  it("rejects unknown node types", () => {
    expect(() => renderRichText({ type: "doc", content: [{ type: "script" }] })).toThrow(/unsupported/);
  });
});

describe("sanitizeRichHtml", () => {
  it.each([
    ['<img src="x" onerror="alert(1)">', "onerror"],
    ["<script>alert(1)</script>", "<script"],
    ['<a href="javascript:alert(1)">x</a>', "javascript:"],
    ['<iframe src="https://evil.example"></iframe>', "evil.example"],
    ['<p style="background:url(javascript:alert(1))">x</p>', "background"],
    ['<svg><script>alert(1)</script></svg>', "<svg"],
    [`<video src="/media/videos/${MEDIA_ID}.mp4" poster="https://evil.example/p.jpg"></video>`, "evil.example"],
  ])("removes %s", (input, forbidden) => {
    expect(sanitizeRichHtml(input)).not.toContain(forbidden);
  });

  it("keeps safe formatting", () => {
    const html = '<p style="text-align:center"><strong>bold</strong> <span style="color:#ff0000">red</span></p>';
    expect(sanitizeRichHtml(html)).toBe(html);
  });
});

describe("withResponsiveImages", () => {
  it("adds an optimizer srcset to own media images only", async () => {
    const { withResponsiveImages } = await import("@/lib/rich-text/responsive-images");
    const html = withResponsiveImages(`<p>x</p><img loading="lazy" src="/media/images/${MEDIA_ID}.jpg" alt="a" />`);
    expect(html).toContain('srcset="/_next/image?url=%2Fmedia%2Fimages%2F');
    expect(html).toContain("1920w");
    expect(html).toContain('alt="a"');
  });
});
