import { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getMovieDetails, getSimilarMovies } from "@/services/movies";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/services/wishlist";
import type { MovieDetails, MovieSummary } from "@/types/movie";

const MovieDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const router = useRouter();

  const [movie, setMovie] = useState<MovieDetails | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [similar, setSimilar] = useState<MovieSummary[]>([]);

  useEffect(() => {
    const movieId = Number(id);

    Promise.all([
      getMovieDetails(movieId),
      getWishlist(),
      getSimilarMovies(movieId),
    ])
      .then(([details, wishlist, similarData]) => {
        setMovie(details);
        setInWishlist(wishlist.some((w) => w.movieId === movieId));
        setSimilar(similarData.results);
      })
      .catch((err) => setError(err.message ?? "Something went wrong"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleWishlist = async () => {
    if (!movie || saving) return;
    setSaving(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(movie.id);
        setInWishlist(false);
      } else {
        await addToWishlist({
          movieId: movie.id,
          title: movie.title,
          posterPath: movie.posterUrl,
          releaseDate: movie.releaseYear,
          voteAverage: movie.rating,
        });
        setInWishlist(true);
      }
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? "Movie not found"}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {movie.backdropUrl ? (
        <Image
          source={{ uri: movie.backdropUrl }}
          style={styles.backdrop}
          resizeMode="cover"
        />
      ) : movie.posterUrl ? (
        <Image
          source={{ uri: movie.posterUrl }}
          style={styles.backdrop}
          resizeMode="cover"
          blurRadius={12}
        />
      ) : (
        <View style={[styles.backdrop, styles.backdropFallback]}>
          <Text style={styles.backdropFallbackText} numberOfLines={2}>
            {movie.title}
          </Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{movie.title}</Text>
        <Text style={styles.meta}>
          {movie.releaseYear ?? "—"} ·{" "}
          {movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : "—"}
          {movie.rating ? ` · ★ ${movie.rating}` : ""}
        </Text>
        <View style={styles.genreRow}>
          {movie.genres.map((g) => (
            <View key={g.id} style={styles.genreChip}>
              <Text style={styles.genreText}>{g.name}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={[
            styles.wishlistButton,
            inWishlist && styles.wishlistButtonActive,
          ]}
          onPress={toggleWishlist}
          disabled={saving}
        >
          <Text style={styles.wishlistText}>
            {saving
              ? "..."
              : inWishlist
                ? "✓ In Wishlist"
                : "+ Add to Wishlist"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.overview}>
          {movie.overview || "No overview available."}
        </Text>
      </View>
      { similar.length > 0 && (
        <View style={styles.similarSection}>
          <Text style={styles.similarLabel}>You might also like</Text>
          <FlatList
            data={similar}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.similarList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.similarCard}
                onPress={() => router.push({  pathname: '/movie/[id]', params: { id: item.id }})}
              >
                {item.posterUrl ? (
                  <Image
                    source={{ uri: item.posterUrl }}
                    style={styles.similarPoster}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[styles.similarPoster, styles.similarPosterFallback]}
                  >
                    <Text style={styles.similarFallbackText} numberOfLines={3}>
                      {item.title}
                    </Text>
                  </View>
                )}
                <Text style={styles.similarTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
  },
  backdrop: { width: "100%", height: 220 },
  content: { padding: 16 },
  title: { color: "#fff", fontSize: 22, fontWeight: "700" },
  meta: { color: "#999", fontSize: 13, marginTop: 4 },
  genreRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, gap: 8 },
  genreChip: {
    backgroundColor: "#222",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  genreText: { color: "#ccc", fontSize: 12 },
  wishlistButton: {
    marginTop: 16,
    backgroundColor: "#222",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  wishlistButtonActive: { backgroundColor: "#2a5" },
  wishlistText: { color: "#fff", fontWeight: "600" },
  overview: { color: "#ccc", fontSize: 14, lineHeight: 20, marginTop: 16 },
  errorText: { color: "#f66", textAlign: "center", marginBottom: 12 },
  backButton: { padding: 8 },
  backText: { color: "#4af" },
  backdropFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 24,
  },
  backdropFallbackText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  similarSection: { marginTop: 20, paddingHorizontal: 16, marginBottom: 24 },
  similarLabel: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 10 },
  similarList: { paddingRight: 16 },
  similarCard: { width: 110, marginRight: 12 },
  similarPoster: {
    width: 110,
    height: 165,
    borderRadius: 8,
    backgroundColor: "#222",
  },
  similarPosterFallback: {
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  similarFallbackText: { color: "#999", textAlign: "center", fontSize: 10 },
  similarTitle: { color: "#ccc", fontSize: 12, marginTop: 6 },
});

export default MovieDetailsScreen;
