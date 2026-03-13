"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function CategoryBar() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div className="bg-[#232f3e] text-white z-10">
      <div className="max-w-[1400px] mx-auto flex justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 px-4 py-2 overflow-x-auto text-sm">
        <Link href="/" className="hover:border border-transparent hover:border-white px-1 py-1 rounded whitespace-nowrap">
          All
        </Link>

        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/?category=${cat.id}`}
            className="border border-transparent hover:border-white px-2 py-1 rounded whitespace-nowrap"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}