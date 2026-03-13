"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { api } from "../lib/api";

export default function RecentlyViewed({ max = 6 }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const ids = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        if (!ids || !ids.length) return setItems([]);

        const slice = ids.slice(0, max); // latest first
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/ids?ids=${slice.join(",")}`);
        if (!res.ok) return setItems([]);
        const data = await res.json();
        // ensure we only use existing products and keep original order
        const map = new Map((data || []).map((p) => [p.id, p]));
        const ordered = slice.map((id) => map.get(Number(id))).filter(Boolean);
        setItems(ordered);
      } catch (e) {
        console.error("RecentlyViewed load error", e);
        setItems([]);
      }
    }
    load();
  }, [max]);

  if (!items.length) return null;

  return (
    <div className="mt-10 bg-white p-4 rounded-sm shadow-sm">
      <h3 className="text-lg font-bold mb-4">Recently viewed</h3>
      <div className="flex gap-4 overflow-x-auto pb-3">
        {items.map((p) => (
          <div key={p.id} className="min-w-[200px] max-w-[200px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}