import express from "express";

import {
  getCart,
  addToCart,
  updateCart,
  removeCartItem
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/cart", getCart);

router.post("/cart/add", addToCart);

router.put("/cart/update", updateCart);

router.delete("/cart/item/:id", removeCartItem);

export default router;