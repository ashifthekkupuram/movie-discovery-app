import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  real,
  unique,
} from "drizzle-orm/pg-core";

export const wishlist = pgTable(
  "wishlist",
  {
    id: serial("id").primaryKey(),
    deviceId: text("device_id").notNull(),
    movieId: integer("movie_id").notNull(),
    title: text("title").notNull(),
    posterPath: text("poster_path"),
    releaseDate: text("release_date"),
    vote_average: real("vote_average"),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => ({
    uniquePerDevice: unique().on(table.deviceId, table.movieId),
  }),
);

export type WishlistRow = typeof wishlist.$inferSelect
export type NewWishlistRow = typeof wishlist.$inferInsert
