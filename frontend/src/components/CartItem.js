"use client";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export default function CartItem({ item, onUpdate, onRemove }) {
  const stock = typeof item.stock !== "undefined" ? Number(item.stock) : null;
  const disableInc =
    (stock !== null && item.quantity >= stock) || item.quantity >= 5;

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200">
      <div className="w-32 h-32 relative shrink-0">
        <Link
          href={`/product/${item.productId}`}
          className="w-32 h-32 relative shrink-0 block"
        >
          <Image
            src={item.image || "https://picsum.photos/seed/amazon/200/200"}
            alt={item.name || "Product image"}
            fill
            className="object-contain"
            referrerPolicy="no-referrer"
          />
        </Link>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between">
          <Link
            href={`/product/${item.productId}`}
            className="text-lg font-medium text-[#007185] hover:underline line-clamp-2"
          >
            {item.name}
          </Link>
          <div className="text-lg font-bold ml-4">
            ₹{Number(item.price).toFixed(2)}
          </div>
        </div>
        <div className="text-sm text-green-700 my-1">In Stock</div>
        <div className="text-xs text-gray-500 mb-2">
          Eligible for FREE Shipping
        </div>

        <div className="mt-auto flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-md border border-gray-300 shadow-sm overflow-hidden">
            <button
              onClick={() => {
                if (item.quantity === 1) {
                  
                  onRemove(item.cartItemId);
                } else {
                  onUpdate(item.cartItemId, item.quantity - 1);
                }
              }}
              className="px-3 py-1 hover:bg-gray-200"
            >
              {item.quantity === 1 ? <Trash2 size={16}/> : "-"}
            </button>
            <span className="px-3 py-1 bg-white border-x border-gray-300">
              {item.quantity}
            </span>
            {item.quantity >= 5 && (
              <div className="text-xs text-red-600 ml-2">Max 5 allowed</div>
            )}
            <button
              onClick={() => onUpdate(item.cartItemId, item.quantity + 1)}
              className={`px-3 py-1 hover:bg-gray-200 ${disableInc ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={disableInc}
            >
              +
            </button>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <button
            onClick={() => onRemove(item.cartItemId)}
            className="text-sm text-[#007185] hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
