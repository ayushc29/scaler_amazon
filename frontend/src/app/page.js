"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../lib/api";
import ProductGrid from "../components/ProductGrid";
import ProductCard from "../components/ProductCard";
import HomeDeals from "../components/HomeDeals";
import HeroCarousel from "../components/HeroCarousel";

function HomeContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const page = Number(searchParams.get("page") || 1);

  const isHomePage = !search && !category;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [hasNext, setHasNext] = useState(false);

  // example hero slides — replace image paths with your banner files
  const heroSlides = [
    { image: "/banners/electronics.jpg", title: "Electronics", categoryId: 1 },
    { image: "/banners/books.jpg", title: "Books", categoryId: 2 },
    { image: "/banners/clothing.jpg", title: "Clothing", categoryId: 3 },
    { image: "/banners/shoes.jpg", title: "Shoes", categoryId: 4 },
    { image: "/banners/home.jpg", title: "Home", categoryId: 5 },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        let limit = 12;

        if (isHomePage) {
          // homepage: show 12 items (3 rows of 4)
          limit = 12;
        } else {
          // search/category pages: 10 per page for larger cards + pagination
          limit = 10;
          params.page = page;
          params.limit = limit;
          if (search) params.search = search;
          if (category) params.category = category;
        }

        // send limit always (backend may respect it)
        params.limit = limit;

        const data = await api.getProducts(params);
        const arr = Array.isArray(data) ? data : [];

        setProducts(arr);
        setHasNext(arr.length === limit);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setProducts([]);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, page, isHomePage]);

  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        const recentIds = JSON.parse(
          localStorage.getItem("recentlyViewed") || "[]",
        );
        if (recentIds.length > 0) {
          const recentProducts = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/products/ids?ids=${recentIds
              .slice(0, 5)
              .join(",")}`,
          ).then((r) => r.json());
          setRecentlyViewed((recentProducts || []).filter(Boolean));
        }
      } catch (e) {
        console.error("Failed to load recently viewed", e);
      }
    };
    loadRecentlyViewed();
  }, []);

  return (
    <>
      {/* HERO */}
      {isHomePage && (
        <div className="relative">
          {/* HeroCarousel: keep it full width; heights are controlled inside component */}
          <HeroCarousel slides={heroSlides} />

          {/* Soft gradient (already in HeroCarousel) ensures smooth blending into cards */}
        </div>
      )}

      <div className="max-w-[1500px] mx-auto pb-10 px-4">
        {loading ? (
          <div className="py-20 text-center">Loading products...</div>
        ) : (
          <>
            {/* HOME DEAL CARDS (overlap behavior is responsive) */}
            {isHomePage && (
              <div
                /* 
                  responsive overlap:
                  - mobile: larger negative margin to create strong overlap
                  - md (>=768px): much smaller overlap so the hero still reads
                  - lg (>=1024px): no overlap — HomeDeals sits below hero
                */
                className="
                  mt-[-120px] md:mt-[-250px] lg:mt-[-250px]
                  relative z-20
                  transform md:-translate-y-4 lg:translate-y-0
                  px-2 md:px-0
                "
              >
                {/* place HomeDeals in a centered container so it doesn't stretch full width */}
                <div className="mx-auto">
                  <HomeDeals />
                </div>
              </div>
            )}

            {/* PRODUCT GRID: z-10 so hero gradient is visible behind smaller overlap */}
            <div className="relative z-10 mt-6 md:mt-8">
              <ProductGrid
                products={products}
                variant={isHomePage ? "home" : "search"}
                title={
                  search
                    ? `Search results for "${search}"`
                    : category
                      ? "Category Results"
                      : "Featured Products"
                }
              />
            </div>

            {/* PAGINATION ONLY FOR SEARCH / CATEGORY */}
            {!isHomePage && (
              <div className="flex justify-center gap-4 my-8 items-center">
                {page > 1 ? (
                  <Link
                    href={`/?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${category ? `&category=${category}` : ""}`}
                    className="px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-100 border rounded text-gray-400 cursor-not-allowed"
                  >
                    Previous
                  </button>
                )}

                <div className="text-sm text-gray-600">Page {page}</div>

                {hasNext ? (
                  <Link
                    href={`/?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${category ? `&category=${category}` : ""}`}
                    className="px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-50"
                  >
                    Next
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-100 border rounded text-gray-400 cursor-not-allowed"
                  >
                    Next
                  </button>
                )}
              </div>
            )}

            {/* RECENTLY VIEWED */}
            {isHomePage && recentlyViewed.length > 0 && (
              <div className="mt-12 bg-white p-4 rounded-sm shadow-sm">
                <h2 className="text-xl font-bold mb-4">
                  Related to items you&apos;ve viewed
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {recentlyViewed.map((p) => (
                    <div key={p.id} className="min-w-[200px] max-w-[200px]">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
