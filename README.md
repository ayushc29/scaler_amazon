# Amazon Clone (Next.js + Express + Drizzle)

A full-stack **Amazon-like e-commerce application** built using **Next.js**, **Node.js**, **Express.js**, **Neon PostgreSQL**, and **Drizzle ORM**.

The project demonstrates core e-commerce features such as product browsing, search, cart management, wishlist, order placement, and checkout.

---

## Quick Start

### 1) Clone repository

```bash
git clone <repository-url>
cd amazon-clone
```

---

## Project Structure

```
amazon-clone/
├── backend/
│   ├── drizzle/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── controllers/
│   │   │   ├── address.controller.js
│   │   │   ├── cart.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── product.controller.js
│   │   │   └── wishlist.controller.js
│   │   ├── db/
│   │   │   ├── index.js
│   │   │   ├── schema.js
│   │   │   └── seed.js
│   │   ├── routes/
│   │   │   ├── address.routes.js
│   │   │   ├── cart.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── product.routes.js
│   │   │   └── wishlist.routes.js
│   │   ├── services/
│   │   │   └── email.service.js
│   │   └── utils/
│   │       └── constants.js
│   ├── drizzle.config.js
│   ├── vercel.json
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── orders/
│   │   │   │   └── [id]/
│   │   │   ├── product/
│   │   │   │   └── [id]/
│   │   │   ├── wishlist/
│   │   │   ├── layout.js
│   │   │   └── page.js
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   │   └── api.js
│   │   └── styles/
│   │       └── globals.css
│   ├── public/
│   ├── next.config.js
│   ├── next.config.mjs
│   ├── package.json
│   └── .env.local
└── README.md
```

---

## Tech Stack

### Frontend
- **Next.js (App Router)**
- **React**
- **Tailwind CSS**
- **Next/Image optimization**

### Backend
- **Node.js**
- **Express.js**
- **Drizzle ORM**

### Database
- **Neon PostgreSQL**

### Other Tools
- **Resend Email API** (for order emails)
- **Local Storage** (recently viewed products)

---

## Backend Setup

### 1) Navigate to the backend folder

```bash
cd backend
```

### 2) Install dependencies

```bash
npm install
```

### 3) Create `.env`

```env
DATABASE_URL=postgresql://neondb_owner:npg_XXXXXXX@ep-calm-dew-a10m13yp-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=5000
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
EMAIL_FROM=orders@yourdomain.com
```

### 4) Start the backend server

```bash
npm run dev
```

The backend runs on:

```
http://localhost:5000
```

---

## Frontend Setup

### 1) Navigate to the frontend folder

```bash
cd frontend
```

### 2) Install dependencies

```bash
npm install
```

### 3) Create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4) Start the frontend server

```bash
npm run dev
```

The frontend runs on:

```
http://localhost:3000
```

---

## Important Implementation Notes

### Single User System

This project is designed as a **single-user** system (no authentication).

- The backend assumes a fixed user:

```js
const USER_ID = 1;
```

This simplifies cart, wishlist, and order handling.

---

## Database Schema (Drizzle)

The backend schema lives in `backend/src/db/schema.js` and defines the core tables used by the API.

### Tables

- **categories** — product categories
- **products** — product catalog + stock
- **product_images** — images for each product
- **specification_definitions** — spec metadata per category
- **product_specifications** — product-specific specs
- **carts** — user cart
- **cart_items** — cart line items
- **wishlists** — user wishlist container
- **wishlist_items** — wishlist line items
- **addresses** — saved shipping addresses
- **orders** — placed orders
- **order_items** — order line items

### Sample schema excerpt

```js
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  stock: integer("stock").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow()
});
```

---

## API Endpoints

All backend APIs are prefixed with:

```
/api
```

### Products

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/products` | List products (supports `search`, `category`, `page`, `limit`) |
| GET | `/api/products/:id` | Get product details (includes images + specs) |
| GET | `/api/products/ids?ids=1,2,3` | Get a list of products by IDs (used for recently viewed) |

### Cart

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/cart` | Get current cart items |
| POST | `/api/cart` | Add item to cart / increase quantity |
| PUT | `/api/cart` | Update quantity for an item |
| DELETE | `/api/cart/:id` | Remove item from cart |

### Wishlist

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/wishlist` | Get wishlist items |
| POST | `/api/wishlist` | Add product to wishlist |
| DELETE | `/api/wishlist/:productId` | Remove product from wishlist |

### Orders

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/checkout` | Place an order (creates order + order items, reduces stock, clears cart) |
| GET | `/api/orders` | Get all orders for the user |
| GET | `/api/orders/:id` | Get order details (includes items + shipping info) |

### Addresses

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/addresses` | Get saved addresses |
| POST | `/api/addresses` | Add a new shipping address |

---

## Frontend API Layer

The frontend communicates with the backend using a centralized API module:

- `frontend/lib/api.js`

### Example functions

- `api.getProducts()`
- `api.getProduct(id)`
- `api.getCart()`
- `api.addToCart(productId, quantity)`
- `api.updateCart(cartItemId, quantity)`
- `api.removeFromCart(cartItemId)`
- `api.getWishlist()`
- `api.addToWishlist(productId)`
- `api.removeFromWishlist(productId)`
- `api.getOrders()`
- `api.getOrder(id)`
- `api.checkout(addressId)`

---

## Features Implemented

### Home Page
- Hero banner carousel
- Deal cards
- Featured products grid
- Recently viewed section

### Product Page
- Image carousel with zoom
- Thumbnail hover switching
- Product details
- Specifications table
- Quantity selector
- Add to cart
- Buy now
- Wishlist

### Cart
- Update quantity
- Remove items
- Stock validation

### Orders
- Checkout
- Order history
- Order tracking UI
- Email Confirmation

### Wishlist
- Save products
- Remove products

---

## Author

Ayush Chauhan

---

## License

This project is for educational and demonstration purposes.