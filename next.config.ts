import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Classic ISR model (revalidate + revalidatePath). Cache Components is off on purpose.
  cacheComponents: false,
  // Do not advertise the framework in an X-Powered-By response header.
  poweredByHeader: false,
  images: {
    // Vercel Image Optimization is a paid-quota feature; images are compressed client-side before upload.
    unoptimized: true,
  },
  // Old site URLs -> home page (301 as requested; Next's "permanent" would send 308).
  async redirects() {
    return ["/inventory", "/inventory/:path*", "/gallery", "/gallery/:path*"].map((source) => ({
      source,
      destination: "/",
      statusCode: 301 as const,
    }));
  },
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
