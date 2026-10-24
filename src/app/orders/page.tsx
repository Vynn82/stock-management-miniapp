"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  AlertCircle,
  ReceiptText,
  Building2,
  ArrowRight,
  AlertTriangle,
  Clock,
  RefreshCw,
  MapPin,
  Package,
} from "lucide-react";
import { api } from "@/lib/api";
import { useTelegram } from "@/context/telegram-context";
import { useLanguage } from "@/context/language-context";
import { CustomerOrder, CustomerOrderStatus } from "@/types";

function getStatusBadge(status: CustomerOrderStatus) {
  switch (status) {
    case "PENDING_REVIEW":
      return {
        label: "Pending Review",
        className: "bg-amber-100 text-amber-800 border-amber-200",
      };
    case "WAITING_CUSTOMER":
      return {
        label: "Action Required",
        className:
          "bg-purple-100 text-purple-800 border-purple-200 animate-pulse font-extrabold",
      };
    case "CONFIRMED":
      return {
        label: "Confirmed",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      };
    case "WAITING_STOCK":
      return {
        label: "Waiting Stock",
        className: "bg-orange-100 text-orange-800 border-orange-200",
      };
    case "PROCESSING":
      return {
        label: "Processing",
        className: "bg-cyan-100 text-cyan-800 border-cyan-200",
      };
    case "OUT_FOR_DELIVERY":
      return {
        label: "Out For Delivery",
        className: "bg-indigo-100 text-indigo-800 border-indigo-200",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    case "COMPLETED":
      return {
        label: "Completed (Paid)",
        className: "bg-green-100 text-green-800 border-green-200",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        className: "bg-red-100 text-red-800 border-red-200",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      };
    default:
      return {
        label: status,
        className: "bg-gray-100 text-gray-700 border-gray-200",
      };
  }
}

export default function MyOrdersPage() {
  const { authStatus, authError, refreshAuth, isReady, hapticFeedback } = useTelegram();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"ALL" | "ACTIVE" | "DONE">("ALL");
  const [retrying, setRetrying] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await api.getMyOrders({ limit: 50 });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error("Failed to load orders:", err);
      const msg = err instanceof Error ? err.message : "Failed to load orders";
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const hasStoredToken =
      typeof window !== "undefined" && !!localStorage.getItem("tg_customer_token");

    if (authStatus === "ACTIVE" || hasStoredToken) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [authStatus, isReady, loadOrders]);

  const counts = {
    ALL: orders.length,
    ACTIVE: orders.filter(
      (o) =>
        o.status !== "COMPLETED" &&
        o.status !== "REJECTED" &&
        o.status !== "CANCELLED",
    ).length,
    DONE: orders.filter(
      (o) =>
        o.status === "COMPLETED" ||
        o.status === "REJECTED" ||
        o.status === "CANCELLED",
    ).length,
  };

  const filteredOrders = orders.filter((o) => {
    if (filterTab === "ALL") return true;
    if (filterTab === "ACTIVE") {
      return (
        o.status !== "COMPLETED" &&
        o.status !== "REJECTED" &&
        o.status !== "CANCELLED"
      );
    }
    if (filterTab === "DONE") {
      return (
        o.status === "COMPLETED" ||
        o.status === "REJECTED" ||
        o.status === "CANCELLED"
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-xs">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-base font-bold text-gray-900">{t("orders_title")}</h1>
          <button
            type="button"
            onClick={() => {
              hapticFeedback("light");
              loadOrders();
            }}
            disabled={loading}
            className="p-1.5 text-gray-500 hover:text-blue-600 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1.5"
            aria-label="Refresh orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span className="text-[11px] font-semibold text-gray-600">Refresh</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "DONE"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                hapticFeedback("light");
                setFilterTab(tab);
              }}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                filterTab === tab
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>
                {tab === "ALL"
                  ? t("orders_all")
                  : tab === "ACTIVE"
                    ? t("orders_active")
                    : t("orders_history")}
              </span>
              {orders.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    filterTab === tab
                      ? "bg-white/20 text-white font-bold"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Orders List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse h-28"
              />
            ))}
          </div>
        ) : fetchError ? (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center mt-4">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              Failed to Load Orders
            </h3>
            <p className="text-xs text-red-600 mt-1 max-w-xs mx-auto mb-5 leading-relaxed">
              {fetchError}
            </p>
            <button
              type="button"
              onClick={() => {
                hapticFeedback("medium");
                loadOrders();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors max-w-xs mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        ) : authError && !authStatus && !localStorage.getItem("tg_customer_token") ? (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center mt-4">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              Connection to Server Failed
            </h3>
            <p className="text-xs text-red-600 mt-1 max-w-xs mx-auto mb-5 leading-relaxed">
              {authError}
            </p>
            <button
              type="button"
              disabled={retrying}
              onClick={async () => {
                setRetrying(true);
                try {
                  await refreshAuth();
                  await loadOrders();
                } finally {
                  setRetrying(false);
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors max-w-xs mx-auto"
            >
              {retrying ? "Reconnecting..." : "Retry Connection"}
            </button>
          </div>
        ) : authStatus === "REGISTRATION_REQUIRED" && !localStorage.getItem("tg_customer_token") ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              Partner Registration Required
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto mb-5 leading-relaxed">
              You can freely browse our products. To place orders and track
              their delivery, please register your business profile.
            </p>
            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[44px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                Register as Partner <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/products"
                className="text-xs text-neutral-500 hover:text-neutral-900 py-1"
              >
                Browse Catalog First
              </Link>
            </div>
          </div>
        ) : authStatus === "PENDING" && !localStorage.getItem("tg_customer_token") ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              Registration Under Review
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto mb-5 leading-relaxed">
              Your partner registration is awaiting review by our staff. Once
              approved, your placed orders and history will be visible here.
            </p>
            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[44px] bg-amber-500 text-white rounded-2xl text-xs font-bold shadow-xs hover:bg-amber-600 active:scale-95 transition-all"
              >
                View Registration Status <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/products"
                className="text-xs text-neutral-500 hover:text-neutral-900 py-1"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        ) : authStatus === "REJECTED" && !localStorage.getItem("tg_customer_token") ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-4">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              Registration Not Approved
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto mb-5 leading-relaxed">
              Your registration could not be approved. Please review the staff
              feedback and submit updated details.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[44px] bg-red-600 text-white rounded-2xl text-xs font-bold shadow-xs hover:bg-red-700 active:scale-95 transition-all max-w-xs mx-auto"
            >
              Review Application <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200 mt-6 shadow-xs">
            <ReceiptText className="w-10 h-10 text-blue-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-neutral-800">
              {t("orders_no_orders")}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              {t("orders_no_orders_desc")}
            </p>
            <div className="flex flex-col gap-2 max-w-xs mx-auto mt-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
              >
                {t("orders_start_shopping")} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  loadOrders();
                }}
                className="text-xs text-blue-600 font-semibold hover:underline py-1"
              >
                Check again / Refresh
              </button>
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const isWaitingCustomer = order.status === "WAITING_CUSTOMER";
            const itemCount = order.items?.length || 0;

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className={`block bg-white rounded-2xl border p-4 shadow-xs transition-all hover:shadow active:scale-[0.99] ${
                  isWaitingCustomer
                    ? "border-purple-300 ring-2 ring-purple-100"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-extrabold text-sm text-gray-900 block font-mono">
                      #{order.orderNo}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()} at{" "}
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Attention banner if waiting customer */}
                {isWaitingCustomer && (
                  <div className="my-2 bg-purple-50 text-purple-900 text-[11px] font-semibold p-2.5 rounded-xl flex items-center gap-2 border border-purple-200">
                    <AlertCircle className="w-4 h-4 text-purple-600 shrink-0 animate-bounce" />
                    <span>
                      Staff requested confirmation on stock availability. Tap to reply!
                    </span>
                  </div>
                )}

                {/* Items Summary Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="my-2.5 py-2 px-2.5 bg-gray-50/80 rounded-xl space-y-1 border border-gray-100">
                    {order.items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="text-xs text-gray-700 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          <Package className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate font-medium">
                            {item.product?.name || "Product"}
                            {item.variant?.name ? ` (${item.variant.name})` : ""}
                          </span>
                        </div>
                        <span className="font-mono text-gray-500 text-[11px] shrink-0">
                          x{item.requestedQuantity}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <span className="text-[10px] text-gray-400 font-medium block pt-0.5">
                        +{order.items.length - 2} more item(s)
                      </span>
                    )}
                  </div>
                )}

                {/* Address snippet if available */}
                {order.deliveryAddress && (
                  <div className="mb-2 flex items-center gap-1 text-[11px] text-gray-400 truncate">
                    <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
                    <span className="truncate">{order.deliveryAddress}</span>
                  </div>
                )}

                {/* Footer Row */}
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                  <div className="flex items-center gap-1 text-gray-900 font-extrabold text-sm font-mono">
                    <span>${Number(order.totalAmount || 0).toFixed(2)}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
