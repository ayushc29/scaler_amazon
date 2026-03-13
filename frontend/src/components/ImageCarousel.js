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

  // Zoom configuration
  const scale = 2.5;
  const lensSize = 100 / scale; // 40% of the container

  function handleMouseMove(e) {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Clamp lens center so it doesn't go outside the container
    const cx = Math.max(lensSize / 2, Math.min(100 - lensSize / 2, xPercent));
    const cy = Math.max(lensSize / 2, Math.min(100 - lensSize / 2, yPercent));

    setZoomPos({ x: cx, y: cy });
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

  const lensLeft = zoomPos.x - lensSize / 2;
  const lensTop = zoomPos.y - lensSize / 2;

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
                referrerPolicy="no-referrer"
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
                i === activeIndex ? "border-[#c45500] shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]" : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <Image
                src={img.imageUrl}
                alt={productName}
                fill
                className="object-contain p-1"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>

        {/* image + zoom */}
        <div className="flex flex-1 min-w-0 gap-4 relative">

          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-[520px] aspect-square bg-white border border-gray-100 flex items-center justify-center overflow-hidden cursor-crosshair"
          >
            <Image
              src={imageUrl || "/placeholder.png"}
              alt={productName}
              fill
              className="object-contain"
              priority
              referrerPolicy="no-referrer"
            />

            {!isTouch && zoomVisible && (
              <div
                style={{
                  left: `${lensLeft}%`,
                  top: `${lensTop}%`,
                  width: `${lensSize}%`,
                  height: `${lensSize}%`,
                }}
                className="pointer-events-none absolute bg-blue-500/10 border border-blue-500/30 shadow-sm"
              />
            )}
          </div>

          {/* zoom pane only on large screens */}
          {!isTouch && zoomVisible && (
            <div className="hidden lg:block absolute left-[calc(100%+16px)] top-0 w-[500px] h-[500px] border border-gray-200 overflow-hidden bg-white z-50 shadow-xl">
              <div
                className="absolute"
                style={{
                  left: `${-lensLeft * scale}%`,
                  top: `${-lensTop * scale}%`,
                  width: `${scale * 100}%`,
                  height: `${scale * 100}%`,
                }}
              >
                <Image
                  src={imageUrl || "/placeholder.png"}
                  alt={productName}
                  fill
                  className="object-contain"
                  priority
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}