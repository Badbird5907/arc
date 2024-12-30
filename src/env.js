import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    APP_ENV: z.enum(["development", "production"]).default("development"),
    SUPABASE_ANON_KEY: z.string(),
    SUPABASE_PROJECT_URL: z.string().url(),
    TURNSTILE_SITE_KEY: z.string().optional(),
    TEBEX_PUBLIC_TOKEN: z.string().optional(),
    BASE_URL: z.string().regex(/^(http|https):\/\/[a-zA-Z0-9-.]+(:[0-9]+)?$/)
    .describe("Base URL must start with http/s and not end with a trailing slash"),
  },

  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    SUPABASE_SECRET_KEY: z.string(),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    DISABLE_CACHING: z.boolean().default(false),
    TURNSTILE_SECRET_KEY: z.string().optional(),
    TEBEX_PRIVATE_KEY: z.string(),
    TEBEX_PROJECT_ID: z.string(),
    TEBEX_WEBHOOK_SECRET: z.string().optional(),
    IP_ADDRESS_RESOLVE_HEADER: z.string().default("x-forwarded-for"), // Like x-forwarded-for
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_PROJECT_URL: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    DISABLE_CACHING: process.env.DISABLE_CACHING === "true",
    TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    TEBEX_PUBLIC_TOKEN: process.env.NEXT_PUBLIC_TEBEX_PUBLIC_TOKEN,
    TEBEX_PRIVATE_KEY: process.env.TEBEX_PRIVATE_KEY,
    TEBEX_PROJECT_ID: process.env.TEBEX_PROJECT_ID,
    TEBEX_WEBHOOK_SECRET: process.env.TEBEX_WEBHOOK_SECRET,
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    IP_ADDRESS_RESOLVE_HEADER: process.env.IP_ADDRESS_RESOLVE_HEADER,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
