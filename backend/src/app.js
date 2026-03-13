import express from "express";
import cors from "cors";

import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import addressRoutes from "./routes/address.routes.js";

const app = express();

app.use(
  cors({
    origin: [
      "https://scaler-amazon-one.vercel.app",
      "http://localhost:3000"
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.get("/",(res)=>{
    res.json({message: "Running..."});
});

app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", wishlistRoutes);
app.use("/api", addressRoutes);

export default app;