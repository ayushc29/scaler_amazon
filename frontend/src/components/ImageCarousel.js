"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function ImageCarousel({ images = [], productName = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const safeIndex = activeIndex >= images.length ? 0 : activeIndex;
  const active = images[safeIndex] || { imageUrl: "/placeholder.png" };
  const imageUrl = active.imageUrl;

  const isTouch =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  function handleMouseMove(e) {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));

    setZoomPos({ x: xPercent, y: yPercent });
  }

  function handleMouseEnter() {
    if (!isTouch) setZoomVisible(true);
  }

  function handleMouseLeave() {
    if (!isTouch) setZoomVisible(false);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e) {
    touchEndX.current = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 50 && activeIndex < images.length - 1) {
      setActiveIndex(activeIndex + 1);
    }

    if (distance < -50 && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  }

  return (
    <div className="w-full">

      {/* ================= MOBILE CAROUSEL ================= */}
      <div className="md:hidden relative w-full h-[360px] overflow-hidden">

        <div
          className="flex h-full transition-transform duration-300"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((img, i) => (
            <div key={i} className="relative min-w-full h-full">
              <Image
                src={img.imageUrl}
                alt={productName}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>

        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {activeIndex + 1} / {images.length}
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === activeIndex ? "bg-gray-800" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:flex gap-6">

        {/* thumbnails */}
        <div className="flex flex-col gap-3 w-[64px] shrink-0">
          {images.map((img, i) => (
            <button
              key={img.id ?? i}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => setActiveIndex(i)}
              className={`relative w-12 h-12 border rounded-sm overflow-hidden ${
                i === activeIndex ? "border-[#c45500]" : "border-gray-200"
              }`}
            >
              <Image
                src={img.imageUrl}
                alt={productName}
                fill
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>

        {/* image + zoom */}
        <div className="flex flex-1 min-w-0 gap-4">

          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-[520px] aspect-square bg-white border border-gray-100 flex items-center justify-center overflow-hidden cursor-zoom-in"
          >
            <Image
              src={imageUrl || "/placeholder.png"}
              alt={productName}
              fill
              className="object-contain"
              priority
            />

            {!isTouch && zoomVisible && (
              <div
                style={{
                  left: `calc(${zoomPos.x}% - 60px)`,
                  top: `calc(${zoomPos.y}% - 60px)`,
                }}
                className="pointer-events-none absolute w-36 h-36 bg-white/20 border border-white/40"
              />
            )}
          </div>

          {/* zoom pane only on large screens */}
          {!isTouch && zoomVisible && (
            <div className="hidden lg:block relative w-[420px] h-[420px] border border-gray-100 overflow-hidden">
              <div
                className="w-full h-full bg-no-repeat"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: "200%",
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                }}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}