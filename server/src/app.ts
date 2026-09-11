import express from "express";
import cors from "cors";

import { moviesRouter } from "./routes/movies.routes.js";
import { wishlistRouter } from "./routes/wishlist.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/movies", moviesRouter);
app.use("/api/wishlist", wishlistRouter);

app.use(errorHandler);

export default app
