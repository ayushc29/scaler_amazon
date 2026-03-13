import { db } from "../db/index.js";
import { carts, cartItems, products } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export const addToCartTransaction = async (userId, productId, quantity) => {
  return await db.transaction(async (tx) => {
    const q = Math.max(1, Math.floor(Number(quantity) || 1));
    const MAX_PER_PRODUCT = 5;

    // 1. Get or Create Cart Atomically
    let cartRows = await tx.select().from(carts).where(eq(carts.userId, userId));
    let cartId;
    if (!cartRows.length) {
      const newCart = await tx.insert(carts).values({ userId }).returning();
      cartId = newCart[0].id;
    } else {
      cartId = cartRows[0].id;
    }

    // 2. Stock Check
    const productRows = await tx.select().from(products).where(eq(products.id, productId));
    if (!productRows.length) throw new Error("Product not found");
    const product = productRows[0];
    const availableStock = Number(product.stock || 0);

    // 3. Existing Item Check
    const existing = await tx.select().from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
    const currentQty = existing.length ? Number(existing[0].quantity || 0) : 0;

    const allowedByCap = Math.max(0, MAX_PER_PRODUCT - currentQty);
    const allowedByStock = Math.max(0, availableStock - currentQty);
    const allowedToAdd = Math.min(q, allowedByCap, allowedByStock);

    if (allowedToAdd <= 0) {
      throw new Error(allowedByStock <= 0 ? "Insufficient stock" : "Reached maximum allowed quantity (5)");
    }

    const newQty = currentQty + allowedToAdd;

    // 4. Update or Insert
    if (existing.length) {
      await tx.update(cartItems).set({ quantity: newQty }).where(eq(cartItems.id, existing[0].id));
    } else {
      await tx.insert(cartItems).values({ cartId, productId, quantity: allowedToAdd });
    }

    return { added: allowedToAdd, quantity: newQty };
  });
};