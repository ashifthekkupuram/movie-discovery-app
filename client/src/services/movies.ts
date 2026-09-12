import { api } from "./api";
import type {
  MovieSummary,
  MovieDetails,
  Genre,
  PaginatedResult,
} from "@/types/movie";

export const browseMovies = async (
  params: {
    page?: number;
    genreId?: number;
    sortBy?: string;
  },
  signal?: AbortSignal,
): Promise<PaginatedResult<MovieSummary>> => {
  const { data } = await api.get("/movies/browse", { params, signal });
  return data;
};

export async function searchMovies(
  q: string,
  page = 1,
  signal?: AbortSignal,
): Promise<PaginatedResult<MovieSummary>> {
  const { data } = await api.get("/movies/search", {
    params: { q, page },
    signal,
  });
  return data;
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  const { data } = await api.get(`/movies/${id}`);
  return data;
}

export async function getSimilarMovies(id: number): Promise<PaginatedResult<MovieSummary>> {
  const { data } = await api.get(`/movies/${id}/similar`);
  return data;
}

export async function getTrending(): Promise<PaginatedResult<MovieSummary>> {
  const { data } = await api.get("/movies/trending");
  return data;
}

export async function getGenres(): Promise<Genre[]> {
  const { data } = await api.get("/movies/genres");
  return data;
}
