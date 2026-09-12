# Movie Discovery App

A movie discovery application built for the Full-Stack Intern take-home assignment.

## Structure

- `client/` — React Native (Expo) app
- `server/` — Node.js/Express/TypeScript API, acts as an abstraction layer over TMDB

See `client/README.md` and `server/README.md` for setup instructions and details specific to each part.

## Approach

Built backend-first as an abstraction layer over TMDB, testing each endpoint
(browse, search, details, genres, wishlist) independently before touching
the client, so the frontend was always working against a known-good API.
The client was then built screen by screen — Browse, Search, Movie Details,
Wishlist — with edge cases (network failures, rapid filter/search changes,
empty results, app restarts) tested as each screen was completed rather
than saved for the end. Trending suggestions and similar-movie
recommendations were added afterward to make sure no screen in the app was
ever left blank.

## Features

- Browse movies without searching, with category filters and sort options
- Search with debounced input and cancellation of stale in-flight requests
- Trending suggestions shown on the Search tab before typing
- Movie details with overview, genres, and similar movie recommendations
- Persistent wishlist that survives closing and reopening the app
- Loading, empty, and error states (with retry) across every screen
- Backend caching (Redis) and retry/backoff for the third-party API

## Tech Stack

- Frontend: React Native, Expo, Expo Router, TypeScript
- Backend: Node.js, Express, TypeScript, PostgreSQL (Drizzle ORM), Redis
- External API: TMDB

## AI Usage

Used AI to scaffold boilerplate, debug environment/network issues, and review
architectural decisions during development. Application behavior, technical
decisions, and final implementation were reviewed and understood before
being committed.

## Assumptions

- No user accounts in scope; wishlist is scoped to a device-generated ID
  rather than a real multi-user account system.

## Known limitations / would improve with more time

- Device-based identity instead of real auth
- No automated tests yet
- Only tested on one screen size/emulator; broader device testing not done
- No request-level rate limiting on the backend's own API (only caching of
  TMDB calls)