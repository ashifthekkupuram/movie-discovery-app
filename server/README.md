# Movie Discovery Backend

Node.js/Express/TypeScript API that sits between the client and TMDB. The
client never talks to TMDB directly; every response is normalized into the
app's own shape (see `src/types/movie.ts`).

## Setup

1. Copy `.env.example` to `.env` and fill in `TMDB_ACCESS_TOKEN` (TMDB v4
   read access token, not the v3 API key) and your local `DATABASE_URL` /
   `REDIS_URL`.
2. Start Postgres and Redis locally if you don't already have them running,
   e.g. with Docker:
   ```
   docker run -d --name movie-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=movie_discovery postgres:16-alpine
   docker run -d --name redis -p 6379:6379 redis:alpine
   ```
3. `npm install`
4. `npm run db:generate && npm run db:migrate`
5. `npm run dev` — starts on `http://localhost:4000`

## Endpoints

Movies:
- `GET /api/movies/browse?page=&genreId=&sortBy=` — popular by default, or
  filtered/sorted discovery when `genreId`/`sortBy` are present
- `GET /api/movies/trending` — daily trending movies, used for Search's
  pre-typing suggestions
- `GET /api/movies/search?q=&page=`
- `GET /api/movies/:id`
- `GET /api/movies/:id/similar` — related movies shown on the details screen
- `GET /api/movies/genres`

Wishlist (all require an `X-Device-Id` header):
- `GET /api/wishlist`
- `POST /api/wishlist` — body: `movieId`, `title`, `posterPath`,
  `releaseDate`, `voteAverage`
- `DELETE /api/wishlist/:movieId`

## Key decisions

- Abstraction layer: controllers never expose raw TMDB fields; everything
  goes through `tmdb.service.ts`'s normalizers.
- Caching: Redis, keyed by endpoint + params, list TTL 5min / details TTL
  30min / trending 1h / genres 24h. Absorbs repeated identical requests and
  keeps us under TMDB's rate limit. Cache read/write failures fall through
  to a live fetch rather than breaking the request.
- Retries: TMDB calls retry transient failures (timeouts, 429, 5xx) with
  exponential backoff; 4xx errors fail fast since retrying won't help.
- Wishlist identity: no auth in scope. The client generates a device UUID on
  first launch and sends it as `X-Device-Id`, and the wishlist is scoped to
  that. This is a deliberate simplification given the timeline, not meant to
  represent real multi-device user accounts.
- Wishlist persistence: rows store a snapshot of title/poster/rating instead
  of only a movie ID, so the wishlist still renders correctly even if TMDB is
  slow or temporarily unreachable.
- Trending vs Browse use different TMDB endpoints (`/trending/movie/day` vs
  `/movie/popular` / `/discover/movie`) so Search's suggestions and Browse's
  grid show genuinely different content rather than duplicating each other.

## Known limitations / would improve with more time

- Device-based identity instead of real auth.
- No request-level rate limiting on our own API (only caching of TMDB calls).
- No automated tests yet — would add integration tests for the controllers
  and a contract test against the TMDB normalizer.