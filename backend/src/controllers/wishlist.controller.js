import { db } from "../db/index.js";
import {
  wishlists,
  wishlistItems,
  products,
  productImages,
} from "../db/schema.js";

import { eq, and } from "drizzle-orm";
import { USER_ID } from "../utils/constants.js";

export const getWishlist = async (req, res) => {

  try {
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, USER_ID));

    if (!wishlist.length) {
      return res.json([]);
    }

    const items = await db
      .selectDistinctOn([products.id], {
        productId: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
        image: productImages.imageUrl,
      })
      .from(wishlistItems)
      .leftJoin(products, eq(wishlistItems.productId, products.id))
      .leftJoin(productImages, eq(products.id, productImages.productId))
      .where(eq(wishlistItems.wishlistId, wishlist[0].id));

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, USER_ID));

    if (!wishlist.length) {
      const newWishlist = await db
        .insert(wishlists)
        .values({ userId: USER_ID })
        .returning();

      wishlist = newWishlist;
    }

    const exists = await db
      .select()
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.wishlistId, wishlist[0].id),
          eq(wishlistItems.productId, productId),
        ),
      );

    if (exists.length) {
      return res.json({ message: "Already in wishlist" });
    }

    await db.insert(wishlistItems).values({
      wishlistId: wishlist[0].id,
      productId,
    });

    res.json({ message: "Added to wishlist" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, USER_ID));

    if (!wishlist.length) {
      return res.json({ message: "Wishlist empty" });
    }

    await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.wishlistId, wishlist[0].id),
          eq(wishlistItems.productId, productId),
        ),
      );

    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item" });
  }
};
