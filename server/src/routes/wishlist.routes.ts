import { Router } from "express";
import { requireDeviceId } from "../middleware/deviceId.js";
import { addToWishlist, listWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";

export const wishlistRouter = Router();

wishlistRouter.use(requireDeviceId);
wishlistRouter.get("/", listWishlist);
wishlistRouter.post("/", addToWishlist);
wishlistRouter.delete("/:movieId", removeFromWishlist);