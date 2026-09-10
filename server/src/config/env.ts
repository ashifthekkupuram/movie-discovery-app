import "dotenv/config";

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var:${key}`);
  }
  return value;
};

export const env = {
  PORT: Number(process.env.PORT || 4000),

  TMDB_BASE_URL: required("TMDB_BASE_URL"),
  TMDB_ACCESS_TOKEN: required("TMDB_ACCESS_TOKEN"),
  TMDB_IMAGE_BASE_URL: required("TMDB_IMAGE_BASE_URL"),

  DATABASE_URL: required("DATABASE_URL"),
  REDIS_URL: required("REDIS_URL"),

  CACHE_TTL_LIST: Number(process.env.CACHE_TTL_LIST ?? 300),
  CACHE_TTL_DETAILS: Number(process.env.CACHE_TTL_DETAILS ?? 1800),
};
