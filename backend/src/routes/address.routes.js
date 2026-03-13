import express from "express";

import {
  createAddress,
  getAddresses,
  deleteAddress
} from "../controllers/address.controller.js";

const router = express.Router();

router.post("/addresses", createAddress);

router.get("/addresses", getAddresses);

router.delete("/addresses/:id", deleteAddress);

export default router;