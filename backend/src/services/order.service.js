import { db } from "../db/index.js";
import {
  orders, orderItems, cartItems, carts, products, addresses
} from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { sendOrderConfirmationEmail } from "./email.service.js";

export const processCheckoutTransaction = async ({ userId, addressId, productId, qty }) => {
  // Wrap the entire checkout process in a database transaction (ACID)
  return await db.transaction(async (tx) => {
    
    // 1. Fetch Address
    const addrRows = await tx.select().from(addresses).where(eq(addresses.id, addressId));
    if (!addrRows.length) throw new Error("Invalid address");
    const addr = addrRows[0];

    let items =[];
    let total = 0;
    let cartId = null;

    if (productId) {
      // --- BUY NOW CHECKOUT ---
      if (!qty || qty <= 0) throw new Error("Invalid quantity");

      const prodRows = await tx.select().from(products).where(eq(products.id, productId));
      if (!prodRows.length) throw new Error("Product not found");
      
      const p = prodRows[0];
      if (p.stock < qty) throw new Error(`Insufficient stock for ${p.name}`);

      total = Number(p.price) * qty;
      items =[{
        productId: p.id,
        productName: p.name,
        price: p.price,
        quantity: qty,
      }];
    } else {
      // --- CART CHECKOUT ---
      const cartRows = await tx.select().from(carts).where(eq(carts.userId, userId));
      if (!cartRows.length) throw new Error("Cart is empty");
      cartId = cartRows[0].id;

      const cartItemsRows = await tx
        .select({
          productId: products.id,
          productName: products.name,
          price: products.price,
          stock: products.stock,
          quantity: cartItems.quantity,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cartId));

      if (!cartItemsRows.length) throw new Error("Cart is empty");

      for (const it of cartItemsRows) {
        if (it.quantity > it.stock) throw new Error(`Insufficient stock for ${it.productName}`);
        total += Number(it.price) * it.quantity;
      }

      items = cartItemsRows.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        price: it.price,
        quantity: it.quantity,
      }));
    }

    // 2. Create Order
    const order = await tx.insert(orders).values({
      userId,
      name: addr.name,
      phone: addr.phone,
      email: addr.email,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      totalAmount: total,
    }).returning();

    const orderId = order[0].id;

    // 3. Insert Order Items & Safely Decrement Stock
    for (const item of items) {
      await tx.insert(orderItems).values({
        orderId,
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
      });

      // ACID Consistency: We update using SQL math and verify stock hasn't changed concurrently
      const updatedProduct = await tx.update(products)
        .set({ stock: sql`${products.stock} - ${item.quantity}` })
        .where(
          and(
            eq(products.id, item.productId),
            sql`${products.stock} >= ${item.quantity}` // Prevents negative stock
          )
        ).returning();

      // If the update affected 0 rows, a race condition happened. Rollback the transaction!
      if (!updatedProduct.length) {
        throw new Error(`Concurrency error: Insufficient stock for ${item.productName}`);
      }
    }

    // 4. Clear Cart
    if (!productId && cartId) {
      await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
    }

    sendOrderConfirmationEmail({
      email: addr.email,
      name: addr.name,
      orderId,
      items,
      total,
    }).catch(console.error);

    return orderId;
  });
};