"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Plus,
  Minus,
  Check,
  Banknote,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useTelegram } from "@/context/telegram-context";
import { useLanguage } from "@/context/language-context";
import { api } from "@/lib/api";
import { Product, ProductVariant } from "@/types";
import { ProductImage } from "@/components/product-image";
import { QuantityInput } from "@/components/quantity-input";

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
  const { t } = useLanguage();

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
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-neutral-400 font-medium">{t("common_loading")}</p>
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
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 rounded-2xl shadow-sm shadow-blue-500/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> {t("checkout_return_catalog")}
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
    <div className="flex flex-col min-h-screen bg-[#f5f5f7] text-[#1d1d1f] pb-32">
      {/* Apple-style Frosted Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#f5f5f7]/90 border-b border-neutral-200/70 px-4 py-3 flex justify-between items-center">
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
          <ShoppingCart className="w-5 h-5" />
          {totalCount > 0 && (
            <span className="absolute 1 -top-0.5 -right-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-md animate-in zoom-in-75">
              {totalCount}
            </span>
          )}
        </Link>
      </header>

      {/* Main Image Showcase Stage */}
      <div className="px-4 pt-4">
        <div className="mx-auto w-full max-w-[520px] h-[340px] sm:h-[420px] relative flex items-center justify-center bg-white rounded-[2rem] border border-neutral-200/70 p-6 overflow-hidden">
          <ProductImage
            src={activeImage}
            alt={product.name}
            className="w-full h-full object-contain animate-in fade-in duration-300"
          />

        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl w-full mx-auto">
        {/* Title, Code & Price Card */}
        <div className="bg-transparent px-1 py-2 space-y-3">
          <div className="flex justify-between items-start gap-3">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
                {product.category?.name || "Catalog Product"}
              </span>
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 mt-1">
                {product.name}
              </h1>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {t("detail_code")}: {product.code}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-neutral-400 block mb-0.5">
                {t("home_wholesale")}
              </span>
              <span className="text-2xl font-black text-neutral-900 tracking-tight">
                ${activePrice.toFixed(2)}
              </span>
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-neutral-600 leading-relaxed pt-3 border-t border-neutral-200/70">
              {product.description}
            </p>
          )}
        </div>

        {/* Variants Selector */}
        {product.variants && product.variants.length > 0 && (
          <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 space-y-3">
            <label className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block">
              {t("detail_choose_variant")} ({product.variants.length})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                const vPrice = Number(
                  v.price !== undefined && v.price !== null
                    ? v.price
                    : product.price || 0,
                );
                const isOutOfStock = v.stock !== undefined && Number(v.stock) <= 0;

                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => {
                      hapticFeedback("light");
                      setSelectedVariant(v);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] flex flex-col justify-between gap-1.5 ${
                      isOutOfStock
                        ? "opacity-50 cursor-not-allowed bg-neutral-50 border-neutral-200"
                        : isSelected
                        ? "border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-600/20"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span
                        className={`text-xs font-bold leading-tight ${
                          isSelected ? "text-blue-950 font-extrabold" : "text-neutral-800"
                        }`}
                      >
                        {v.name}
                      </span>
                      {isSelected && (
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span
                        className={`text-xs font-black tracking-tight ${
                          isSelected ? "text-blue-700" : "text-neutral-900"
                        }`}
                      >
                        ${vPrice.toFixed(2)}
                      </span>
                      {v.stock !== undefined && (
                        <span className="text-[10px] text-neutral-400">
                          {Number(v.stock) > 0 ? `${v.stock} left` : "Out"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Stepper Card */}
        <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 flex justify-between items-center">
          <div>
            <span className="text-xs font-extrabold text-neutral-900 block">
              {t("detail_quantity")}
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
            <QuantityInput
              value={quantity}
              onChange={setQuantity}
              label={t("detail_quantity")}
              className="w-16 h-8"
            />
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

        {/* Order Actions */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-2.5 flex items-center gap-2.5">
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
                <Check className="w-4 h-4" /> {t("detail_added")}
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> {t("detail_add_to_cart")}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOrderNow}
            className="flex-1 py-3 px-3 min-h-[46px] rounded-xl font-black text-xs flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95"
          >
            <span>{t("detail_order_now")}</span>
            <span className="font-mono text-white/90">
              (${(activePrice * quantity).toFixed(2)})
            </span>
          </button>
        </div>

        {/* Dispatch & COD Guarantee */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-neutral-50/80 border border-neutral-200/70 p-3 rounded-2xl flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-neutral-800 block">{t("detail_direct_dispatch")}</span>
              <span className="text-neutral-400 text-[10px]">{t("detail_direct_dispatch_desc")}</span>
            </div>
          </div>

          <div className="bg-neutral-50/80 border border-neutral-200/70 p-3 rounded-2xl flex items-center gap-2.5">
            <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-neutral-800 block">{t("detail_cod")}</span>
              <span className="text-neutral-400 text-[10px]">{t("detail_cod_desc")}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
