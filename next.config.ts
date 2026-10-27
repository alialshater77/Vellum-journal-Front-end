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
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
        ],
      },
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
  cacheComponents: true,
  partialPrefetching: true,
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
