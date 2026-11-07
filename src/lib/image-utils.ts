import { Product, ProductVariant } from "@/types";

/**
 * Returns the main image to display for a product on listing pages (Home, Catalog).
 * If the product's main image is empty/null, fall back to the first variant that has an image.
 */
export function getProductDisplayImage(product?: Product | null): string | null {
  if (!product) return null;

  // 1. Check product's primary image
  if (product.image && typeof product.image === "string" && product.image.trim() !== "") {
    return product.image.trim();
  }

  // 2. Check if any variant has a valid image
  if (product.variants && product.variants.length > 0) {
    const variantWithImage = product.variants.find(
      (v) => typeof v.image === "string" && v.image.trim() !== ""
    );
    if (variantWithImage?.image) {
      return variantWithImage.image.trim();
    }

    // 3. Fallback to first variant's image if present
    const firstVariantImage = product.variants[0]?.image;
    if (typeof firstVariantImage === "string" && firstVariantImage.trim() !== "") {
      return firstVariantImage.trim();
    }
  }

  return null;
}

/**
 * Returns the image to display on the Product Detail page or Variant Selector Sheet.
 * Displays the selected variant's image if present;
 * otherwise falls back to the product's main image;
 * and if that's also empty, falls back to the first variant with an image.
 */
export function getVariantDisplayImage(
  product?: Product | null,
  selectedVariant?: ProductVariant | null
): string | null {
  if (!product) return null;

  // 1. If a variant is selected and has an image, prefer it
  if (
    selectedVariant?.image &&
    typeof selectedVariant.image === "string" &&
    selectedVariant.image.trim() !== ""
  ) {
    return selectedVariant.image.trim();
  }

  // 2. Otherwise fall back to the product's main image
  if (product.image && typeof product.image === "string" && product.image.trim() !== "") {
    return product.image.trim();
  }

  // 3. Fall back to the first variant with an image
  if (product.variants && product.variants.length > 0) {
    const variantWithImage = product.variants.find(
      (v) => typeof v.image === "string" && v.image.trim() !== ""
    );
    if (variantWithImage?.image) {
      return variantWithImage.image.trim();
    }
  }

  return null;
}
