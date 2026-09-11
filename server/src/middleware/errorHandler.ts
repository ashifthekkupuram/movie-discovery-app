import type { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";

import { UpstreamError } from "../services/tmdb.service.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
    if(err instanceof ZodError){
        return res.status(400).json({ error: "Invalid Request", details: z.treeifyError(err) })
    }

    if(err instanceof UpstreamError){
        return res.status(err.status).json({ error: err.message });
    }

    console.error("[unhandled error]", err);
  return res.status(500).json({ error: "Something went wrong. Please try again." });
};