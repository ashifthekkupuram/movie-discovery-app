import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { and, desc, eq, ne } from "drizzle-orm";

import { db } from "../db/index.js";
import { wishlist } from "../db/schema.js";

const addSchema = z.object({
  movieId: z.number().int().positive(),
  title: z.string().min(1),
  posterPath: z.string().nullable().optional(),
  releaseDate: z.string().nullable().optional(),
  voteAverage: z.number().nullable().optional(),
});

export const listWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deviceId = req.deviceId!;

    const rows = await db
      .select()
      .from(wishlist)
      .where(eq(wishlist.deviceId, deviceId))
      .orderBy(desc(wishlist.addedAt));

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deviceId = req.deviceId!;
    const body = addSchema.parse(req.body);

    const [row] = await db
      .insert(wishlist)
      .values({ deviceId, ...body })
      .onConflictDoNothing({ target: [wishlist.deviceId, wishlist.movieId] })
      .returning();

    res.status(201).json(row ?? { message: "Already in wishlist" });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deviceId = req.deviceId!;
    const movieId = Number(req.params.movieId);

    await db
      .delete(wishlist)
      .where(
        and(eq(wishlist.deviceId, deviceId), eq(wishlist.movieId, movieId)),
      );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
