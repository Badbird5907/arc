import "server-only";
import { Redis } from "@upstash/redis";
import { env } from "@/env";

export const getRedis = () => {
  if (globalThis.redis) {
    return globalThis.redis;
  }
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  globalThis.redis = redis;
  return redis;
};

export interface getOptions {
  force?: boolean;
}
export async function get<T>(
  key: string,
  options?: getOptions,
): Promise<T | null> {
  if (env.DISABLE_CACHING === true && !options?.force) return null;
  const value = await getRedis().get(key);
  if (!value) return null;
  return value as T;
}

export interface setOptions {
  ttl?: number; // in seconds
  force?: boolean;
}

export async function set<T>(
  key: string,
  value: T,
  options?: setOptions,
): Promise<void> {
  if (env.DISABLE_CACHING === true && !options?.force) return;
  await getRedis().set(
    key,
    JSON.stringify(value),
    options?.ttl ? { ex: options?.ttl } : { ex: 300 },
  );
}

export interface delOptions {
  force?: boolean;
}

export async function del(key: string, options?: delOptions): Promise<void> {
  if (env.DISABLE_CACHING === true && !options?.force) return;
  await getRedis().del(key);
}