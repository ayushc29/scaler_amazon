import express from "express";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from "../controllers/wishlist.controller.js";

const router = express.Router();

router.get("/wishlist", getWishlist);

router.post("/wishlist/add", addToWishlist);

router.delete("/wishlist/remove/:productId", removeFromWishlist);

export default router;