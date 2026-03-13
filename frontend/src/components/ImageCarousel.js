"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function ImageCarousel({ images = [], productName = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 }); // percent
  const containerRef = useRef(null);

  const safeIndex = activeIndex >= images.length ? 0 : activeIndex;
  const active = images[safeIndex] || { imageUrl: "/placeholder.png" };
  const imageUrl = active.imageUrl;

  // detect touch device: don't show the hover zoom pane
  const isTouch =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  function handleMouseMove(e) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // convert to percent (0 - 100)
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

  return (
    <div className="flex gap-6">
      {/* thumbnails - vertical */}
      <div className="hidden md:flex flex-col gap-3 w-[64px]">
        {images.map((img, i) => (
          <button
            key={img.id ?? i}
            onMouseEnter={() => setActiveIndex(i % images.length)}
            onClick={() => setActiveIndex(i % images.length)}
            className={`relative w-12 h-12 rounded-sm overflow-hidden border ${
              i === activeIndex ? "border-[#c45500]" : "border-gray-200"
            } bg-white hover:bg-gray-50`}
            aria-label={`Show image ${i + 1}`}
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

      {/* main image + zoom */}
      <div className="flex-1 flex gap-4">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative w-full md:w-[520px] h-[420px] md:h-[520px] bg-white flex items-center justify-center border border-gray-100 rounded-sm overflow-hidden cursor-zoom-in"
        >
          {/* main image (next/image) */}
          <Image
            src={imageUrl || "/placeholder.png"}
            alt={productName}
            fill
            className="object-contain"
            sizes="(min-width: 1024px) 520px, 100vw"
            priority
            referrerPolicy="no-referrer"
            onClick={() => {
              // on mobile, open in new tab for full view
              if (isTouch) window.open(imageUrl, "_blank");
            }}
          />

          {/* lens indicator (small translucent box) */}
          {!isTouch && zoomVisible && (
            <div
              style={{
                left: `calc(${zoomPos.x}% - 60px)`,
                top: `calc(${zoomPos.y}% - 60px)`,
              }}
              className="pointer-events-none absolute w-36 h-36 bg-white/20 border border-white/30 rounded-sm mix-blend-normal"
            />
          )}
        </div>

        {/* Zoom pane - only on md+ */}
        {!isTouch && zoomVisible && (
          <div className="hidden md:block relative w-[420px] h-[420px] border border-gray-100 rounded-sm overflow-hidden">
            <div
              aria-hidden
              className="w-full h-full bg-no-repeat bg-center"
              style={{
                backgroundImage: `url(${imageUrl || "/placeholder.png"})`,
                backgroundSize: "200%",
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
