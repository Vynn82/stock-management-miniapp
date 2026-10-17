"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  Plus,
  Minus,
  Check,
  Banknote,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useTelegram } from "@/context/telegram-context";
import { api } from "@/lib/api";
import { Product, ProductVariant } from "@/types";
import { ProductImage } from "@/components/product-image";

export default function ProductDetailPage({
  params,
}: {
  params?: { id?: string };
}) {
  const router = useRouter();
  const routeParams = useParams();
  const productId = (params?.id || routeParams?.id || "") as string;

  const { addToCart, totalCount } = useCart();
  const { authStatus, openRegistration, hapticFeedback } = useTelegram();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await api.getProduct(productId);
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <div className="w-9 h-9 border-3 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-neutral-400 font-medium">Loading details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-neutral-400" />
        </div>
        <h2 className="text-base font-bold text-neutral-800">Product Not Found</h2>
        <Link
          href="/products"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-neutral-900 px-5 py-2.5 rounded-2xl shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const activePrice = Number(
    selectedVariant?.price !== undefined && selectedVariant?.price !== null
      ? selectedVariant.price
      : product.price,
  );

  const activeImage = selectedVariant?.image || product.image;
  const inStock = (product.totalStock ?? 1) > 0;

  const handleAddToCart = () => {
    hapticFeedback("success");
    addToCart(
      {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        productName: product.name,
        variantName: selectedVariant?.name || null,
        productCode: product.code,
        price: activePrice,
        image: activeImage,
      },
      quantity,
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleOrderNow = () => {
    if (!product) return;
    hapticFeedback("medium");
    addToCart(
      {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        productName: product.name,
        variantName: selectedVariant?.name || null,
        productCode: product.code,
        price: activePrice,
        image: activeImage,
      },
      quantity,
    );

    if (authStatus === "REGISTRATION_REQUIRED") {
      openRegistration();
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbfd] text-[#1d1d1f] pb-48">
      {/* Apple-style Frosted Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/85 border-b border-neutral-200/70 px-4 py-3 flex justify-between items-center shadow-xs">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-2xl hover:bg-neutral-100 text-neutral-700 active:scale-95 transition-all"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-extrabold text-neutral-900 truncate max-w-[220px]">
          {product.name}
        </span>
        <Link
          href="/cart"
          className="p-2 -mr-2 rounded-2xl hover:bg-neutral-100 text-neutral-700 relative active:scale-95 transition-all"
          aria-label="Cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalCount > 0 && (
            <span className="absolute 1 -top-0.5 -right-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-md animate-in zoom-in-75">
              {totalCount}
            </span>
          )}
        </Link>
      </header>

      {/* Main Image Showcase Stage */}
      <div className="bg-gradient-to-b from-white to-neutral-100/60 border-b border-neutral-200/60 p-6 flex items-center justify-center">
        <div className="w-full max-w-[280px] h-64 relative flex items-center justify-center">
          <ProductImage
            src={activeImage}
            alt={product.name}
            className="w-full h-full object-contain filter drop-shadow-md animate-in fade-in duration-300"
          />

          {/* Floating Stock Badge */}
          <div className="absolute top-0 left-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md bg-white/90 shadow-xs border border-neutral-200/50">
            <span
              className={`w-2 h-2 rounded-full ${
                inStock ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className={inStock ? "text-neutral-800" : "text-red-700"}>
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Title, Code & Price Card */}
        <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex justify-between items-start gap-3">
            <div>
              <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">
                {product.category?.name || "Catalog Product"}
              </span>
              <h1 className="text-lg font-black tracking-tight text-neutral-900 mt-0.5">
                {product.name}
              </h1>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Code: {product.code}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-neutral-400 block -mb-0.5">
                Wholesale Price
              </span>
              <span className="text-xl font-black text-blue-600 tracking-tight">
                ${activePrice.toFixed(2)}
              </span>
            </div>
          </div>

          {product.description && (
            <p className="text-xs text-neutral-600 leading-relaxed pt-2 border-t border-neutral-100">
              {product.description}
            </p>
          )}
        </div>

        {/* Variants Selector */}
        {product.variants && product.variants.length > 0 && (
          <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block">
              Choose Variant ({product.variants.length} available)
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      hapticFeedback("light");
                      setSelectedVariant(v);
                    }}
                    className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold border transition-all text-left active:scale-95 ${
                      isSelected
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <span>{v.name}</span>
                    {v.price && (
                      <span
                        className={`block text-[10px] font-normal ${
                          isSelected ? "text-neutral-300" : "text-neutral-400"
                        }`}
                      >
                        ${Number(v.price).toFixed(2)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Stepper Card */}
        <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex justify-between items-center">
          <div>
            <span className="text-xs font-extrabold text-neutral-900 block">
              Order Quantity
            </span>
            <span className="text-[11px] text-neutral-400">
              Total: ${(activePrice * quantity).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-neutral-100 border border-neutral-200/60 rounded-xl p-1 shadow-inner">
            <button
              type="button"
              onClick={() => {
                hapticFeedback("light");
                setQuantity((q) => Math.max(1, q - 1));
              }}
              className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-neutral-700 hover:text-neutral-900 active:scale-90 transition-all"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-bold text-xs text-neutral-900 font-mono">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => {
                hapticFeedback("light");
                setQuantity((q) => q + 1);
              }}
              className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-neutral-700 hover:text-neutral-900 active:scale-90 transition-all"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dispatch & COD Guarantee */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-neutral-50/80 border border-neutral-200/70 p-3 rounded-2xl flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-neutral-800 block">Direct Dispatch</span>
              <span className="text-neutral-400 text-[10px]">Staff coordinates delivery</span>
            </div>
          </div>

          <div className="bg-neutral-50/80 border border-neutral-200/70 p-3 rounded-2xl flex items-center gap-2.5">
            <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-neutral-800 block">Cash on Delivery</span>
              <span className="text-neutral-400 text-[10px]">Zero online payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions with clean clearance above Navigation Bar */}
      <div className="fixed bottom-[4.75rem] left-0 right-0 max-w-md mx-auto px-4 z-40 pointer-events-none">
        <div className="pointer-events-auto backdrop-blur-2xl bg-white/95 border border-neutral-200/80 rounded-2xl p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 py-3 px-3 min-h-[46px] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-200/80"
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" /> Added to Cart!
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOrderNow}
            className="flex-1 py-3 px-3 min-h-[46px] rounded-xl font-black text-xs flex items-center justify-center gap-1.5 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 hover:from-neutral-900 hover:to-neutral-700 text-white transition-all shadow-md active:scale-95"
          >
            <span>Order Now</span>
            <span className="font-mono text-white/90">
              (${(activePrice * quantity).toFixed(2)})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
