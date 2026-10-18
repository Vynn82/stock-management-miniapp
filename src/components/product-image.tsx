"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import { Package } from "lucide-react";

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
        className={`flex items-center justify-center bg-neutral-50 text-neutral-300 select-none ${containerClassName}`}
        role="img"
        aria-label={`${alt} image unavailable`}
      >
        <Package className="w-9 h-9 stroke-[1.35]" aria-hidden="true" />
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
