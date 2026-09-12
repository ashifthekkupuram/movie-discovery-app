import { api } from "./api";

export interface WishlistItem {
  id: number;
  deviceId: string;
  movieId: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  addedAt: string;
}

export const getWishlist = async (): Promise<WishlistItem[]> => {
  const { data } = await api.get("/wishlist");
  return data;
};

export const addToWishlist = async (movie: {
  movieId: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
}) => {
  const { data } = await api.post("/wishlist", movie);
  return data;
};

export const removeFromWishlist = async (movieId: number) => {
  await api.delete(`/wishlist/${movieId}`);
};
