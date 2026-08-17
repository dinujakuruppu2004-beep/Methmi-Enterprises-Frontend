import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Optional. Leave unset to run the site standalone (bundled content + local
// enquiry route). Set it to point /api/* at the Express backend instead.
// Must be set at build time too — rewrites are resolved during the build.
const BACKEND_URL = process.env.BACKEND_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    // Without a backend there is nothing to proxy to; the app's own route
    // handlers under src/app/api serve /api/* instead.
    if (!BACKEND_URL) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
