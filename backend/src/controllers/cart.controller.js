import { db } from "../db/index.js";
import { carts, cartItems, products, productImages } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { USER_ID } from "../utils/constants.js";

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
    const q = Math.max(1, Math.floor(Number(quantity) || 1));
    const MAX_PER_PRODUCT = 5;

    // ensure cart exists
    let cart = await db.select().from(carts).where(eq(carts.userId, USER_ID));
    if (!cart.length) {
      const newCart = await db.insert(carts).values({ userId: USER_ID }).returning();
      cart = newCart;
    }
    const cartId = cart[0].id;

    // fetch product (to check stock)
    const productRows = await db.select().from(products).where(eq(products.id, productId));
    if (!productRows.length) {
      return res.status(404).json({ error: "Product not found" });
    }
    const product = productRows[0];
    const availableStock = Number(product.stock || 0);

    // existing entry in cart
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));

    const currentQty = existing.length ? Number(existing[0].quantity || 0) : 0;

    // compute limits
    const allowedByCap = Math.max(0, MAX_PER_PRODUCT - currentQty);
    const allowedByStock = Math.max(0, availableStock - currentQty);
    const allowedToAdd = Math.min(q, allowedByCap, allowedByStock);

    if (allowedToAdd <= 0) {
      // Nothing can be added
      const reason =
        allowedByStock <= 0
          ? "Insufficient stock"
          : "Reached maximum allowed quantity (5)";
      return res.status(400).json({
        error: reason,
        added: 0,
        quantity: currentQty,
        allowedToAdd,
        allowedByStock,
        allowedByCap,
      });
    }

    if (existing.length) {
      const newQty = currentQty + allowedToAdd;
      await db.update(cartItems).set({ quantity: newQty }).where(eq(cartItems.id, existing[0].id));
      return res.json({ message: "Added to cart", added: allowedToAdd, quantity: newQty });
    } else {
      await db.insert(cartItems).values({ cartId, productId, quantity: allowedToAdd });
      return res.json({ message: "Added to cart", added: allowedToAdd, quantity: allowedToAdd });
    }
  } catch (err) {
    console.error(err);
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
