"use client";
import { useAppContext } from "../../context/AppContext";
import ProductCard from "../../components/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useAppContext();

  return (
    <div className="max-w-[1500px] mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-medium mb-6">Your Wishlist</h1>

      {wishlist?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <ProductCard key={item.productId ?? item.id} product={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 text-center shadow-sm rounded-lg text-lg">
          Your wishlist is empty.
        </div>
      )}
    </div>
  );
}
