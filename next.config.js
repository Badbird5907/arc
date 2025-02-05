/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  rewrites: async () => {
    return [
      {
        // rewrite /assets/products/* to <supabase_url>/storage/v1/object/public/products/*
        source: "/assets/products/:path*",
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL}/storage/v1/object/public/products/:path*`,
      },
      {
        source: "/assets/categories/:path*",
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL}/storage/v1/object/public/categories/:path*`,
      },
      {
        source: "/api/lookup/:path*",
        destination: "https://api.geysermc.org/v2/utils/uuid/bedrock_or_java/:path*",
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "starlightskins.lunareclipse.studio",
        pathname: "/render/**"
      }
    ]
  }
};

export default config;
