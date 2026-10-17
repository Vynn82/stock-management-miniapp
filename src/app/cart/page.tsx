"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  ShoppingBag,
  Banknote,
  FileText,
  UserPlus,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useTelegram } from "@/context/telegram-context";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, totalAmount, totalCount } =
    useCart();
  const { authStatus, openRegistration, hapticFeedback } = useTelegram();
  const [remark, setRemark] = useState("");

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
          Browse our partner catalog and add products you need to your order.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
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
    if (remark.trim()) {
      sessionStorage.setItem("tg_order_remark", remark.trim());
    }
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3.5 shadow-xs">
        <h1 className="text-base font-bold text-gray-900">
          Shopping Cart ({totalCount} {totalCount === 1 ? "item" : "items"})
        </h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Cart Items List */}
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-xs">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || "base"}`}
              className="p-3.5 flex gap-3"
            >
              {/* Product Thumbnail */}
              <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-6 h-6 text-gray-300" />
                )}
              </div>

              {/* Details & Controls */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-1">
                      {item.productName}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        hapticFeedback("light");
                        removeFromCart(item.productId, item.variantId);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.variantName && (
                    <span className="text-[10px] text-blue-600 font-medium">
                      Variant: {item.variantName}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-extrabold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
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
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:bg-gray-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-gray-800 px-1">
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
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:bg-gray-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Remarks / Delivery Note */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" /> Delivery
            Instructions / Note
          </label>
          <textarea
            rows={2}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="e.g. Please deliver to warehouse back entrance, Call 012-345-678 upon arrival"
            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Status / Auth Notice */}
        {authStatus === "REGISTRATION_REQUIRED" && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-start justify-between gap-2.5 text-blue-900 text-xs">
            <div className="flex items-start gap-2.5">
              <UserPlus className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Partner Registration Required</span>
                <span className="text-[11px] text-blue-800">
                  You can browse and prepare your order freely. To place this order, please complete your partner registration.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={openRegistration}
              className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              Register
            </button>
          </div>
        )}

        {authStatus === "PENDING" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-900 text-xs">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Registration Under Review</span>
              Your registration is awaiting staff approval. You will be able to complete this order once approved.
            </div>
          </div>
        )}

        {authStatus === "REJECTED" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-red-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Registration Needs Update</span>
              Your partner registration was not approved. Click checkout to review the reason and update your info.
            </div>
          </div>
        )}

        {/* Payment Policy Notice */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-amber-900 text-xs">
          <Banknote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Manual Cash on Delivery</span>
            You do not pay online. Payment is collected in cash by our delivery
            staff upon arrival.
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Items Subtotal</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Payment Method</span>
            <span className="font-semibold text-gray-700">
              Cash on Delivery
            </span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900">Total Due</span>
            <span className="text-lg font-black text-blue-600">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 p-3 z-40">
        <button
          type="button"
          onClick={handleProceedToCheckout}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-between shadow-md active:scale-98 transition-all"
        >
          <span>
            {authStatus === "REGISTRATION_REQUIRED"
              ? "Register & Place Order"
              : authStatus === "PENDING"
              ? "View Approval Status"
              : authStatus === "REJECTED"
              ? "Review Application"
              : "Proceed to Checkout"}
          </span>
          <span className="flex items-center gap-1">
            ${totalAmount.toFixed(2)} <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>
  );
}
