import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import type { MovieSummary } from "@/types/movie";

type MovieCardProps = {
  movie: MovieSummary;
  onPress: () => void;
};

const MovieCard = ({ movie, onPress }: MovieCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.posterWrap}>
        {movie.posterUrl ? (
          <Image
            source={{ uri: movie.posterUrl }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.poster, styles.posterFallback]}>
            <Text style={styles.fallbackText} numberOfLines={3}>
              {movie.title}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {movie.title}
      </Text>
      <Text style={styles.meta}>
        {movie.releaseYear ?? "-"}
        {movie.rating ? ` · ★ ${movie.rating}` : ""}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { width: "48%", marginBottom: 16 },
  posterWrap: {
    aspectRatio: 2 / 3,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#222",
  },
  poster: { width: "100%", height: "100%" },
  posterFallback: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  fallbackText: { color: "#999", textAlign: "center", fontSize: 12 },
  title: { color: "#fff", fontSize: 13, fontWeight: "600", marginTop: 6 },
  meta: { color: "#999", fontSize: 11, marginTop: 2 },
});

export default MovieCard;
