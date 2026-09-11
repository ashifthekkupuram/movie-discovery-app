CREATE TABLE "wishlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"movie_id" integer NOT NULL,
	"title" text NOT NULL,
	"poster_path" text,
	"release_date" text,
	"vote_average" real,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_device_id_movie_id_unique" UNIQUE("device_id","movie_id")
);
