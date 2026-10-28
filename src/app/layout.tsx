import type { Metadata, Viewport } from "next";
import { Mulish, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import { connection } from "next/server";
import { Toaster } from "@/components/ui/toaster";
import { NO_TRANSLATE_HEADER } from "@/lib/no-translate";
import "./globals.css";

const mulish = Mulish({ subsets: ["latin", "latin-ext"], variable: "--font-mulish", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  weight: ["400", "700"],
  display: "swap",
});

const siteUrl = process.env.APP_URL ?? "https://erhankarahan.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Erhan Karahan — Photographer & Film Maker", template: "%s — Erhan Karahan" },
  description: "Portfolio, resume and journal of Erhan Karahan, photographer and film maker.",
  applicationName: "Erhan Karahan",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Every page renders per request so the CSP nonce from the proxy can be applied.
  await connection();
  const noTranslate = (await headers()).get(NO_TRANSLATE_HEADER) === "1";

  return (
    <html lang="en" translate={noTranslate ? "no" : undefined} className={`${mulish.variable} ${playfair.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
