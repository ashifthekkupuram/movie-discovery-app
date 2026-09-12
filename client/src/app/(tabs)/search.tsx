import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";

import { browseMovies, getTrending, searchMovies } from "@/services/movies";
import useDebounce from "@/hooks/useDebounce";
import MovieCard from "@/components/MovieCard";
import type { MovieSummary } from "@/types/movie";

const SearchScreen = () => {
  const router = useRouter();

  const [query, setQuery] = useState<string>("");

  const debouncedQuery = useDebounce(query, 400);

  const [results, setResults] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searched, setSearched] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  const [suggestions, setSuggestions] = useState<MovieSummary[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState<boolean>(true);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    abortRef.current?.abort();

    if (!trimmed) {
      setResults([]);
      setSearched(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    searchMovies(trimmed, 1, controller.signal)
      .then((data) => {
        setResults(data.results);
        setSearched(true);
      })
      .catch((err) => {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        setError(err.message ?? "Something went wrong");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    getTrending()
      .then((data) => setSuggestions(data.results))
      .catch(() => {})
      .finally(() => {
        setSuggestionsLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search movies..."
        placeholderTextColor="#666"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
      />

      {loading && <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />}

      {!loading && error && <Text style={styles.message}>{error}</Text>}

      {!loading && !error && searched && results.length === 0 && (
        <Text style={styles.message}>No movies found</Text>
      )}

      {!loading && !error && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
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
        />
      )}
      {!debouncedQuery.trim() && (
        <>
          <Text style={styles.sectionLabel}>Trending today</Text>
          {suggestionsLoading ? (
            <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => String(item.id)}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <MovieCard
                  movie={item}
                  onPress={() => router.push(`/movie/${item.id}`)}
                />
              )}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  input: {
    margin: 12,
    backgroundColor: "#222",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 15,
  },
  list: { paddingHorizontal: 12 },
  row: { justifyContent: "space-between" },
  message: { color: "#999", textAlign: "center", marginTop: 24 },
  sectionLabel: {
    color: "#999",
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 12,
  },
});

export default SearchScreen;
