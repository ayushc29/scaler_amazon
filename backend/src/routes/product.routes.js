import express from "express";

import {
  getCategories,
  getProducts,
  getProductDetail,
  getProductsByIds
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/categories", getCategories);

router.get("/products", getProducts);

router.get("/products/ids", getProductsByIds);

router.get("/products/:id", getProductDetail);

export default router;