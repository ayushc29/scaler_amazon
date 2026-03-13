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
import { eq, and, inArray, desc } from "drizzle-orm";
import { USER_ID } from "../utils/constants.js";
import { processCheckoutTransaction } from "../services/order.service.js";

export const getOrders = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, USER_ID))
      .orderBy(desc(orders.createdAt));

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
    
    const orderId = await processCheckoutTransaction({
      userId: USER_ID,
      addressId,
      productId: rawProductId ? Number(rawProductId) : null,
      qty: rawQty ? Number(rawQty) : null,
    });

    res.json({ orderId });
  } catch (err) {
    console.error(err);
    // Return 400 for logical errors thrown by the transaction, otherwise 500
    res.status(err.message.includes("error") || err.message.includes("Insufficient") ? 400 : 500)
       .json({ error: err.message || "Order failed" });
  }
};