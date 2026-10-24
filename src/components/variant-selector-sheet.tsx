"use client";

import React, { useState, useEffect } from "react";
import { X, Check, ShoppingCart, Plus, Minus, Layers } from "lucide-react";
import { Product, ProductVariant, CartItem } from "@/types";
import { ProductImage } from "./product-image";
import { QuantityInput } from "./quantity-input";
import { useTelegram } from "@/context/telegram-context";
import { useLanguage } from "@/context/language-context";

interface VariantSelectorSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, "quantity">, quantity: number) => void;
}

export function VariantSelectorSheet({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: VariantSelectorSheetProps) {
  const { hapticFeedback } = useTelegram();
  const { t } = useLanguage();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setQuantity(1);
    setIsAdded(false);
  }, [product]);

  if (!isOpen || !product) return null;

  const activePrice = Number(
    selectedVariant?.price !== undefined && selectedVariant?.price !== null
      ? selectedVariant.price
      : product.price || 0,
  );

  const activeImage = selectedVariant?.image || product.image;
  const subtotal = activePrice * quantity;

  const handleConfirmAdd = () => {
    hapticFeedback("success");
    setIsAdded(true);

    onAddToCart(
      {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        productName: product.name,
        variantName: selectedVariant?.name || null,
        productCode: selectedVariant?.code || product.code,
        price: activePrice,
        image: activeImage,
      },
      quantity,
    );

    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] animate-in slide-in-from-bottom duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-sheet-title"
      >
        {/* Grab Handle (mobile) */}
        <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Product Quick Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-start justify-between gap-3 bg-neutral-50/60">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-neutral-200/80 p-2 shrink-0 overflow-hidden flex items-center justify-center shadow-xs">
              <ProductImage
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain transition-all duration-300"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">
                {product.category?.name || "Product"}
              </span>
              <h2
                id="variant-sheet-title"
                className="text-sm sm:text-base font-extrabold text-neutral-900 leading-snug line-clamp-1"
              >
                {product.name}
              </h2>

              {/* Dynamic Live Price Display */}
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                  ${activePrice.toFixed(2)}
                </span>
                {selectedVariant && (
                  <span className="text-xs text-blue-600 font-semibold truncate max-w-[150px]">
                    {selectedVariant.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5 overscroll-contain">
          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800 tracking-wide flex items-center gap-1.5 uppercase">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t("detail_choose_variant")}</span>
                </label>
                <span className="text-[11px] text-neutral-400 font-medium">
                  {product.variants.length} option{product.variants.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const vPrice = Number(
                    v.price !== undefined && v.price !== null
                      ? v.price
                      : product.price || 0,
                  );

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        hapticFeedback("light");
                        setSelectedVariant(v);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-600/20"
                          : "border-neutral-200 hover:border-neutral-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-xs font-bold leading-tight ${
                            isSelected ? "text-blue-950 font-extrabold" : "text-neutral-800"
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

                      <div className="flex items-center justify-between pt-1">
                        <span
                          className={`text-xs font-black tracking-tight ${
                            isSelected ? "text-blue-700" : "text-neutral-900"
                          }`}
                        >
                          ${vPrice.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="bg-neutral-50/80 p-3.5 rounded-2xl border border-neutral-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-neutral-900 block">
                {t("detail_quantity")}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                Subtotal: <strong className="text-neutral-900 font-bold">${subtotal.toFixed(2)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl p-1 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  setQuantity((q) => Math.max(1, q - 1));
                }}
                className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 active:scale-90 transition-all"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <QuantityInput
                value={quantity}
                onChange={setQuantity}
                label={t("detail_quantity")}
                className="w-14 h-7 text-xs font-bold"
              />
              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  setQuantity((q) => q + 1);
                }}
                className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 active:scale-90 transition-all"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions (Sticky Bottom with Safe Area Padding) */}
        <div className="p-4 pb-8 sm:pb-4 border-t border-neutral-100 bg-white shrink-0 shadow-[0_-8px_20px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={handleConfirmAdd}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] ${
              isAdded
                ? "bg-emerald-600 text-white shadow-emerald-500/20"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 animate-in zoom-in-75" />
                <span>{t("detail_added")}!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>{t("detail_add_to_cart")}</span>
                <span className="opacity-80 font-normal">&bull;</span>
                <span className="font-mono font-bold">${subtotal.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
