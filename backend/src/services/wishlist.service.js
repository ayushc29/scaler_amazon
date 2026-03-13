// src/services/wishlist.service.js
import { db } from "../db/index.js";
import { wishlists, wishlistItems } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export const addToWishlistTransaction = async (userId, productId) => {
  return await db.transaction(async (tx) => {
    // 1. Get or Create Wishlist Atomically
    let wishlistRows = await tx.select().from(wishlists).where(eq(wishlists.userId, userId));
    let wishlistId;
    
    if (!wishlistRows.length) {
      const newWishlist = await tx.insert(wishlists).values({ userId }).returning();
      wishlistId = newWishlist[0].id;
    } else {
      wishlistId = wishlistRows[0].id;
    }

    // 2. Check if already exists
    const exists = await tx.select().from(wishlistItems).where(
      and(
        eq(wishlistItems.wishlistId, wishlistId),
        eq(wishlistItems.productId, productId)
      )
    );

    if (exists.length) {
      return { message: "Already in wishlist" };
    }

    // 3. Insert Item
    await tx.insert(wishlistItems).values({ wishlistId, productId });
    return { message: "Added to wishlist" };
  });
};