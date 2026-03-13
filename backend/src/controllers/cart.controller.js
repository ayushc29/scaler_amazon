import { db } from "../db/index.js";
import { carts, cartItems, products, productImages } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { USER_ID } from "../utils/constants.js";
import { addToCartTransaction } from "../services/cart.service.js";

export const getCart = async (req, res) => {
  try {
    const cart = await db.select().from(carts).where(eq(carts.userId, USER_ID));

    if (!cart.length) {
      return res.json({ items: [], subtotal: 0 });
    }

    const items = await db
      .select({
        cartItemId: cartItems.id,
        productId: products.id,
        name: products.name,
        price: products.price,
        quantity: cartItems.quantity,
        image: productImages.imageUrl,
        stock: products.stock,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.displayOrder, 1),
        ),
      )
      .where(eq(cartItems.cartId, cart[0].id));

    let subtotal = 0;

    items.forEach((i) => {
      subtotal += Number(i.price) * i.quantity;
    });

    res.json({ items, subtotal });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    const result = await addToCartTransaction(USER_ID, productId, quantity);
    
    return res.json({ message: "Added to cart", ...result });
  } catch (err) {
    console.error(err);
    if (err.message.includes("not found") || err.message.includes("Insufficient") || err.message.includes("maximum")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to add to cart" });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;
    const q = Math.max(1, Math.floor(Number(quantity) || 1));
    const MAX_PER_PRODUCT = 5;

    // fetch the cart item and product to validate
    const itemRows = await db.select().from(cartItems).where(eq(cartItems.id, cartItemId));
    if (!itemRows.length) return res.status(404).json({ error: "Cart item not found" });

    const item = itemRows[0];
    const prodRows = await db.select().from(products).where(eq(products.id, item.productId));
    if (!prodRows.length) return res.status(404).json({ error: "Product not found" });

    const product = prodRows[0];
    const stock = Number(product.stock || 0);

    // clamp to stock and MAX_PER_PRODUCT
    const clamped = Math.min(q, stock, MAX_PER_PRODUCT);
    if (clamped < q) {
      // inform caller that quantity was clamped
      await db.update(cartItems).set({ quantity: clamped }).where(eq(cartItems.id, cartItemId));
      return res.json({ message: "Cart updated (clamped to stock/cap)", quantity: clamped });
    }

    await db.update(cartItems).set({ quantity: clamped }).where(eq(cartItems.id, cartItemId));
    res.json({ message: "Cart updated", quantity: clamped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update cart" });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await db.delete(cartItems).where(eq(cartItems.id, id));

    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item" });
  }
};
