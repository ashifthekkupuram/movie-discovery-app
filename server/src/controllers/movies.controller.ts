import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { env } from "../config/env.js";
import { buildCacheKey, getOrSet } from "../services/cache.service.js";
import {
  fetchPopular,
  fetchDiscover,
  fetchGenres,
  fetchMovieDetails,
  searchMovies,
} from "../services/tmdb.service.js";

const browseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(500).default(1),
  genreId: z.coerce.number().int().optional(),
  sortBy: z
    .enum([
      "popularity.desc",
      "vote_average.desc",
      "release_date.desc",
      "title.asc",
    ])
    .optional(),
});

const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "q is required"),
  page: z.coerce.number().int().min(1).max(500).default(1),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const browseMovies = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = browseQuerySchema.parse(req.query);
    const cacheKey = buildCacheKey("movies:browse", query);

    const { data, cached } = await getOrSet(cacheKey, env.CACHE_TTL_LIST, () =>
      query.genreId || query.sortBy
        ? fetchDiscover(query)
        : fetchPopular(query.page),
    );

    res.set("X-Cache", cached ? "HIT" : "MISS");
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const search = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = searchQuerySchema.parse(req.query);
    const cacheKey = buildCacheKey("movies:search", query);

    const { data, cached } = await getOrSet(cacheKey, env.CACHE_TTL_LIST, () =>
      searchMovies(query.q, query.page),
    );

    res.set("X-Cache", cached ? "HIT" : "MISS");
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getMovieDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const cacheKey = buildCacheKey("movies:details", { id });

    const { data, cached } = await getOrSet(
      cacheKey,
      env.CACHE_TTL_DETAILS,
      () => fetchMovieDetails(id),
    );

    res.set("X-Cache", cached ? "HIT" : "MISS");
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getGenres = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cacheKey = "movies:genres";

    const { data, cached } = await getOrSet(cacheKey, 86400, fetchGenres);

    res.set("X-Cache", cached ? "HIT" : "MISS");
    res.json(data);
  } catch (err) {
    next(err);
  }
};
