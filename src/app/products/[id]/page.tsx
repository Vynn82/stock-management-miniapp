"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  PackageX,
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
import { getVariantDisplayImage, getProductDisplayImage } from "@/lib/image-utils";
import { ProductImage } from "@/components/product-image";
import { QuantityInput } from "@/components/quantity-input";
import { OutOfStockModal } from "@/components/out-of-stock-modal";

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
  const [variantQuantities, setVariantQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [outOfStockModalOpen, setOutOfStockModalOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string | undefined>(undefined);
  const [alertMessage, setAlertMessage] = useState<string | undefined>(undefined);

  const updateQuantity = (newQty: number) => {
    setQuantity(newQty);
    if (selectedVariant?.id) {
      setVariantQuantities((prev) => ({
        ...prev,
        [selectedVariant.id]: newQty,
      }));
    }
  };

  const handleSelectVariant = (v: ProductVariant) => {
    hapticFeedback("light");
    if (selectedVariant?.id === v.id) return;

    // Save current variant's quantity before switching
    if (selectedVariant?.id) {
      setVariantQuantities((prev) => ({
        ...prev,
        [selectedVariant.id]: quantity,
      }));
    }

    setSelectedVariant(v);

    const vStock = Number(v.stock ?? 0);
    // If the user previously selected this variant, restore its quantity; otherwise default to 1
    const savedQty = variantQuantities[v.id] ?? 1;
    const nextQty = vStock > 0 ? Math.max(1, Math.min(savedQty, vStock)) : 1;
    setQuantity(nextQty);
  };

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await api.getProduct(productId);
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          const firstInStock =
            data.variants.find((v) => (v.stock ?? 0) > 0) || data.variants[0];
          setSelectedVariant(firstInStock);
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

  const currentStock = selectedVariant
    ? Number(selectedVariant.stock ?? 0)
    : Number(product.totalStock ?? 0);
  const isOutOfStock = currentStock <= 0;

  const activePrice = Number(
    selectedVariant?.price !== undefined && selectedVariant?.price !== null
      ? selectedVariant.price
      : product.price,
  );

  const activeImage = getVariantDisplayImage(product, selectedVariant);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      hapticFeedback("warning");
      setAlertTitle(t("stock_alert_title"));
      setAlertMessage(
        selectedVariant
          ? t("stock_alert_variant_message")
          : t("stock_alert_message"),
      );
      setOutOfStockModalOpen(true);
      return;
    }

    if (quantity > currentStock) {
      hapticFeedback("warning");
      setAlertTitle(t("stock_alert_title"));
      setAlertMessage(t("stock_alert_insufficient"));
      setOutOfStockModalOpen(true);
      return;
    }

    hapticFeedback("success");
    addToCart(
      {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        productName: product.name,
        variantName: selectedVariant?.name || null,
        productCode: selectedVariant?.code || product.code,
        price: activePrice,
        image: activeImage,
        maxStock: currentStock,
      },
      quantity,
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleOrderNow = () => {
    if (!product) return;

    if (isOutOfStock) {
      hapticFeedback("warning");
      setAlertTitle(t("stock_alert_title"));
      setAlertMessage(
        selectedVariant
          ? t("stock_alert_variant_message")
          : t("stock_alert_message"),
      );
      setOutOfStockModalOpen(true);
      return;
    }

    if (quantity > currentStock) {
      hapticFeedback("warning");
      setAlertTitle(t("stock_alert_title"));
      setAlertMessage(t("stock_alert_insufficient"));
      setOutOfStockModalOpen(true);
      return;
    }

    hapticFeedback("medium");
    addToCart(
      {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        productName: product.name,
        variantName: selectedVariant?.name || null,
        productCode: selectedVariant?.code || product.code,
        price: activePrice,
        image: activeImage,
        maxStock: currentStock,
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
        <div className="mx-auto w-full max-w-[520px] h-[340px] sm:h-[420px] relative flex items-center justify-center bg-white rounded-[2rem] border border-neutral-200/70 p-6 overflow-hidden shadow-xs">
          {/* Out of Stock Overlay Badge on Image */}
          {isOutOfStock && (
            <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600/90 backdrop-blur-md text-white text-xs font-black shadow-md tracking-wide">
              <PackageX className="w-4 h-4" />
              <span>{t("stock_out_of_stock")}</span>
            </div>
          )}

          <ProductImage
            src={activeImage}
            alt={product.name}
            className={`w-full h-full object-contain transition-all duration-300 ${
              isOutOfStock ? "opacity-60 saturate-50" : ""
            }`}
          />
        </div>

        {/* Variant Thumbnail Gallery Strip */}
        {product.variants && product.variants.length > 1 && (
          <div className="mx-auto w-full max-w-[520px] flex items-center justify-center gap-2 mt-3 overflow-x-auto py-1 px-1 no-scrollbar">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              const vThumb = v.image || product.image;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSelectVariant(v)}
                  className={`relative w-14 h-14 rounded-2xl p-1 bg-white border-2 transition-all active:scale-95 shrink-0 overflow-hidden flex items-center justify-center shadow-xs ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-600/20 scale-105"
                      : "border-neutral-200/80 hover:border-neutral-300 opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`Select ${v.name}`}
                >
                  <ProductImage
                    src={vThumb}
                    alt={v.name}
                    className="w-full h-full object-contain"
                    fallbackIconClassName="w-5 h-5 text-neutral-400 stroke-[1.5]"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-1 ring-white" />
                  )}
                </button>
              );
            })}
          </div>
        )}
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
                {t("home_selling_price")}
              </span>
              <span className="text-2xl font-black text-neutral-900 tracking-tight">
                ${activePrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Stock Availability Indicator Badge */}
          <div className="flex items-center gap-2 pt-0.5">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                <PackageX className="w-3.5 h-3.5" />
                {t("stock_out_of_stock")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <Check className="w-3.5 h-3.5" />
                {t("stock_in_stock")} ({currentStock} {t("stock_available")})
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-neutral-600 leading-relaxed pt-3 border-t border-neutral-200/70">
              {product.description}
            </p>
          )}
        </div>

        {/* Variants Selector */}
        {product.variants && product.variants.length > 0 && (
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200/80 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block">
                {t("detail_choose_variant")} ({product.variants.length})
              </label>
              {selectedVariant && (
                <span className="text-xs font-bold text-blue-600 truncate max-w-[180px]">
                  {selectedVariant.name}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                const vStock = Number(v.stock ?? 0);
                const vOutOfStock = vStock <= 0;
                const vPrice = Number(
                  v.price !== undefined && v.price !== null
                    ? v.price
                    : product.price || 0,
                );
                const vThumb = v.image || product.image;

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectVariant(v)}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all active:scale-[0.98] flex items-center gap-3 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-600/20"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50/50"
                    } ${vOutOfStock ? "opacity-75 bg-neutral-50/60" : ""}`}
                  >
                    {/* Variant Thumbnail */}
                    <div
                      className={`w-12 h-12 rounded-xl border p-1 shrink-0 overflow-hidden flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-white border-blue-200 shadow-xs"
                          : "bg-[#f5f5f7] border-neutral-200/80"
                      }`}
                    >
                      <ProductImage
                        src={vThumb}
                        alt={v.name}
                        className="w-full h-full object-contain"
                        fallbackIconClassName="w-5 h-5 text-neutral-400 stroke-[1.5]"
                      />
                    </div>

                    {/* Variant Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`text-xs font-bold leading-tight truncate ${
                            isSelected
                              ? "text-blue-950 font-extrabold"
                              : "text-neutral-800"
                          }`}
                        >
                          {v.name}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span
                          className={`text-xs font-black tracking-tight ${
                            isSelected ? "text-blue-700" : "text-neutral-900"
                          }`}
                        >
                          ${vPrice.toFixed(2)}
                        </span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                            vOutOfStock
                              ? "bg-rose-100 text-rose-700 font-bold"
                              : "text-neutral-500 bg-neutral-100"
                          }`}
                        >
                          {vOutOfStock
                            ? t("stock_out_of_stock")
                            : `${vStock} ${t("stock_available")}`}
                        </span>
                      </div>
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
              {isOutOfStock
                ? t("stock_out_of_stock")
                : `Total: $${(activePrice * quantity).toFixed(2)} (${currentStock} ${t("stock_available")})`}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-neutral-100 border border-neutral-200/60 rounded-xl p-1 shadow-inner">
            <button
              type="button"
              disabled={isOutOfStock || quantity <= 1}
              onClick={() => {
                hapticFeedback("light");
                updateQuantity(Math.max(1, quantity - 1));
              }}
              className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-neutral-700 hover:text-neutral-900 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <QuantityInput
              value={quantity}
              onChange={(val) => {
                if (isOutOfStock) return;
                const clamped = Math.max(1, Math.min(val, Math.max(1, currentStock)));
                updateQuantity(clamped);
              }}
              label={t("detail_quantity")}
              className="w-16 h-8"
            />
            <button
              type="button"
              disabled={isOutOfStock || quantity >= currentStock}
              onClick={() => {
                if (quantity >= currentStock) {
                  hapticFeedback("warning");
                  setAlertTitle(t("stock_alert_title"));
                  setAlertMessage(t("stock_alert_insufficient"));
                  setOutOfStockModalOpen(true);
                  return;
                }
                hapticFeedback("light");
                updateQuantity(quantity + 1);
              }}
              className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-neutral-700 hover:text-neutral-900 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
            className="flex-1 py-3 px-3 min-h-[46px] rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 bg-blue-600 hover:bg-blue-700 text-white"
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

      {/* Out of Stock Alert Modal */}
      <OutOfStockModal
        isOpen={outOfStockModalOpen}
        onClose={() => setOutOfStockModalOpen(false)}
        title={alertTitle}
        message={alertMessage}
        productName={product.name}
        variantName={selectedVariant?.name}
      />
    </div>
  );
}
