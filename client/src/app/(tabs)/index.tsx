import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "expo-router";

import { browseMovies, getGenres } from "@/services/movies";
import MovieCard from "@/components/MovieCard";
import { MovieSummary, Genre } from "@/types/movie";
import axios from "axios";

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: "Popular", value: "popularity.desc" },
  { label: "Top Rated", value: "vote_average.desc" },
  { label: "Newest", value: "release_date.desc" },
  { label: "Title A-Z", value: "title.asc" },
];

export default function Index() {
  const router = useRouter();

  const [movies, SetMovies] = useState<MovieSummary[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("popularity.desc");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [genresLoading, setGenresLoading] = useState(true);

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const abortRef = useRef<AbortController | null>(null);

  const loadPage = useCallback(
    async (pageToLoad: number, replace: boolean = false) => {
      if (replace) {
        abortRef.current?.abort();
      }
      const controller = new AbortController();
      if (replace) {
        abortRef.current = controller;
      }

      try {
        const data = await browseMovies(
          {
            page: pageToLoad,
            genreId: selectedGenre ?? undefined,
            sortBy,
          },
          controller.signal,
        );
        SetMovies((prev) => {
          if (replace) return data.results;
          const existingIds = new Set(prev.map((m) => m.id));
          const newUnique = data.results.filter((m) => !existingIds.has(m.id));
          return [...prev, ...newUnique];
        });
        setTotalPages(data.totalPages);
        setError(null);
        setLoading(false);
        setLoadingMore(false);
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        if (replace) {
          SetMovies([]);
        }
        setError(err.message ?? "Something went wrong");
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedGenre, sortBy],
  );

  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch(() => {})
      .finally(() => setGenresLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    loadPage(1, true);
  }, [selectedGenre, sortBy]);

  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    setPage(nextPage);
    loadPage(nextPage);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPage(1, true);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {genresLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.chip, styles.chipSkeleton]} />
            ))}
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.chip, selectedGenre === null && styles.chipActive]}
              onPress={() => setSelectedGenre(null)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedGenre === null && styles.chipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre.id}
                style={[
                  styles.chip,
                  selectedGenre === genre.id && styles.chipActive,
                ]}
                onPress={() => setSelectedGenre(genre.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedGenre === genre.id && styles.chipTextActive,
                  ]}
                >
                  {genre.name}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortRow}
        contentContainerStyle={styles.filterContent}
      >
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortChip,
              sortBy === option.value && styles.chipActive,
            ]}
            onPress={() => setSortBy(option.value)}
          >
            <Text
              style={[
                styles.chipText,
                sortBy === option.value && styles.chipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : error && movies.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setPage(1);
              loadPage(1, true);
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>No movies found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setPage(1);
              loadPage(1, true);
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
              onPress={() =>
                router.push({
                  pathname: "/movie/[id]",
                  params: { id: item.id },
                })
              }
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color="#fff" style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
  },
  filterRow: { maxHeight: 44, marginTop: 8, flexGrow: 0, flexShrink: 0 },
  sortRow: {
    maxHeight: 40,
    marginTop: 10,
    marginBottom: 4,
    flexGrow: 0,
    flexShrink: 0,
  },
  filterContent: { paddingHorizontal: 12, gap: 8, alignItems: "center" },
  chip: {
    backgroundColor: "#222",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sortChip: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: "#fff" },
  chipText: { color: "#ccc", fontSize: 13 },
  chipTextActive: { color: "#111", fontWeight: "600" },
  list: { padding: 12 },
  row: { justifyContent: "space-between" },
  errorText: { color: "#f66", textAlign: "center", paddingHorizontal: 24 },
  retryButton: {
    marginTop: 12,
    backgroundColor: "#222",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  chipSkeleton: { width: 70, height: 34, backgroundColor: "#1a1a1a" },
});
