"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Banknote,
  UserPlus,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useTelegram } from "@/context/telegram-context";
import { ProductImage } from "@/components/product-image";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, totalAmount, totalCount } =
    useCart();
  const { authStatus, openRegistration, hapticFeedback } = useTelegram();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-neutral-400" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">Your Cart is Empty</h2>
        <p className="text-xs text-neutral-500 mt-1 max-w-[240px]">
          Browse our partner catalog and add products you need to your order.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold shadow-md active:scale-95 transition-all duration-300"
        >
          Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const handleProceedToCheckout = () => {
    hapticFeedback("medium");
    if (authStatus === "REGISTRATION_REQUIRED") {
      openRegistration();
      return;
    }
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbfd] text-[#1d1d1f] pb-48">
      {/* Apple-style Frosted Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/85 border-b border-neutral-200/70 px-4 py-3.5 flex justify-between items-center shadow-xs">
        <div>
          <h1 className="text-base font-black tracking-tight text-neutral-900">
            Shopping Cart
          </h1>
          <span className="text-[10px] text-neutral-400 font-medium">
            Review partner order items
          </span>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200/70">
          {totalCount} {totalCount === 1 ? "item" : "items"}
        </span>
      </header>

      <div className="p-4 space-y-4">
        {/* Cart Items List */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 divide-y divide-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || "base"}`}
              className="p-3.5 flex gap-3.5 items-center"
            >
              {/* Product Thumbnail */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-neutral-50 to-neutral-100/70 border border-neutral-100 shrink-0 overflow-hidden flex items-center justify-center p-1.5">
                <ProductImage
                  src={item.image}
                  alt={item.productName}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Details & Controls */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-1">
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-neutral-900 truncate">
                      {item.productName}
                    </h3>
                    {item.variantName && (
                      <span className="text-[10px] text-blue-600 font-medium block">
                        Variant: {item.variantName}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      hapticFeedback("light");
                      removeFromCart(item.productId, item.variantId);
                    }}
                    className="text-neutral-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between items-center mt-2.5">
                  <span className="text-xs font-black text-neutral-900 tracking-tight">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  {/* Tactile Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-neutral-100/80 border border-neutral-200/60 rounded-xl p-0.5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        hapticFeedback("light");
                        updateQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity - 1,
                        );
                      }}
                      className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-neutral-700 hover:text-neutral-900 active:scale-90 transition-all"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-neutral-900 px-1.5 min-w-[1.2rem] text-center font-mono">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        hapticFeedback("light");
                        updateQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity + 1,
                        );
                      }}
                      className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-neutral-700 hover:text-neutral-900 active:scale-90 transition-all"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Auth status notification if not registered */}
        {authStatus === "REGISTRATION_REQUIRED" && (
          <div className="bg-blue-50/80 border border-blue-200 rounded-3xl p-4 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <UserPlus className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-950 block">
                  Partner Registration Required
                </span>
                <span className="text-[11px] text-blue-800 leading-relaxed">
                  Complete your profile to unlock order placement and delivery tracking.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={openRegistration}
              className="shrink-0 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              Register
            </button>
          </div>
        )}

        {/* Cash On Delivery Policy Card */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-3xl p-4 flex items-start gap-3 text-xs text-amber-950">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Banknote className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-xs block">Manual Cash on Delivery</span>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Payment is collected in cash when your goods are physically delivered to your location.
            </p>
          </div>
        </div>

        {/* Receipt Pricing Card */}
        <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Items Subtotal</span>
            <span className="font-semibold text-neutral-800">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Payment Method</span>
            <span className="font-semibold text-neutral-800">Cash on Delivery</span>
          </div>
          <div className="pt-2 border-t border-neutral-100 flex justify-between items-baseline">
            <span className="text-sm font-black text-neutral-900">Total Due</span>
            <span className="text-xl font-black text-neutral-900">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Sticky Checkout Action with clean clearance above Navigation Bar */}
      <div className="fixed bottom-[4.75rem] left-0 right-0 max-w-md mx-auto px-4 z-40 pointer-events-none">
        <div className="pointer-events-auto backdrop-blur-2xl bg-white/95 border border-neutral-200/80 rounded-2xl p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.12)]">
          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="w-full py-3.5 px-5 min-h-[48px] rounded-xl font-black text-sm bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 hover:from-neutral-900 hover:to-neutral-700 text-white flex items-center justify-between shadow-md active:scale-98 transition-all duration-300 ease-out"
          >
            <span>
              {authStatus === "REGISTRATION_REQUIRED"
                ? "Register & Place Order"
                : "Proceed to Checkout"}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-base font-extrabold">
              ${totalAmount.toFixed(2)} <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
