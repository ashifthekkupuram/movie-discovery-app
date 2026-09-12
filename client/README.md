# Movie Discovery Client

React Native (Expo) app for browsing, searching, and saving movies. Talks
only to the backend in `server/` — never directly to TMDB.

## Setup

1. Make sure the backend is running first (see `server/README.md`).
2. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to your
   machine's address, e.g.:
   ```
   EXPO_PUBLIC_API_URL=http://<your-machine-ip>:4000/api
   ```
   Use your machine's LAN IP (not `localhost`) if testing on a physical
   device, or `10.0.2.2` if testing on an Android emulator. If your network
   changes (e.g. switching to a phone hotspot), update this and restart
   with the cache cleared (`npx expo start -c`), since Expo env vars are
   baked in at start time, not hot-reloaded.
3. `npm install`
4. `npx expo start`

## Screens

- **Browse** — movie grid with category filters and sort options, infinite
  scroll, pull-to-refresh, retry on error.
- **Search** — debounced search with in-flight request cancellation; shows
  trending movies as suggestions before the user types anything.
- **Movie details** — overview, genres, wishlist toggle, similar movies.
- **Wishlist** — saved movies, persisted on the backend so it survives
  closing and reopening the app.

## Key decisions

- **Identity**: no auth in scope. A device UUID is generated on first launch
  (`expo-secure-store`) and sent as `X-Device-Id` on wishlist requests.
- **Search**: input is debounced (400ms) and in-flight requests are
  cancelled via `AbortController` when the query changes before the
  previous request resolves, so stale results can't overwrite newer ones.
- **Browse filters**: the same cancellation pattern applies to
  category/sort changes — switching filters quickly won't show a flash of
  the previous filter's results.
- **Pagination**: results are de-duplicated by movie ID when appending
  pages, since TMDB doesn't guarantee no overlap between adjacent pages.
- **Fallbacks**: missing posters/backdrops fall back to a styled panel with
  the movie title rather than a blank space; movies with no similar-movie
  results simply omit that section rather than showing an empty one.

## Known limitations / would improve with more time

- Only tested on one screen size/emulator; broader device testing not done.
- Wishlist status on the details screen is re-fetched from the full
  wishlist on every screen open rather than using shared state — fine at
  this scale, would revisit with a proper data-fetching/cache layer
  (e.g. React Query) if the app grew.