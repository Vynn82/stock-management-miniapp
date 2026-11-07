"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react";
import { Package } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackIconClassName?: string;
}

export function ProductImage({
  src,
  alt,
  className = "w-full h-full object-contain",
  containerClassName = "w-full h-full",
  fallbackIconClassName = "w-9 h-9 stroke-[1.35]",
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const cleanSrc =
    src && typeof src === "string" && src.trim() !== "" ? src.trim() : null;

  if (!cleanSrc || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-50 text-neutral-300 select-none ${containerClassName}`}
        role="img"
        aria-label={`${alt} image unavailable`}
      >
        <Package className={fallbackIconClassName} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      key={cleanSrc}
      src={cleanSrc}
      alt={alt}
      onError={() => setHasError(true)}
      className={`${className} transition-opacity duration-300`}
      loading="lazy"
    />
  );
}
