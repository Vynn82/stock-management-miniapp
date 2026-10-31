"use client";

import React, { useEffect } from "react";
import { PackageX, X } from "lucide-react";
import { useTelegram } from "@/context/telegram-context";
import { useLanguage } from "@/context/language-context";

interface OutOfStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  productName?: string;
  variantName?: string | null;
}

export function OutOfStockModal({
  isOpen,
  onClose,
  title,
  message,
  productName,
  variantName,
}: OutOfStockModalProps) {
  const { hapticFeedback } = useTelegram();
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      hapticFeedback("warning");
    }
  }, [isOpen, hapticFeedback]);

  if (!isOpen) return null;

  const displayTitle = title || t("stock_alert_title");
  const displayMessage =
    message ||
    (variantName
      ? t("stock_alert_variant_message")
      : t("stock_alert_message"));

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="out-of-stock-title"
    >
      <div
        className="w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl border border-neutral-100 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Emblem */}
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
          <PackageX className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* Title */}
        <h3
          id="out-of-stock-title"
          className="text-lg font-black text-neutral-900 tracking-tight"
        >
          {displayTitle}
        </h3>

        {/* Product / Variant Tag if present */}
        {productName && (
          <div className="mt-2 px-3 py-1 bg-neutral-100 rounded-full max-w-full">
            <p className="text-xs font-bold text-neutral-800 truncate">
              {productName}
              {variantName ? ` • ${variantName}` : ""}
            </p>
          </div>
        )}

        {/* Message */}
        <p className="mt-3 text-xs text-neutral-600 leading-relaxed max-w-[280px]">
          {displayMessage}
        </p>

        {/* Confirm Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3.5 px-5 bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all duration-200"
        >
          {t("stock_alert_ok")}
        </button>
      </div>
    </div>
  );
}

