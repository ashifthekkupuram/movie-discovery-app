import axios from "axios";
import { env } from "../config/env.js";
import type { MovieSummary, MovieDetails, PaginatedResult, Genre } from "../types/movie.js";

const client = axios.create({
  baseURL: env.TMDB_BASE_URL,
  timeout: 8000,
  headers: {
    Authorization: `Bearer ${env.TMDB_ACCESS_TOKEN}`,
    accept: "application/json",
  },
});

// Thrown for upstream failures so the controller layer can map to a clean HTTP response.
export class UpstreamError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
    this.name = "UpstreamError";
  }
}

// Retries transient failures (timeouts, 429, 5xx) with exponential backoff.
// Does not retry 4xx client errors - those won't succeed on retry.
async function requestWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  attempt = 1
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const isAxiosError = axios.isAxiosError(err);
    const status = isAxiosError ? err.response?.status : undefined;
    const isRetryable = !status || status === 429 || status >= 500;

    if (!isRetryable || attempt > retries) {
      const message = isAxiosError
        ? err.response?.data?.status_message ?? err.message
        : (err as Error).message;
      throw new UpstreamError(`TMDB request failed: ${message}`, status && status < 500 ? status : 502);
    }

    const backoffMs = 300 * 2 ** (attempt - 1);
    await new Promise((r) => setTimeout(r, backoffMs));
    return requestWithRetry(fn, retries, attempt + 1);
  }
}

function posterUrl(path: string | null, size: "w342" | "w500" = "w342") {
  return path ? `${env.TMDB_IMAGE_BASE_URL}/${size}${path}` : null;
}

function backdropUrl(path: string | null) {
  return path ? `${env.TMDB_IMAGE_BASE_URL}/w780${path}` : null;
}

// TMDB is inconsistent about which fields are present depending on the endpoint
// and sometimes returns null/missing values - every field here is defended.
function toMovieSummary(raw: any): MovieSummary {
  return {
    id: raw.id,
    title: raw.title ?? raw.original_title ?? "Untitled",
    posterUrl: posterUrl(raw.poster_path ?? null),
    backdropUrl: backdropUrl(raw.backdrop_path ?? null),
    releaseYear: raw.release_date ? String(raw.release_date).slice(0, 4) : null,
    rating: typeof raw.vote_average === "number" ? Math.round(raw.vote_average * 10) / 10 : null,
    genreIds: Array.isArray(raw.genre_ids) ? raw.genre_ids : [],
  };
}

function toMovieDetails(raw: any): MovieDetails {
  return {
    ...toMovieSummary(raw),
    genreIds: Array.isArray(raw.genres) ? raw.genres.map((g: any) => g.id) : [],
    overview: raw.overview ?? "",
    runtimeMinutes: typeof raw.runtime === "number" ? raw.runtime : null,
    genres: Array.isArray(raw.genres) ? raw.genres.map((g: any) => ({ id: g.id, name: g.name })) : [],
    status: raw.status ?? "Unknown",
  };
}

function toPaginated(raw: any): PaginatedResult<MovieSummary> {
  return {
    results: (raw.results ?? []).map(toMovieSummary),
    page: raw.page ?? 1,
    totalPages: Math.min(raw.total_pages ?? 1, 500), // TMDB hard-caps pagination at 500 pages
    totalResults: raw.total_results ?? 0,
  };
}

export async function fetchPopular(page: number): Promise<PaginatedResult<MovieSummary>> {
  const { data } = await requestWithRetry(() =>
    client.get("/movie/popular", { params: { page } })
  );
  return toPaginated(data);
}

export async function fetchDiscover(params: {
  page: number;
  genreId?: number;
  sortBy?: string;
}): Promise<PaginatedResult<MovieSummary>> {
  const { data } = await requestWithRetry(() =>
    client.get("/discover/movie", {
      params: {
        page: params.page,
        with_genres: params.genreId,
        sort_by: params.sortBy ?? "popularity.desc",
      },
    })
  );
  return toPaginated(data);
}

export async function searchMovies(
  query: string,
  page: number
): Promise<PaginatedResult<MovieSummary>> {
  const { data } = await requestWithRetry(() =>
    client.get("/search/movie", { params: { query, page } })
  );
  return toPaginated(data);
}

export async function fetchMovieDetails(id: number): Promise<MovieDetails> {
  try {
    const { data } = await requestWithRetry(() => client.get(`/movie/${id}`));
    return toMovieDetails(data);
  } catch (err) {
    if (err instanceof UpstreamError && err.status === 404) {
      throw new UpstreamError("Movie not found", 404);
    }
    throw err;
  }
}

export async function fetchGenres(): Promise<Genre[]> {
  const { data } = await requestWithRetry(() => client.get("/genre/movie/list"));
  return data.genres ?? [];
}