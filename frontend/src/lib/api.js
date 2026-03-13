const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `API Error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/products${query ? `?${query}` : ""}`);
  },
  getProduct: (id) => fetchAPI(`/products/${id}`),
  getCategories: () => fetchAPI("/categories"),

  getCart: () => fetchAPI("/cart"),
  addToCart: (productId, quantity = 1) =>
    fetchAPI("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),
  updateCart: (cartItemId, quantity) =>
    fetchAPI("/cart/update", {
      method: "PUT",
      body: JSON.stringify({ cartItemId, quantity }),
    }),
  removeFromCart: (id) => fetchAPI(`/cart/item/${id}`, { method: "DELETE" }),

  getWishlist: () => fetchAPI("/wishlist"),
  addToWishlist: (productId) =>
    fetchAPI("/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
  removeFromWishlist: (productId) =>
    fetchAPI(`/wishlist/remove/${productId}`, { method: "DELETE" }),

  getAddresses: () => fetchAPI("/addresses"),
  addAddress: (address) =>
    fetchAPI("/addresses", {
      method: "POST",
      body: JSON.stringify(address),
    }),
  deleteAddress: (id) =>
    fetchAPI(`/addresses/${id}`, {
      method: "DELETE",
    }),

  checkout: (addressId, productId = null, qty = null) =>
    fetchAPI("/orders/checkout", {
      method: "POST",
      body: JSON.stringify(
        productId
          ? { addressId, productId, qty } // buy now
          : { addressId }, // cart checkout
      ),
    }),
  getOrders: () => fetchAPI("/orders"),
  getOrder: (id) => fetchAPI(`/orders/${id}`),
};
