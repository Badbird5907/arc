import "server-only";

import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { type Redis } from "@upstash/redis";
import { env } from "@/env";
import { getRedis } from "@/server/redis";

declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | undefined;
}

export type RateLimitOptions = "default" | "slidingOnePerSecond" | "sendSMS";


type RatelimitResponse = {
  /**
   * Whether the request may pass(true) or exceeded the limit(false)
   */
  success: boolean;
  /**
   * Maximum number of requests allowed within a window.
   */
  limit: number;
  /**
   * How many requests the user has left within the current window.
   */
  remaining: number;
  reset: number;
  pending: Promise<unknown>;
};

export async function rateLimiter(identifier: string, type: RateLimitOptions) {
  const VALID_UPSTASH_ENV = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN;
  if (!VALID_UPSTASH_ENV) {
    console.warn(
      "Disabled due to UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN variables not found",
    );
    return {
      success: true,
      limit: 10,
      remaining: 999,
      reset: 0,
    } as RatelimitResponse;
  }

  const limiter = {
    default: new Ratelimit({
      redis: getRedis(),
      analytics: true,
      prefix: "ratelimit",
      limiter: Ratelimit.fixedWindow(10, "60s"),
    }),
    slidingOnePerSecond: new Ratelimit({
      redis: getRedis(),
      analytics: true,
      prefix: "ratelimit",
      limiter: Ratelimit.slidingWindow(10, "10s"),
    }),
    sendSMS: new Ratelimit({
      redis: getRedis(),
      analytics: true,
      prefix: "ratelimit",
      limiter: Ratelimit.fixedWindow(10, "7d"),
    }),
  };

  return await limiter[type].limit(identifier);
}

export async function checkRateLimitAndThrowError({
  type = "default",
  identifier,
}: {
  identifier: string;
  type?: RateLimitOptions;
}) {
  const response = await rateLimiter(identifier, type);

  const { success, reset } = response;

  if (!success) {
    const convertToSeconds = (ms: number) => Math.floor(ms / 1000);
    const secondsToWait = convertToSeconds(reset - Date.now());
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Try again in ${secondsToWait} seconds.`,
    });
  }
}