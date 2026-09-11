export interface MovieSummary {
  id: number;
  title: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: string | null;
  rating: number | null;
  genreIds: number[];
}

export interface MovieDetails extends MovieSummary {
  overview: string;
  runtimeMinutes: number | null;
  genres: { id: number; name: string }[];
  status: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface PaginatedResult<T> {
  results: T[];
  page: number;
  totalPages: number;
  totalResults: number;
}