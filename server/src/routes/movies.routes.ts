import { Router } from "express";

import {
  browseMovies,
  getGenres,
  getMovieDetails,
  search,
} from "../controllers/movies.controller.js";

const moviesRouter = Router();

moviesRouter.get("/browse", browseMovies);
moviesRouter.get("/search", search);
moviesRouter.get("/genres", getGenres);
moviesRouter.get("/:id", getMovieDetails);

export { moviesRouter }


