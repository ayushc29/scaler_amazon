"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroCarousel({ slides = [] }) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // auto slide every 5 seconds
  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(() => {
      next();
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, next]);

  if (!slides.length) return null;

  return (
    <div className="relative w-full h-[320px] md:h-[500px] overflow-hidden bg-[#eaeded]">
      {/* Slides Container */}
      <div
        className="flex w-full h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="relative w-full h-full shrink-0">
            {/* Make the entire slide a link to the category filter */}
            <Link
              href={`/?category=${slide.categoryId}`}
              className="block w-full h-full"
            >
              <div className="relative w-full h-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={i === 0}
                  className="object-cover object-top"
                  sizes="100vw"
                />
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* soft bottom gradient like Amazon to blend into cards */}
      <div className="absolute bottom-0 left-0 w-full h-32 md:h-64 bg-gradient-to-t from-[#eaeded] via-[#eaeded]/60 to-transparent pointer-events-none" />

      {/* Left arrow */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-0 top-0 h-[40%] md:h-[50%] w-20 md:w-28 flex items-center justify-start pl-1 md:pl-2
            bg-gradient-to-r from-black/40 via-black/20 to-transparent
            hover:from-black/50 hover:via-black/30 transition-all"
      >
        <ChevronLeft
          strokeWidth={1}
          className="w-6 h-6 md:w-12 md:h-12 lg:w-16 lg:h-16 text-white"
        />
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-0 top-0 h-[40%] md:h-[50%] w-20 md:w-28 flex items-center justify-end pr-1 md:pr-2
            bg-gradient-to-l from-black/40 via-black/20 to-transparent
            hover:from-black/50 hover:via-black/30 transition-all"
      >
        <ChevronRight
          strokeWidth={1}
          className="w-6 h-6 md:w-12 md:h-12 lg:w-16 lg:h-16 text-white"
        />
      </button>
    </div>
  );
}
