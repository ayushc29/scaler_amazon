"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";
import Image from "next/image";

const HEADLINES = [
  "Starting ₹199 | Amazon Brands & more",
  "Deals on daily essentials",
  "More essentials | Flat 30% off",
  "Bulk order discounts + GST savings",
  "Top picks for you",
];

function pickRandom(arr, n = 4) {
  const copy = Array.isArray(arr) ? [...arr] : [];
  return copy.sort(() => 0.5 - Math.random()).slice(0, n);
}

export default function HomeDeals() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          api.getCategories().catch((e) => {
            console.error("Failed to load categories", e);
            return [];
          }),
          api.getProducts({ limit: 50 }).catch((e) => {
            console.error("Failed to load products", e);
            return [];
          }),
        ]);

        if (!mounted) return;
        console.log("HomeDeals: categories", cats);
        console.log(
          "HomeDeals: products (first 5)",
          prods && prods.slice ? prods.slice(0, 5) : prods,
        );

        setCategories(Array.isArray(cats) ? cats : []);
        setProducts(Array.isArray(prods) ? prods : []);
      } catch (err) {
        console.error("HomeDeals load error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded shadow-sm animate-pulse h-48"
            />
          ))}
        </div>
      </div>
    );
  }

  const availableCategories =
    Array.isArray(categories) && categories.length ? categories : [];
  const chosenCategories = availableCategories.length
    ? pickRandom(availableCategories, Math.min(4, availableCategories.length))
    : [];

  const cards = (
    chosenCategories.length ? chosenCategories : [null, null, null, null]
  ).map((cat, idx) => {
    let catProducts = [];
    if (cat && products && products.length) {
      catProducts = products.filter((p) => p.categoryId === cat.id);
    }
    if (!catProducts || catProducts.length === 0) {
      catProducts = pickRandom(products, 4);
    } else {
      catProducts = catProducts.slice(0, 4);
    }

    return {
      id: cat ? cat.id : `fallback-${idx}`,
      title: cat ? cat.name : HEADLINES[idx % HEADLINES.length],
      headline: HEADLINES[idx % HEADLINES.length],
      products: catProducts,
    };
  });

  return (
    <div className="max-w-[1500px] mx-auto px-4 -mt-20 relative z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={card.id} className="bg-white p-4 rounded shadow-sm">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-semibold text-lg">{card.headline}</h3>
              {/* small link to category if exists */}
              {card.id && String(card.id).startsWith("fallback-") ? null : (
                <Link
                  href={`/?category=${card.id}`}
                  className="text-sm text-blue-600"
                >
                  See more
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {card.products.map((p) => (
                <Link
                  key={p?.id ?? Math.random()}
                  href={`/product/${p?.id ?? ""}`}
                  className="block p-1"
                >
                  <div className="relative w-full h-[110px] bg-white">
                    <Image
                      src={p?.image ?? "/placeholder.png"}
                      alt={p?.name ?? "product"}
                      fill
                      className="object-contain"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
