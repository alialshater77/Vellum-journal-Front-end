import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Suspense } from "react";

import { PressWake } from "@/components/press-wake";
import { SiteHeader } from "@/components/site-header";
import { HeaderFallback } from "@/components/skeletons";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://vellum-journal.alialshater7.workers.dev",
);

const description = "A private journal for pictured notes. A new dispatch, a revision, or a removal shows on every open desk.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Vellum",
    template: "%s · Vellum",
  },
  description,
  applicationName: "Vellum",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Vellum",
    description,
    type: "website",
    url: "/",
    siteName: "Vellum",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 627,
        alt: "Vellum, a private journal for pictured notes",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vellum",
    description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f3eee4",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <Suspense fallback={<HeaderFallback />}>
          <SiteHeader />
        </Suspense>
        <PressWake>
          <div id="content" className="flex flex-1 flex-col">
            {children}
          </div>
        </PressWake>
        <footer className="border-t border-line px-4 py-8 text-center text-sm text-muted">
          <p>Vellum · a private press for short dispatches</p>
        </footer>
      </body>
    </html>
  );
}
