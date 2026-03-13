"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAppContext } from "../../../context/AppContext";
import ImageCarousel from "../../../components/ImageCarousel";
import RecentlyViewed from "../../../components/RecentlyViewed";
import { CheckCircle } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { refreshCart, cart, refreshWishlist } = useAppContext();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [qtyToAdd, setQtyToAdd] = useState(1);

  const [addedIndicator, setAddedIndicator] = useState(false);
  const [wishlistIndicator, setWishlistIndicator] = useState(null);

  // --- Fetch product (side effect) ---
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.getProduct(id);
        setData(res);

        // Update recently viewed (latest first, max 10)
        const recentIds = JSON.parse(
          localStorage.getItem("recentlyViewed") || "[]",
        );
        const updatedIds = [id, ...recentIds.filter((rid) => rid !== id)].slice(
          0,
          10,
        );
        localStorage.setItem("recentlyViewed", JSON.stringify(updatedIds));
      } catch (err) {
        console.error("Failed to fetch product", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const product = data?.product ?? {};
  const images = data?.images ?? [];
  const specifications = data?.specifications ?? [];

  const MAX_PER_PRODUCT = 5;

  // existing quantity of this product in cart (0 if not present)
  const existingQty = useMemo(() => {
    if (!cart || !product?.id) return 0;
    const found = cart.items?.find(
      (it) => Number(it.productId) === Number(product.id),
    );
    return found ? Number(found.quantity) : 0;
  }, [cart, product?.id]);

  // normalize stock: if backend didn't return stock, treat as Infinity so UI doesn't block
  const stockVal =
    typeof product.stock !== "undefined" && product.stock !== null
      ? Number(product.stock)
      : Infinity;

  // remaining stock after considering existing items in cart
  const remainingStock =
    stockVal === Infinity ? Infinity : Math.max(0, stockVal - existingQty);

  // remaining allowed due to cart cap
  const remainingCartCap = Math.max(0, MAX_PER_PRODUCT - existingQty);

  // final max selectable quantity user can add now
  const maxSelectableQty = Math.min(
    remainingStock === Infinity ? remainingCartCap : remainingStock,
    remainingCartCap,
  );

  // keep qtyToAdd valid whenever limits change
  useEffect(() => {
    if (maxSelectableQty <= 0) {
      setQtyToAdd(0);
    } else {
      setQtyToAdd((prev) => {
        if (!prev || prev < 1) return 1;
        return Math.min(prev, maxSelectableQty);
      });
    }
  }, [maxSelectableQty]);

  // safe display images fallback
  const displayImages =
    images.length > 0 ? images : [{ id: "main", imageUrl: product.image }];

  // --- Early returns AFTER hooks ---
  if (loading) return <div className="p-8 text-center">Loading product...</div>;
  if (!data || !data.product)
    return <div className="p-8 text-center">Product not found.</div>;

  // --- Handlers ---
  const handleAddToCart = async () => {
    if (qtyToAdd <= 0) return;

    setAdding(true);

    try {
      const res = await api.addToCart(product.id, qtyToAdd);

      if (!res?.error) {
        setAddedIndicator(true);

        setTimeout(() => {
          setAddedIndicator(false);
        }, 2000);

        await refreshCart();
      }
    } catch (err) {
      console.error("Add to cart failed", err);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = () => {
    if (qtyToAdd <= 0) return;

    router.push(`/checkout?productId=${product.id}&qty=${qtyToAdd}`);
  };

  const handleAddToWishlist = async () => {
    try {
      const res = await api.addToWishlist(product.id);

      if (res?.message === "Already in wishlist") {
        setWishlistIndicator("exists");
      } else {
        setWishlistIndicator("added");
      }

      setTimeout(() => {
        setWishlistIndicator(null);
      }, 2000);

      if (refreshWishlist) await refreshWishlist();
    } catch (err) {
      console.error("Add to wishlist failed", err);
    }
  };

  // --- Render ---
  return (
    <div className="max-w-[1500px] mx-auto p-4 md:p-8 bg-white mt-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Images */}
        <div className="md:col-span-5">
          <ImageCarousel images={displayImages} productName={product.name} />
        </div>

        {/* Middle: Details */}
        <div className="md:col-span-4">
          <h1 className="text-2xl font-medium leading-tight mb-2">
            {product.name}
          </h1>
          <div className="text-sm text-[#007185] hover:underline cursor-pointer mb-2">
            Visit the Store
          </div>
          <hr className="my-3" />

          <div className="flex items-start gap-2 mb-4">
            <span className="text-xl mt-1">₹</span>
            <span className="text-3xl font-medium">
              {Number(product.price || 0).toFixed(2)}
            </span>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-1">About this item</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {specifications && specifications.length > 0 && (
            <div className="mt-4">
              <table className="w-full text-sm">
                <tbody>
                  {specifications.map((spec, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2 font-bold bg-gray-50 w-1/3 px-2">
                        {spec.name}
                      </td>
                      <td className="py-2 px-2">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Buy Box */}
        <div className="md:col-span-3">
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-medium mb-4">
              ₹{Number(product.price || 0).toFixed(2)}
            </div>

            <div
              className={`text-lg font-medium mb-4 ${product.stock > 0 ? "text-green-700" : "text-red-600"}`}
            >
              {product.stock > 0 ? (
                <>
                  In Stock
                  {product.stock <= 5 && (
                    <span className="text-orange-600 text-sm ml-2">
                      (Only {product.stock} left!)
                    </span>
                  )}
                </>
              ) : (
                "Out of Stock"
              )}
            </div>

            {/* Quantity selector */}
            <div className="mb-3">
              {maxSelectableQty > 0 ? (
                <div className="inline-block relative">
                  <select
                    value={qtyToAdd}
                    onChange={(e) => setQtyToAdd(Number(e.target.value))}
                    className="
                      appearance-none
                      bg-gray-100
                      border border-gray-300
                      rounded-md
                      px-3 py-1.5 pr-7
                      text-sm
                      shadow-sm
                      cursor-pointer
                      hover:bg-gray-200
                      focus:outline-none
                    "
                  >
                    {/* Label shown when closed */}
                    <option value={qtyToAdd}>Qty: {qtyToAdd}</option>

                    {/* Actual dropdown values */}
                    {Array.from(
                      { length: maxSelectableQty },
                      (_, i) => i + 1,
                    ).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>

                  {/* Amazon-like arrow */}
                  <div className="pointer-events-none absolute right-2 top-1.5 text-gray-600 text-xs">
                    ▾
                  </div>
                </div>
              ) : (
                <div className="text-xs text-red-600">
                  Maximum quantity reached in your cart
                </div>
              )}
            </div>

            {/* added indicator */}
            <div className="h-6 flex items-center justify-center mb-2">
              {addedIndicator && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle size={18} className="text-green-700" />
                  <span className="text-sm">Added to cart</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                disabled={adding || maxSelectableQty <= 0}
                className="w-full bg-[#ffd814] hover:bg-[#f7bc19] rounded-full py-2 shadow-sm disabled:opacity-60"
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={adding || maxSelectableQty <= 0}
                className="w-full bg-[#ffa41c] hover:bg-[#ff6e21] rounded-full py-2 shadow-sm disabled:opacity-60"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-4">
              <button
                onClick={handleAddToWishlist}
                className="w-full border border-gray-200 rounded py-2 text-sm hover:bg-gray-50"
              >
                Add to Wish List
              </button>

              <div className="h-5 flex items-center justify-center mt-2">
                {wishlistIndicator && (
                  <div className="flex items-center gap-2 text-sm">
                    {wishlistIndicator === "added" ? (
                      <span className="text-green-700">Added to wishlist</span>
                    ) : (
                      <span className="text-yellow-700">
                        Already in wishlist
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Ships from</span>
                <span>Amazon Clone</span>
              </div>
              <div className="flex justify-between">
                <span>Sold by</span>
                <span>Amazon Clone</span>
              </div>
              <div className="flex justify-between">
                <span>Returns</span>
                <span className="text-[#007185]">Eligible for Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recently viewed */}
      <div className="max-w-[1500px] mx-auto px-4 mt-6">
        <RecentlyViewed max={6} />
      </div>
    </div>
  );
}
