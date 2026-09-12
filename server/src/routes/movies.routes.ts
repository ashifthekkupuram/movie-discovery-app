import { Router } from "express";

import {
  browseMovies,
  getGenres,
  getMovieDetails,
  getSimilarMovies,
  getTrending,
  search,
} from "../controllers/movies.controller.js";

const moviesRouter = Router();

moviesRouter.get("/browse", browseMovies);
moviesRouter.get("/trending", getTrending);
moviesRouter.get("/search", search);
moviesRouter.get("/genres", getGenres);
moviesRouter.get("/:id/similar", getSimilarMovies);
moviesRouter.get("/:id", getMovieDetails);

export { moviesRouter }


