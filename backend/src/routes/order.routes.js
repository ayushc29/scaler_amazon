import express from "express";

import {
  checkout,
  getOrders,
  getOrderById
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/orders/checkout", checkout);

router.get("/orders", getOrders);

router.get("/orders/:id", getOrderById);

export default router;