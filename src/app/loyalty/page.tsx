"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Crown,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Percent,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { LoyaltyProfile } from "@/types";
import { useLanguage } from "@/context/language-context";
import { useTelegram } from "@/context/telegram-context";

export default function LoyaltyPage() {
  const { t } = useLanguage();
  const { hapticFeedback } = useTelegram();
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyLoyaltyProfile();
      setProfile(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load loyalty profile";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const getTierGradient = (code?: string) => {
    switch (code) {
      case "VIP":
        return "from-amber-500 via-amber-600 to-yellow-500 text-white shadow-amber-500/25";
      case "REGULAR":
        return "from-purple-600 via-indigo-600 to-blue-600 text-white shadow-purple-500/25";
      case "RETURNING":
        return "from-blue-600 to-cyan-600 text-white shadow-blue-500/25";
      case "NEW":
      default:
        return "from-slate-700 to-slate-900 text-white shadow-slate-500/20";
    }
  };



  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7] text-[#1d1d1f] pb-32">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#f5f5f7]/90 border-b border-neutral-200/70 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            onClick={() => hapticFeedback("light")}
            className="w-9 h-9 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-center text-neutral-700 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-black tracking-tight text-neutral-900">
              {t("loyalty_title")}
            </h1>
            <span className="text-[10px] text-neutral-400 font-medium">
              {t("loyalty_subtitle")}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            hapticFeedback("light");
            fetchProfile();
          }}
          disabled={loading}
          className="p-2 rounded-2xl bg-white border border-neutral-200/80 text-neutral-600 shadow-xs active:scale-95 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
        </button>
      </header>

      <div className="p-4 pt-5 space-y-4 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-48 rounded-[2rem] bg-neutral-200/80" />
            <div className="h-32 rounded-[1.6rem] bg-neutral-200/80" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 rounded-2xl bg-neutral-200/80" />
              <div className="h-24 rounded-2xl bg-neutral-200/80" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-3xl text-center space-y-2">
            <p className="text-xs font-bold">{error}</p>
            <button
              onClick={fetchProfile}
              className="text-xs font-bold underline text-red-800"
            >
              Try Again
            </button>
          </div>
        ) : profile ? (
          <>
            {/* HERO TIER CARD */}
            <div
              className={`relative overflow-hidden rounded-[2rem] p-6 bg-gradient-to-br ${getTierGradient(
                profile.currentTier.code,
              )} shadow-xl`}
            >
              {/* Background ambient pattern */}
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-black/10 blur-xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 block">
                      {t("loyalty_tier_badge")}
                    </span>
                    <h2 className="text-2xl font-black tracking-tight mt-0.5 flex items-center gap-2">
                      {profile.currentTier.name}
                      <Crown className="w-5 h-5 text-amber-300" />
                    </h2>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-xs font-black shadow-xs">
                    {profile.currentTier.discountPercent > 0
                      ? `${profile.currentTier.discountPercent}% OFF`
                      : "Standard"}
                  </div>
                </div>

                {profile.currentTier.isManualOverride && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t("loyalty_manual_override_badge")}</span>
                    {profile.currentTier.overrideNotes && (
                      <span className="opacity-80">({profile.currentTier.overrideNotes})</span>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-white/15 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] opacity-75 block">Member</span>
                    <span className="font-bold">{profile.customer.contactName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] opacity-75 block">Benefit</span>
                    <span className="font-bold">
                      {profile.currentTier.discountPercent > 0
                        ? `${profile.currentTier.discountPercent}${t("loyalty_discount_benefit")}`
                        : "Shop to unlock tier discounts"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* NEXT TIER PROGRESS CARD */}
            {profile.progress.nextTier ? (
              <div className="bg-white p-5 rounded-[1.8rem] border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-neutral-900">
                        {t("loyalty_next_tier_progress")}
                      </h3>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        Target: {profile.progress.nextTier.name} ({profile.progress.nextTier.discountPercent}% OFF)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {profile.progress.overallProgressPercent}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: `${Math.min(100, profile.progress.overallProgressPercent)}%` }}
                  />
                </div>

                {/* Dual Requirement Checkers */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 space-y-0.5">
                    <span className="text-[10px] text-neutral-400 font-medium block">
                      Spending Progress
                    </span>
                    <span className="font-bold text-neutral-800 block text-xs">
                      ${profile.statistics.lifetimeSpending.toFixed(2)} / ${profile.progress.nextTier.minSpending.toFixed(2)}
                    </span>
                    {profile.progress.spendingNeeded > 0 ? (
                      <span className="text-[10px] text-amber-600 font-semibold block">
                        +${profile.progress.spendingNeeded.toFixed(2)} {t("loyalty_spending_needed")}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        ✓ Requirement Met
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 space-y-0.5">
                    <span className="text-[10px] text-neutral-400 font-medium block">
                      Order Count Progress
                    </span>
                    <span className="font-bold text-neutral-800 block text-xs">
                      {profile.statistics.completedOrderCount} / {profile.progress.nextTier.minOrders} orders
                    </span>
                    {profile.progress.ordersNeeded > 0 ? (
                      <span className="text-[10px] text-amber-600 font-semibold block">
                        +{profile.progress.ordersNeeded} {t("loyalty_orders_needed")}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        ✓ Requirement Met
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-300/80 rounded-[1.8rem] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-amber-500/25">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-amber-950">Top VIP Tier Achieved!</h3>
                  <p className="text-[11px] text-amber-800">
                    You have unlocked our maximum loyalty discount of {profile.currentTier.discountPercent}% on all qualifying wholesale orders.
                  </p>
                </div>
              </div>
            )}

            {/* PURCHASE STATISTICS GRID (Requirement 2 & 7) */}
            <div className="bg-white p-5 rounded-[1.8rem] border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-neutral-900">
                    {t("loyalty_stats_title")}
                  </h3>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    Verified completed order metrics
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-neutral-50/80 border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-semibold block">
                    {t("loyalty_lifetime_spending")}
                  </span>
                  <span className="text-base font-black text-neutral-900 mt-0.5 block">
                    ${profile.statistics.lifetimeSpending.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50/80 border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-semibold block">
                    {t("loyalty_completed_orders")}
                  </span>
                  <span className="text-base font-black text-neutral-900 mt-0.5 block">
                    {profile.statistics.completedOrderCount} orders
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50/80 border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-semibold block">
                    {t("loyalty_aov")}
                  </span>
                  <span className="text-base font-black text-neutral-900 mt-0.5 block">
                    ${profile.statistics.averageOrderValue.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50/80 border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-semibold block">
                    {t("loyalty_total_quantity")}
                  </span>
                  <span className="text-base font-black text-neutral-900 mt-0.5 block">
                    {profile.statistics.totalQuantityPurchased} items
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50/80 border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-semibold block">
                    {t("loyalty_purchase_freq")}
                  </span>
                  <span className="text-base font-black text-neutral-900 mt-0.5 block">
                    {profile.statistics.purchaseFrequencyDays > 0
                      ? `${profile.statistics.purchaseFrequencyDays} days`
                      : "First cycle"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100/80">
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    {t("loyalty_discounts_received")}
                  </span>
                  <span className="text-base font-black text-emerald-800 mt-0.5 block">
                    ${profile.statistics.totalDiscountsReceived.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* PRODUCT PURCHASE HISTORY (Requirement 2 & 7) */}
            <div className="bg-white p-5 rounded-[1.8rem] border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-neutral-900">
                    {t("loyalty_product_history")}
                  </h3>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    Quantity and spending per product
                  </span>
                </div>
              </div>

              {profile.productHistory && profile.productHistory.length > 0 ? (
                <div className="divide-y divide-neutral-100">
                  {profile.productHistory.map((item) => (
                    <div key={item.productId} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-3">
                        <span className="font-bold text-neutral-900 block truncate">
                          {item.productName}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block">
                          {item.totalQuantity} {t("loyalty_product_units")} &middot; {item.orderCount} {t("loyalty_product_orders")}
                        </span>
                      </div>
                      <span className="font-extrabold text-neutral-800 shrink-0">
                        ${item.totalSpending.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic py-2">
                  No completed product purchases recorded yet.
                </p>
              )}
            </div>

            {/* RECENT SAVINGS / DISCOUNTED ORDERS */}
            {profile.recentDiscountedOrders && profile.recentDiscountedOrders.length > 0 && (
              <div className="bg-white p-5 rounded-[1.8rem] border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-neutral-900">
                      Loyalty Discounts Received
                    </h3>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Recent order savings summary
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-neutral-100">
                  {profile.recentDiscountedOrders.map((ord) => (
                    <div key={ord.orderId} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-neutral-900 block">{ord.orderNo}</span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString()} &middot; Subtotal: ${ord.subtotalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-600 block">
                          -${ord.discountAmount.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium block">
                          Paid ${ord.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
