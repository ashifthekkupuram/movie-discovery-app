import { Redis } from "ioredis";

import { env } from "./env.js";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  lazyConnect: false,
});

redis.on("error", (err) => {
  // Cache is an optimization, not a dependency - never crash the process on a Redis error.
  console.error("[redis] connection error:", err.message);
});
