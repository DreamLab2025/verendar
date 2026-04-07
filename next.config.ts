import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

/** Cho phép `next/image` tải ảnh từ host API (NEXT_PUBLIC_API_URL, gateway). */
function remotePatternsFromApiEnv(): RemotePattern[] {
  const urls = [process.env.NEXT_PUBLIC_API_URL, process.env.NEXT_PUBLIC_API_URL_API_GATEWAY].filter(
    (s): s is string => Boolean(s?.trim()),
  );
  const seen = new Set<string>();
  const out: RemotePattern[] = [];
  for (const raw of urls) {
    try {
      const u = new URL(raw);
      const key = `${u.protocol}//${u.host}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const protocol = u.protocol.replace(":", "") as "http" | "https";
      const pattern: RemotePattern = {
        protocol,
        hostname: u.hostname,
      };
      if (u.port) {
        pattern.port = u.port;
      }
      out.push(pattern);
    } catch {
      /* bỏ qua URL không hợp lệ */
    }
  }
  return out;
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      ...remotePatternsFromApiEnv(),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      /** CDN media (vd: d3iova6424vljy.cloudfront.net/dev/media/garage_service/...) */
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
      /** Ảnh garage/media trên S3 (vd: verendar.s3.ap-southeast-1.amazonaws.com/...) */
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
