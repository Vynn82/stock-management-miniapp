"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import { Package, Sparkles } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export function ProductImage({
  src,
  alt,
  className = "w-full h-full object-contain",
  containerClassName = "w-full h-full",
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 via-slate-50 to-neutral-200/50 select-none ${containerClassName}`}
      >
        {/* Subtle geometric dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:10px_10px] opacity-40 pointer-events-none" />

        {/* Ambient radial soft glow */}
        <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent blur-xl pointer-events-none" />

        {/* Minimalist 3D-feel Hardware/Product Silhouette */}
        <div className="relative z-10 p-2.5 rounded-2xl bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-neutral-200/80 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-neutral-900 to-neutral-700 flex items-center justify-center text-white shadow-xs">
            <Package className="w-4 h-4 stroke-[2]" />
          </div>
        </div>

        {/* Micro Badge for normal/large displays */}
        <div className="relative z-10 mt-1.5 flex items-center gap-1 text-[9px] font-extrabold text-neutral-400 tracking-wider uppercase">
          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
          <span>Catalog Item</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}
