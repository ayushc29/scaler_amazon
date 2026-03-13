"use client";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, title, variant = "home" }) {
  if (!products || products.length === 0) {
    return <div className="py-8 text-center text-gray-500">Oops! You have reached the end.</div>;
  }

  const gridClass =
    variant === "home"
      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4"
      : // search/category: 1 col mobile, 2 sm, 2 md, 3 lg -> larger cards and 3 per row on wide screens
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4";

  return (
    <div className="my-6">
      {title && <h2 className="text-xl font-bold mb-4 px-4">{title}</h2>}
      <div className={gridClass}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} variant={variant} />
        ))}
      </div>
    </div>
  );
}