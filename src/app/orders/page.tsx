"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  AlertCircle,
  ShoppingBag,
  Building2,
  ArrowRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useTelegram } from "@/context/telegram-context";
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
          "bg-purple-100 text-purple-800 border-purple-200 animate-pulse",
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
  const { authStatus, authError, refreshAuth, isReady } = useTelegram();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"ALL" | "ACTIVE" | "DONE">("ALL");
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      if (authStatus !== "ACTIVE") {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isReady) {
      loadOrders();
    }
  }, [authStatus, isReady]);

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
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-xs">
        <h1 className="text-base font-bold text-gray-900 mb-2">My Orders</h1>

        {/* Tab Filters */}
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "DONE"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filterTab === tab
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "ALL"
                ? "All Orders"
                : tab === "ACTIVE"
                  ? "Active"
                  : "History"}
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
        ) : authError && !authStatus ? (
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
                } finally {
                  setRetrying(false);
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors max-w-xs mx-auto"
            >
              {retrying ? "Reconnecting..." : "Retry Connection"}
            </button>
          </div>
        ) : authStatus === "REGISTRATION_REQUIRED" ? (
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
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[44px] bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 hover:from-neutral-900 hover:to-neutral-700 text-white rounded-2xl text-xs font-bold shadow-md active:scale-95 transition-all"
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
        ) : authStatus === "PENDING" ? (
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
        ) : authStatus === "REJECTED" ? (
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
            <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-neutral-800">
              No orders found
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-neutral-950 to-neutral-800 text-white rounded-2xl text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              Start Ordering <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const isWaitingCustomer = order.status === "WAITING_CUSTOMER";

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className={`block bg-white rounded-2xl border p-4 shadow-xs transition-all hover:shadow ${
                  isWaitingCustomer
                    ? "border-purple-300 ring-2 ring-purple-100"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-extrabold text-sm text-gray-900 block">
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
                  <div className="my-2 bg-purple-50 text-purple-900 text-[11px] font-semibold p-2 rounded-xl flex items-center gap-1.5 border border-purple-200">
                    <AlertCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>
                      Staff requested your confirmation. Tap to reply!
                    </span>
                  </div>
                )}

                {/* Footer Row */}
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-500">
                    {order.items?.length || 0}{" "}
                    {order.items?.length === 1 ? "item" : "items"}
                  </span>
                  <div className="flex items-center gap-1 text-gray-900 font-extrabold">
                    <span>${Number(order.totalAmount).toFixed(2)}</span>
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
