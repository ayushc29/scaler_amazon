import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    price: numeric("price").notNull(),
    stock: integer("stock").notNull(),
    categoryId: integer("category_id").references(() => categories.id),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("idx_products_category_id").on(t.categoryId)],
);

export const specificationDefinitions = pgTable("specification_definitions", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  displayOrder: integer("display_order").default(0),
});

export const productSpecifications = pgTable(
  "product_specifications",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .references(() => products.id)
      .notNull(),
    specId: integer("spec_id")
      .references(() => specificationDefinitions.id)
      .notNull(),
    value: text("value").notNull(),
  },
  (t) => [index("idx_product_specs_product_id").on(t.productId)],
);

export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").references(() => products.id),
    imageUrl: text("image_url").notNull(),
    displayOrder: integer("display_order").default(0),
  },
  (t) => [index("idx_product_images_product_id").on(t.productId)],
);

export const carts = pgTable(
  "carts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [unique("unq_cart_user").on(t.userId)],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    cartId: integer("cart_id").references(() => carts.id),
    productId: integer("product_id").references(() => products.id),
    quantity: integer("quantity").notNull(),
  },
  (t) => [unique("unq_cart_product").on(t.cartId, t.productId)],
);

export const addresses = pgTable(
  "addresses",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    name: text("name"),
    phone: text("phone"),
    email: text("email"),
    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    country: text("country"),
  },
  (t) => [index("idx_addresses_user_id").on(t.userId)],
);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    name: text("name"),
    phone: text("phone"),
    email: text("email"),
    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    country: text("country"),
    totalAmount: numeric("total_amount"),
    status: text("status").default("PLACED"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("idx_orders_user_id").on(t.userId),
    index("idx_orders_created_at").on(t.createdAt),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").references(() => orders.id),
    productId: integer("product_id"),
    productName: text("product_name"),
    price: numeric("price"),
    quantity: integer("quantity"),
  },
  (t) => [index("idx_order_items_order_id").on(t.orderId)],
);

export const wishlists = pgTable(
  "wishlists",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
  },
  (t) => [unique("unq_wishlist_user").on(t.userId)],
);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: serial("id").primaryKey(),
    wishlistId: integer("wishlist_id").references(() => wishlists.id),
    productId: integer("product_id").references(() => products.id),
  },
  (t) => [unique("unq_wishlist_product").on(t.wishlistId, t.productId)],
);