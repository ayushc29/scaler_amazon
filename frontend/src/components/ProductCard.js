"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, CheckCircle } from "lucide-react";
import { api } from "../lib/api";
import { useAppContext } from "../context/AppContext";
import { useState, useMemo } from "react";

export default function ProductCard({ product, variant = "home" }) {
  const { refreshCart, cart, wishlist, refreshWishlist } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [addedIndicator, setAddedIndicator] = useState(false);

  const productId = product.productId ?? product.id;

  // existing quantity of this product in cart (0 if not present)
  const existingQty = useMemo(() => {
    const found = cart?.items?.find(it => Number(it.productId) === Number(productId));
    return found ? Number(found.quantity) : 0;
  }, [cart, productId]);

  // product.stock may be undefined if API didn't include it
  const stock = typeof product.stock !== "undefined" ? Number(product.stock) : null;
  const remainingStock = stock === null ? null : Math.max(0, stock - existingQty);

  const isWishlisted = wishlist?.some(item => (item.productId ?? item.id) === productId);

  const isOutOfStock = stock !== null ? stock <= 0 : false; // if no stock info, don't show OOS
  const lowStockWarning = stock !== null && stock <= 5 && stock > 0;

  const handleAddToCart = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();

    // client safety checks
    if (isOutOfStock) {
      alert("This product is out of stock");
      return;
    }
    if (remainingStock !== null && remainingStock <= 0) {
      alert("You already have maximum available items of this product in your cart");
      return;
    }

    setLoading(true);
    try {
      const res = await api.addToCart(productId, 1);
      // successful add returns { added, quantity }, server enforces stock/cap
      if (res?.added) {
        // show transient added indicator
        setAddedIndicator(true);
        setTimeout(() => setAddedIndicator(false), 2000);
      } else if (res?.error) {
        // server returned 400 + JSON (our backend does that)
        alert(res.error || "Could not add to cart");
      } else {
        // fallback
        setAddedIndicator(true);
        setTimeout(() => setAddedIndicator(false), 2000);
      }
      await refreshCart();
    } catch (err) {
      // if fetch throws (non-JSON), try to get message
      try {
        const txt = err.message || "Failed to add to cart";
        alert(txt);
      } catch {
        alert("Failed to add to cart");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();

    try {
      if (isWishlisted) {
        await api.removeFromWishlist(productId);
      } else {
        await api.addToWishlist(productId);
      }
      await refreshWishlist();
    } catch {
      alert("Failed to update wishlist");
    }
  };

  // sizes
  const isSearch = variant === "search";
  const imgHeight = isSearch ? "h-44" : "h-36";
  const titleClass = isSearch ? "text-sm" : "text-xs";
  const priceClass = isSearch ? "text-2xl" : "text-lg";
  const buttonWidth = isSearch ? "w-36" : "w-28";

  return (
    <div className="bg-white p-3 flex flex-col relative group hover:shadow-md hover:-translate-y-0.5 transition-all rounded-sm h-full">
      {/* wishlist */}
      <button
        onClick={handleToggleWishlist}
        className="absolute top-2 right-2 p-1.5 z-10 bg-white/80 rounded-full hover:bg-gray-100"
        aria-label="Toggle Wishlist"
        type="button"
      >
        <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"} />
      </button>

      {/* clickable area: image + title */}
      <Link href={`/product/${productId}`} className="no-underline block">
        <div className={`relative w-full ${imgHeight} mb-3 bg-gray-50 flex items-center justify-center rounded-sm`}>
          <Image src={product.image || "https://picsum.photos/seed/amazon/400/400"} alt={product.name}
            fill className="object-contain p-2" referrerPolicy="no-referrer" />
        </div>
        <h3 className={`${titleClass} font-medium line-clamp-2 mb-1 group-hover:text-[#c45500]`}>{product.name}</h3>
      </Link>      

      {/* reserved area for stock / messages (keeps card size stable) */}
      <div className="min-h-[22px] mb-2">
        {isOutOfStock ? (
          <div className="text-sm text-red-600 font-bold">Out of stock</div>
        ) : lowStockWarning ? (
          <div className="text-sm text-orange-600 font-bold">Only {stock} left!</div>
        ) : (
          // keep empty space for stable layout
          <div className="text-sm text-transparent">placeholder</div>
        )}
      </div>

      <div className={`${priceClass} font-bold mb-2`}>₹{Number(product.price).toFixed(2)}</div>

      {/* added indicator */}
      <div className="flex items-center justify-center mb-2">
        {addedIndicator && (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle size={18} className="text-green-700" />
            <span className="text-sm">Added to cart</span>
          </div>
        )}
      </div>

      {/* Add to cart button */}
      <div className="mt-auto flex justify-center">
        <button
          onClick={handleAddToCart}
          disabled={loading || isOutOfStock || (remainingStock !== null && remainingStock <= 0)}
          type="button"
          className={`bg-[#ffd814] hover:bg-[#f7bc19] rounded-full px-4 py-1 text-sm font-medium shadow-sm disabled:opacity-50 ${buttonWidth}`}
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}