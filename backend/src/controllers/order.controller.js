import {
  orders,
  orderItems,
  cartItems,
  carts,
  products,
  productImages,
  addresses,
} from "../db/schema.js";
import { db } from "../db/index.js";
import { eq, and, inArray } from "drizzle-orm";
import { USER_ID } from "../utils/constants.js";
import { sendOrderConfirmationEmail } from "../services/email.service.js";

export const getOrders = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, USER_ID))
      .orderBy(orders.createdAt);

    if (!result.length) return res.json([]);

    const orderIds = result.map((o) => o.id);

    const items = await db
      .select({
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        name: orderItems.productName,
        price: orderItems.price,
        quantity: orderItems.quantity,
        image: productImages.imageUrl,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.displayOrder, 1),
        ),
      )
      .where(inArray(orderItems.orderId, orderIds));

    const ordersWithItems = result.map((order) => ({
      ...order,
      items: items.filter((i) => i.orderId === order.id),
    }));

    res.json(ordersWithItems);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    // read address snapshot directly from orders table (no join)
    const orderRows = await db
      .select({
        id: orders.id,
        createdAt: orders.createdAt,
        totalAmount: orders.totalAmount,
        status: orders.status,

        name: orders.name,
        phone: orders.phone,
        email: orders.email,
        addressLine1: orders.addressLine1,
        addressLine2: orders.addressLine2,
        city: orders.city,
        state: orders.state,
        postalCode: orders.postalCode,
        country: orders.country,
      })
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!orderRows.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = await db
      .select({
        id: orderItems.id,
        productId: products.id,
        name: products.name,
        price: orderItems.price,
        quantity: orderItems.quantity,
        image: productImages.imageUrl,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.displayOrder, 1),
        ),
      )
      .where(eq(orderItems.orderId, orderId));

    const o = orderRows[0];

    res.json({
      order: {
        id: o.id,
        createdAt: o.createdAt,
        totalAmount: o.totalAmount,
        status: o.status,
      },
      address: {
        name: o.name,
        phone: o.phone,
        email: o.email,
        addressLine1: o.addressLine1,
        addressLine2: o.addressLine2,
        city: o.city,
        state: o.state,
        postalCode: o.postalCode,
        country: o.country,
      },
      items,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

export const checkout = async (req, res) => {
  try {
    const { addressId, productId: rawProductId, qty: rawQty } = req.body;

    const productId = rawProductId ? Number(rawProductId) : null;
    const qty = rawQty ? Number(rawQty) : null;

    // validate address
    const addrRows = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, addressId));
    if (!addrRows.length)
      return res.status(400).json({ error: "Invalid address" });
    const addr = addrRows[0];

    let items = [];
    let total = 0;

    if (productId) {
      // BUY NOW path: use single product and qty from body
      if (!qty || qty <= 0) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      // fetch product
      const prodRows = await db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          stock: products.stock,
        })
        .from(products)
        .where(eq(products.id, productId));

      if (!prodRows.length) {
        return res.status(400).json({ error: "Product not found" });
      }

      const p = prodRows[0];

      if (typeof p.stock === "number" && qty > Number(p.stock)) {
        return res
          .status(400)
          .json({ error: `Insufficient stock for ${p.name}` });
      }

      total = Number(p.price) * qty;

      items = [
        {
          productId: p.id,
          productName: p.name,
          price: p.price,
          quantity: qty,
        },
      ];
    } else {
      // CART checkout path: load cart + its items
      const cart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, USER_ID));
      if (!cart.length) return res.status(400).json({ error: "Cart is empty" });

      const cartItemsRows = await db
        .select({
          productId: products.id,
          productName: products.name,
          price: products.price,
          stock: products.stock,
          quantity: cartItems.quantity,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cart[0].id));

      if (!cartItemsRows.length) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      // validate stock and compute total
      for (const it of cartItemsRows) {
        if (typeof it.stock === "number" && it.quantity > Number(it.stock)) {
          return res
            .status(400)
            .json({ error: `Insufficient stock for ${it.productName}` });
        }
        total += Number(it.price) * it.quantity;
      }

      items = cartItemsRows.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        price: it.price,
        quantity: it.quantity,
      }));
    }

    // insert order with address snapshot fields
    const order = await db
      .insert(orders)
      .values({
        userId: USER_ID,
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
      })
      .returning();

    // insert order items and decrement stock
    for (const item of items) {
      await db.insert(orderItems).values({
        orderId: order[0].id,
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
      });

      // decrement stock
      const productRow = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId));
      if (productRow.length && typeof productRow[0].stock === "number") {
        await db
          .update(products)
          .set({ stock: Number(productRow[0].stock) - item.quantity })
          .where(eq(products.id, item.productId));
      }
    }

    // If this was a cart checkout, clear cart items. For Buy Now we do NOT touch the cart.
    if (!productId) {
      const cart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, USER_ID));
      if (cart.length) {
        await db.delete(cartItems).where(eq(cartItems.cartId, cart[0].id));
      }
    }

    // send confirmation email (non-blocking)
    sendOrderConfirmationEmail({
      email: addr.email,
      name: addr.name,
      orderId: order[0].id,
      items,
      total,
    }).catch(console.error);

    res.json({ orderId: order[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order failed" });
  }
};
