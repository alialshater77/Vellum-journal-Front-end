import type { NextConfig } from "next";

function imageSetup() {
  const raw = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    url = new URL("http://127.0.0.1:8080");
  }
  const protocol = url.protocol === "https:" ? "https" : "http";
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const patterns = [
    {
      protocol: protocol as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/images/**",
    },
  ];
  if (local) {
    for (const hostname of ["localhost", "127.0.0.1"]) {
      if (hostname === url.hostname) continue;
      patterns.push({
        protocol: "http",
        hostname,
        port: url.port || "8080",
        pathname: "/images/**",
      });
    }
  }
  return { local, patterns };
}

const images = imageSetup();
const cloudflareBuild = process.env.CLOUDFLARE_BUILD === "1";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Production pictures are loaded from the API host. Local development still
    // optimizes uploads served from this machine.
    unoptimized: process.env.NODE_ENV === "production",
    dangerouslyAllowLocalIP: images.local,
    remotePatterns: images.patterns,
  },
  async headers() {
    const shared = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-DNS-Prefetch-Control", value: "off" },
    ];
    // LinkedIn renders a project-link preview in an iframe. DENY on the public
    // page makes that preview fail. Signed-in routes still refuse framing.
    const framed = [{ key: "X-Frame-Options", value: "DENY" }];
    return [
      { source: "/:path*", headers: shared },
      { source: "/feed", headers: framed },
      { source: "/feed/:path*", headers: framed },
      { source: "/compose", headers: framed },
      { source: "/account", headers: framed },
      { source: "/login", headers: framed },
      { source: "/signup", headers: framed },
    ];
  },
  experimental: {
    agentFeedback: true,
    serverActions: {
      // Room above the 1 MB picture rule so a valid file plus form fields can arrive.
      // Larger pictures are rejected in the form before this request is sent.
      bodySizeLimit: "2mb",
    },
  },
  // Cache Components throws Error 1101 on the Cloudflare worker. Local dev keeps it.
  cacheComponents: !cloudflareBuild,
  partialPrefetching: !cloudflareBuild,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
