import { redis } from "../config/redis.js";

export async function getOrSet<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<{ data: T; cached: boolean }> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return { data: JSON.parse(cached) as T, cached: true };
    }
  } catch (err) {
    console.error(`[cache] read failed for key "${key}":`, (err as Error).message);
  }

  const data = await fetcher();

  try {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch (err) {
    console.error(`[cache] write failed for key "${key}":`, (err as Error).message);
  }

  return { data, cached: false };
}

export function buildCacheKey(namespace: string, params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return `${namespace}:${sorted}`;
}