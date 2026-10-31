import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Classic ISR model (revalidate + revalidatePath). Cache Components is off on purpose.
  cacheComponents: false,
  images: {
    // Vercel Image Optimization is a paid-quota feature; images are compressed client-side before upload.
    unoptimized: true,
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
