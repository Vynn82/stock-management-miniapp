"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ShieldAlert,
  ShoppingCart,
  MapPin,
  Navigation,
  Edit3,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useTelegram } from "@/context/telegram-context";
import { useLanguage } from "@/context/language-context";
import { api } from "@/lib/api";
import { AuthGate } from "@/components/auth-gate";
import { LocationMapPicker } from "@/components/location-map-picker";
import { ProductImage } from "@/components/product-image";
import { LocationData } from "@/types";

function CheckoutContent() {
  const router = useRouter();
  const { items, totalAmount, totalCount, clearCart } = useCart();
  const { customer, hapticFeedback } = useTelegram();
  const { t } = useLanguage();

  // Delivery Location State
  // Follows registered customer by default
  const [locationType, setLocationType] = useState<"REGISTERED" | "CUSTOM">("REGISTERED");

  // Custom location state if customer chooses a different address for this order
  const [customAddress, setCustomAddress] = useState("");
  const [customLat, setCustomLat] = useState<number | null>(null);
  const [customLng, setCustomLng] = useState<number | null>(null);
  const [customProvince, setCustomProvince] = useState<string | null>(null);
  const [customDistrict, setCustomDistrict] = useState<string | null>(null);
  const [customCommune, setCustomCommune] = useState<string | null>(null);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedRemark = sessionStorage.getItem("tg_order_remark");
    if (savedRemark) {
      setRemark(savedRemark);
    }
  }, []);

  if (items.length === 0) {
    return (
      <div className="p-8 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">{t("cart_empty_title")}</h2>
        <p className="text-xs text-neutral-500 mt-1 max-w-[240px]">
          {t("cart_empty_subtitle")}
        </p>
        <Link
          href="/products"
          className="mt-5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 rounded-2xl shadow-md shadow-blue-500/20 transition-all"
        >
          {t("checkout_return_catalog")}
        </Link>
      </div>
    );
  }

  const handleConfirmCustomLocation = (loc: LocationData) => {
    setCustomAddress(loc.address);
    setCustomLat(loc.latitude);
    setCustomLng(loc.longitude);
    setCustomProvince(loc.province || null);
    setCustomDistrict(loc.district || null);
    setCustomCommune(loc.commune || null);
    setLocationType("CUSTOM");
    hapticFeedback("success");
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError(null);
    hapticFeedback("medium");

    try {
      const isCustom = locationType === "CUSTOM";
      const deliveryAddress = isCustom
        ? customAddress.trim()
        : customer?.address?.trim() || undefined;

      if (isCustom && !deliveryAddress) {
        throw new Error("Please specify your delivery address or pick a point on the map.");
      }

      // If custom coordinates exist, include them in delivery note so logistics can locate instantly
      let finalRemark = remark.trim();
      if (isCustom && customLat && customLng) {
        const pinText = `[Custom Pin: ${customLat.toFixed(6)}, ${customLng.toFixed(6)}]`;
        finalRemark = finalRemark ? `${finalRemark} | ${pinText}` : pinText;
      }

      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        })),
        deliveryAddress: deliveryAddress || undefined,
        remark: finalRemark || undefined,
      };

      const order = await api.createOrder(orderPayload);
      clearCart();
      sessionStorage.removeItem("tg_order_remark");
      hapticFeedback("success");

      router.push(`/orders/${order.id}`);
    } catch (err: unknown) {
      console.error("Order creation failed:", err);
      const message =
        err instanceof Error ? err.message : "Failed to place order. Please try again.";
      setError(message);
      hapticFeedback("error");
    } finally {
      setSubmitting(false);
    }
  };

  const registeredArea = [customer?.commune, customer?.district, customer?.province]
    .filter(Boolean)
    .join(", ");

  const customArea = [customCommune, customDistrict, customProvince]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbfd] text-[#1d1d1f] pb-32">
      {/* Apple-style Frosted Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/85 border-b border-neutral-200/70 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-2xl hover:bg-neutral-100 text-neutral-700 active:scale-95 transition-all"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black tracking-tight text-neutral-900">
            {t("checkout_title")}
          </h1>
          <span className="text-[10px] text-neutral-400 font-medium">
            {t("checkout_subtitle")}
          </span>
        </div>
        <div className="w-8" />
      </header>

      <div className="p-4 space-y-4">
        {/* Recipient Profile Card */}
        <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
              Partner Identity
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Account
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-extrabold text-sm text-neutral-900">
                {customer?.contactName || `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() || "Partner"}
              </p>
              {customer?.companyName && (
                <p className="text-xs text-blue-600 font-semibold mt-0.5">
                  🏢 {customer.companyName}
                </p>
              )}
              {customer?.phone && (
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  📞 {customer.phone}
                </p>
              )}
            </div>

            {customer?.telegramUsername && (
              <span className="text-xs text-neutral-500 font-mono bg-neutral-100 px-2.5 py-1 rounded-xl">
                @{customer.telegramUsername}
              </span>
            )}
          </div>
        </div>

        {/* Delivery Location Section with Switcher */}
        <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {t("checkout_delivery_point")}
            </span>

            {/* Location Type Selector Pills */}
            <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setLocationType("REGISTERED");
                  hapticFeedback("light");
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  locationType === "REGISTERED"
                    ? "bg-white text-blue-600 font-bold shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {t("checkout_registered_address")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocationType("CUSTOM");
                  hapticFeedback("light");
                  if (!customAddress && customer?.address) {
                    setCustomAddress(customer.address);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  locationType === "CUSTOM"
                    ? "bg-white text-blue-600 font-bold shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {t("checkout_different_location")}
              </button>
            </div>
          </div>

          {/* Option A: Registered Profile Address */}
          {locationType === "REGISTERED" ? (
            <div className="bg-neutral-50/80 border border-neutral-200/60 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                      {t("checkout_primary_profile_address")}
                    </span>
                    {customer?.latitude && customer?.longitude ? (
                      <span className="text-[10px] font-medium text-neutral-500 flex items-center gap-0.5 font-mono">
                        <Navigation className="w-3 h-3 text-blue-500" />
                        {t("checkout_pinned")}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs font-semibold text-neutral-900 leading-relaxed pt-0.5">
                    {customer?.address || "No saved address found on profile."}
                  </p>
                  {registeredArea ? (
                    <p className="text-[11px] text-neutral-500 font-medium">
                      {registeredArea}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200/50 flex justify-between items-center text-[11px]">
                <span className="text-neutral-400">
                  Follows your verified registration
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLocationType("CUSTOM");
                    setIsMapOpen(true);
                  }}
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> {t("checkout_change_order_location")}
                </button>
              </div>
            </div>
          ) : (
            /* Option B: Choose Different Location */
            <div className="space-y-3">
              <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-neutral-900">
                    {t("checkout_custom_delivery_point")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMapOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {customAddress ? t("checkout_repin_on_map") : t("checkout_select_on_map")}
                  </button>
                </div>

                {customAddress ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-neutral-900 leading-relaxed">
                      {customAddress}
                    </p>
                    {customArea ? (
                      <p className="text-[11px] text-neutral-500">
                        {customArea}
                      </p>
                    ) : null}
                    {customLat && customLng ? (
                      <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-blue-700">
                        <Navigation className="w-3 h-3" />
                        <span>
                          {customLat.toFixed(6)}, {customLng.toFixed(6)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic">
                    Tap &quot;Select on Map&quot; to drop a precise delivery pin or enter below.
                  </p>
                )}
              </div>

              {/* Manual Address Refinement */}
              <div>
                <label className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase block mb-1">
                  Specific Delivery Notes / Street Address *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Building A, Floor 3, Street 2004, Phnom Penh"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Order Items Preview (Apple Receipt Style) */}
        <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
              Order Summary ({totalCount} items)
            </span>
            <Link
              href="/cart"
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Edit Cart
            </Link>
          </div>

          <div className="divide-y divide-neutral-100">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || "base"}`}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 overflow-hidden flex items-center justify-center shrink-0 p-1">
                    <ProductImage
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-neutral-900 block truncate">
                      {item.productName}
                    </span>
                    {item.variantName && (
                      <span className="text-[11px] text-blue-600 font-medium block">
                        Variant: {item.variantName}
                      </span>
                    )}
                    <span className="text-neutral-400 text-[11px] block mt-0.5">
                      {item.quantity} &times; ${item.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <span className="font-black text-sm text-neutral-900 shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-800">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Delivery Method</span>
              <span className="font-semibold text-emerald-600">
                Staff Dispatch (Free)
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-100 flex justify-between items-baseline">
              <span className="text-sm font-black text-neutral-900">
                Total Payable
              </span>
              <span className="text-lg font-black text-blue-600">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Instructions Remark */}
        <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <label className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1.5">
            Delivery Remark / Special Note
          </label>
          <textarea
            rows={2}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="e.g. Please deliver to warehouse back entrance, Call 012-345-678 upon arrival"
            className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 resize-none transition-all"
          />
        </div>

        {/* Cash on Delivery Notice */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-3xl p-4 flex items-start gap-3 text-xs text-amber-950">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Banknote className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-xs block">
              Cash on Delivery Payment
            </span>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              No digital payment required right now. Staff will verify items and collect cash payment directly when delivered to your location.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
            <span className="font-semibold">{error}</span>
          </div>
        )}
      </div>

      {/* Floating Bottom Sticky Action - positioned at bottom-0 since navbar is hidden */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto backdrop-blur-2xl bg-white/95 border-t border-neutral-200/80 p-4 pb-6 z-40 shadow-[0_-10px_35px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          disabled={submitting}
          onClick={handlePlaceOrder}
          className="w-full py-3.5 px-5 min-h-[50px] rounded-2xl font-black text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 disabled:from-neutral-400 disabled:to-neutral-400 text-white flex items-center justify-between shadow-xl shadow-blue-500/25 active:scale-98 transition-all duration-300 ease-out"
        >
          {submitting ? (
            <span className="w-full flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t("checkout_submitting")}
            </span>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {t("checkout_place_order")}
              </span>
              <span className="font-mono text-base font-extrabold">
                ${totalAmount.toFixed(2)}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Map Picker Modal */}
      {isMapOpen && (
        <LocationMapPicker
          isOpen={isMapOpen}
          initialLat={
            customLat ||
            (customer?.latitude ? Number(customer.latitude) : undefined)
          }
          initialLng={
            customLng ||
            (customer?.longitude ? Number(customer.longitude) : undefined)
          }
          initialAddress={customAddress || customer?.address || ""}
          onClose={() => setIsMapOpen(false)}
          onConfirm={handleConfirmCustomLocation}
        />
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGate
      title="Partner Registration Required"
      subtitle="Please complete your partner registration before placing your order."
      showBackToStore={true}
    >
      <CheckoutContent />
    </AuthGate>
  );
}
