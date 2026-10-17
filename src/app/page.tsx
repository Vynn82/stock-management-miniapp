"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Clock,
  Sparkles,
  Banknote,
  Package,
  ChevronRight,
  Plus,
  Check,
  Building2,
} from "lucide-react";
import { useTelegram } from "@/context/telegram-context";
import { useCart } from "@/context/cart-context";
import { api } from "@/lib/api";
import { Category, CustomerOrder, Product } from "@/types";

export default function HomePage() {
  const {
    customer,
    authStatus,
    telegramUser,
    openRegistration,
    hapticFeedback,
  } = useTelegram();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentOrder, setRecentOrder] = useState<CustomerOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods, orders] = await Promise.all([
          api.getCategories().catch(() => []),
          api.getProducts({ limit: 6 }).catch(() => []),
          api.getMyOrders({ limit: 1 }).catch(() => []),
        ]);

        setCategories(cats);
        setFeaturedProducts(prods);
        if (orders && orders.length > 0) {
          setRecentOrder(orders[0]);
        }
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    hapticFeedback("medium");
    addToCart({
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      price: Number(product.price),
      image: product.image,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-6">
      {/* Header & Greeting */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 rounded-b-2xl shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                Partner Store
              </span>
              {authStatus === "ACTIVE" && (
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold flex items-center gap-1.5 mt-0.5">
              Welcome, {customer?.firstName || telegramUser?.firstName || "Partner"} 👋
            </h1>
            {customer?.companyName ? (
              <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5">
                🏢 {customer.companyName}
              </p>
            ) : authStatus === "REGISTRATION_REQUIRED" ? (
              <button
                type="button"
                onClick={openRegistration}
                className="inline-flex items-center gap-1 text-[11px] text-blue-100 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md mt-1 transition-colors font-medium text-left"
              >
                Register as Partner →
              </button>
            ) : null}
          </div>
          <Link
            href="/cart"
            className="bg-white/15 hover:bg-white/25 p-2.5 rounded-full transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
          </Link>
        </div>

        {/* Search Input */}
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
              }
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-300"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        </div>
      </header>

      <div className="px-4 space-y-5 mt-4">
        {/* Auth Status Notification Banners for Unregistered / Pending / Rejected */}
        {authStatus === "REGISTRATION_REQUIRED" && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xs text-blue-950">
                Browse Live Catalog • Register to Order
              </h3>
              <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                You can browse products freely. To place wholesale and retail orders for delivery, please register your partner business.
              </p>
              <button
                type="button"
                onClick={openRegistration}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                Register as Partner <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}



        {/* Cash On Delivery Notification Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-900">
          <Banknote className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold block">💵 Cash on Delivery</span>
            Manual cash payment is collected by staff when your items are
            delivered.
          </div>
        </div>

        {/* Recent Order Status Alert (If exists) */}
        {recentOrder && (
          <Link
            href={`/orders/${recentOrder.id}`}
            className="block bg-white border border-blue-100 rounded-xl p-3.5 shadow-sm hover:border-blue-300 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-gray-800">
                  Order #{recentOrder.orderNo}
                </span>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                {recentOrder.status.replace(/_/g, " ")}
              </span>
            </div>
            <div className="mt-1 flex justify-between items-center text-xs text-gray-500">
              <span>
                {recentOrder.items?.length || 0} items &bull; $
                {Number(recentOrder.totalAmount).toFixed(2)}
              </span>
              <span className="text-blue-600 flex items-center gap-0.5 font-medium">
                Track <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        )}

        {/* Categories Bar */}
        {categories.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-sm font-bold text-gray-900">Categories</h2>
              <Link
                href="/products"
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                See all
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?categoryId=${cat.id}`}
                  className="bg-white border border-gray-200 px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-700 whitespace-nowrap hover:bg-blue-50 hover:border-blue-300 transition-colors shrink-0"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products Grid */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Featured Products
            </h2>
            <Link
              href="/products"
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View catalog
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-3 border border-gray-100 animate-pulse h-48"
                />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500 text-xs border border-gray-200">
              No products found in catalog.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.map((product) => {
                const isJustAdded = addedId === product.id;
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-32 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-10 h-10 text-gray-300" />
                        )}
                        {product.totalStock !== undefined && (
                          <span
                            className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              product.totalStock > 0
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.totalStock > 0
                              ? `Stock: ${product.totalStock}`
                              : "Out of stock"}
                          </span>
                        )}
                      </div>

                      <div className="p-3">
                        <h3 className="font-semibold text-xs text-gray-800 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Code: {product.code}
                        </p>
                      </div>
                    </div>

                    <div className="px-3 pb-3 pt-0 flex justify-between items-center">
                      <span className="font-bold text-sm text-gray-900">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(product, e)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                          isJustAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Access Action Bar */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/cart"
            className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold text-xs border border-blue-200"
          >
            <ShoppingCart className="w-4 h-4" /> Open Cart
          </Link>
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-semibold text-xs border border-indigo-200"
          >
            <Clock className="w-4 h-4" /> My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
