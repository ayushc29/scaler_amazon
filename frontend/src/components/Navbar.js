"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Package,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import Image from "next/image";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart } = useAppContext();

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (currentSearch !== search) {
      setSearch(currentSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // --- Debounced navigation when user types ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";

      if (search.trim() && search.trim() !== currentSearch) {
        router.push(`/?search=${encodeURIComponent(search.trim())}`);
      }

      if (!search.trim() && currentSearch) {
        router.push("/");
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search, router, searchParams]);

  const cartCount =
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const doSearchNow = () => {
    const q = (search || "").trim();
    if (q) router.push(`/?search=${encodeURIComponent(q)}`);
    else router.push("/");
    // close mobile search after searching
    setMobileSearchOpen(false);
  };

  return (
    <header className="bg-[#131921] text-white p-3 flex items-center justify-between gap-3">
      {/* Left: logo */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center p-1 rounded transition focus:outline-none hover:ring-1 hover:ring-white/75"
        >
          {/* small logo for mobile */}
          <span className="block md:hidden">
            <Image
              src="/logo-sm.png"
              alt="Amazon Clone"
              width={90}
              height={32}
              priority
              className="object-contain"
            />
          </span>

          {/* full logo for md+ */}
          <span className="hidden md:block">
            <Image
              src="/logo.png"
              alt="Amazon Clone"
              width={140}
              height={40}
              priority
              className="object-contain"
            />
          </span>
        </Link>
      </div>

      {/* Desktop search (md and up) */}
      <div className="hidden md:flex flex-1 min-w-[200px] max-w-3xl mx-4 bg-white rounded-md overflow-hidden">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full p-2 text-black bg-white focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-[#f0c14b] hover:bg-[#ddb347] px-4 text-black flex items-center justify-center"
          aria-label="Search"
          onClick={doSearchNow}
        >
          <Search size={20} />
        </button>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-4">
        <Link
          href="/orders"
          className="flex flex-col p-1 rounded transition focus:outline-none hover:ring-1 hover:ring-white/75"
        >
          <span className="text-xs text-gray-300">Returns</span>
          <span className="font-bold text-sm flex items-center gap-1">
            <Package size={16} /> & Orders
          </span>
        </Link>

        <Link
          href="/wishlist"
          className="flex flex-col p-1 rounded transition focus:outline-none hover:ring-1 hover:ring-white/75"
        >
          <span className="text-xs text-gray-300">Your</span>
          <span className="font-bold text-sm flex items-center gap-1">
            <Heart size={16} /> Wishlist
          </span>
        </Link>

        <Link
          href="/cart"
          className="flex items-center p-1 rounded relative transition focus:outline-none hover:ring-1 hover:ring-white/75"
        >
          <ShoppingCart size={32} />
          <span className="absolute top-0 left-4 text-[#f0c14b] font-bold text-sm bg-[#131921] rounded-full px-1">
            {cartCount}
          </span>
          <span className="font-bold text-sm mt-3 ml-1">Cart</span>
        </Link>
      </nav>

      {/* Mobile controls */}
      <div className="flex items-center gap-2 md:hidden">
        {/* mobile search toggle */}
        <button
          aria-label="Open search"
          onClick={() => {
            setMobileSearchOpen((s) => !s);
            setMobileMenuOpen(false);
          }}
          className="p-2 rounded hover:bg-white/10 transition"
        >
          <Search size={18} />
        </button>

        {/* cart */}
        <Link
          href="/cart"
          className="relative p-2 rounded hover:bg-white/10 transition"
        >
          <ShoppingCart size={20} />
          <span className="absolute -top-1 -right-1 text-xs text-[#131921] font-bold bg-[#f0c14b] rounded-full px-1">
            {cartCount}
          </span>
        </Link>

        {/* mobile menu */}
        <button
          aria-label="Menu"
          onClick={() => {
            setMobileMenuOpen((s) => !s);
            setMobileSearchOpen(false);
          }}
          className="p-2 rounded hover:bg-white/10 transition"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile search overlay (slides down) */}
      {mobileSearchOpen && (
        <div className="md:hidden fixed left-0 right-0 top-[64px] bg-white z-40 p-3 shadow">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 p-2 text-black bg-white border rounded focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") doSearchNow();
              }}
            />
            <button
              onClick={doSearchNow}
              className="bg-[#f0c14b] px-3 rounded text-black"
            >
              Go
            </button>
          </div>
        </div>
      )}

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed right-3 top-[64px] z-40 bg-[#0f1720] border border-gray-800 rounded shadow-lg overflow-hidden">
          <div className="flex flex-col text-sm p-2 min-w-[200px]">
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded hover:bg-white/5"
            >
              <Package size={16} /> Orders
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded hover:bg-white/5"
            >
              <Heart size={16} /> Wishlist
            </Link>

            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded hover:bg-white/5"
            >
              <ShoppingCart size={16} /> Cart
            </Link>

            <div className="border-t border-gray-800 mt-2 pt-2 px-1">
              {/* quick link to add address or account could go here */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 rounded hover:bg-white/5"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}