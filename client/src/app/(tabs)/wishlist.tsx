import { useState, useCallback } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  getWishlist,
  removeFromWishlist,
  type WishlistItem,
} from "@/services/wishlist";

const WishlistScreen = () => {
  const router = useRouter();

  const [items, setItems] = useState<WishlistItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const load = useCallback(() => {
    setLoading(true);
    getWishlist()
      .then((data) => {
        setItems(data);
        setError(null);
      })
      .catch((err) => setError(err.message ?? "Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleRemove = async (movieId: number) => {
    const previous = items;
    setItems((prev) => prev.filter((item) => item.movieId !== movieId));
    try {
      await removeFromWishlist(movieId);
    } catch {
      setItems(previous);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Your wishlist is empty</Text>
        <Text style={styles.emptySubtext}>
          Movies you save will show up here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.movieId)}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              router.push({
                pathname: "/movie/[id]",
                params: { id: item.movieId },
              })
            }
          >
            {item.posterPath ? (
              <Image
                source={{ uri: item.posterPath }}
                style={styles.poster}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.poster, styles.posterFallback]} />
            )}
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.meta}>
                {item.releaseDate ?? "—"}{" "}
                {item.voteAverage ? `· ★ ${item.voteAverage}` : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleRemove(item.movieId)}
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
  },
  container: { flex: 1, backgroundColor: "#111" },
  list: { padding: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  info: { flex: 1, marginLeft: 10 },
  title: { color: "#fff", fontSize: 15, fontWeight: "600" },
  meta: { color: "#999", fontSize: 12, marginTop: 2 },
  removeButton: { paddingHorizontal: 10, paddingVertical: 6 },
  removeText: { color: "#f66", fontSize: 13 },
  errorText: { color: "#f66", textAlign: "center", paddingHorizontal: 24 },
  emptyText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  emptySubtext: { color: "#999", fontSize: 13, marginTop: 4 },
  poster: { width: 50, height: 75, borderRadius: 6, backgroundColor: "#222" },
  posterFallback: { backgroundColor: "#222" },
  retryButton: {
    marginTop: 12,
    backgroundColor: "#222",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "600" },
});

export default WishlistScreen;
