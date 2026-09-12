import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { WishlistItem } from "@/services/wishlist";

type WishlistCardProps = {
  wishlist: WishlistItem;
  onPress: () => void;
  handleRemove: () => void;
};

const WishlistCard = ({
  wishlist,
  onPress,
  handleRemove,
}: WishlistCardProps) => {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      {wishlist.posterPath ? (
        <Image
          source={{ uri: wishlist.posterPath }}
          style={styles.poster}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.poster, styles.posterFallback]} />
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {wishlist.title}
        </Text>
        <Text style={styles.meta}>
          {wishlist.releaseDate ?? "—"}{" "}
          {wishlist.voteAverage ? `· ★ ${wishlist.voteAverage}` : ""}
        </Text>
      </View>
      <TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  poster: { width: 50, height: 75, borderRadius: 6, backgroundColor: "#222" },
  posterFallback: { backgroundColor: "#222" },
  info: { flex: 1, marginLeft: 10 },
  title: { color: "#fff", fontSize: 15, fontWeight: "600" },
  meta: { color: "#999", fontSize: 12, marginTop: 2 },
  removeButton: { paddingHorizontal: 10, paddingVertical: 6 },
  removeText: { color: "#f66", fontSize: 13 },
});

export default WishlistCard;
