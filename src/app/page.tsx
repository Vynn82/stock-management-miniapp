"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Clock,
  Sparkles,
  Banknote,
  Package,
  ChevronRight,
  Plus,
  Check,
  Building2,
  ShieldCheck,
  Truck,
  ArrowRight,
} from "lucide-react";
import { useTelegram } from "@/context/telegram-context";
import { useCart } from "@/context/cart-context";
import { api } from "@/lib/api";
import { Category, CustomerOrder, Product } from "@/types";
import { ProductImage } from "@/components/product-image";

export default function HomePage() {
  const {
    customer,
    authStatus,
    telegramUser,
    openRegistration,
    hapticFeedback,
  } = useTelegram();
  const { addToCart, totalCount } = useCart();

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
    setTimeout(() => setAddedId(null), 1400);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbfd] text-[#1d1d1f] pb-24">
      {/* Apple-style Flagship Hero Showcase */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b0c10] via-[#141622] to-[#1d2238] text-white pt-6 pb-7 px-5 rounded-b-[2rem] shadow-xl">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Row: Brand & Cart */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-300">
                Partner Store
              </span>
              {authStatus === "ACTIVE" ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Verified
                </span>
              ) : null}
            </div>

            <Link
              href="/cart"
              className="relative p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 active:scale-95 transition-all duration-300 ease-out flex items-center justify-center"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-white" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-extrabold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-lg animate-in zoom-in-75">
                  {totalCount > 99 ? "99+" : totalCount}
                </span>
              )}
            </Link>
          </div>

          {/* User Welcome */}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white/95">
              Welcome, {customer?.firstName || telegramUser?.firstName || "Partner"}
            </h1>
            {customer?.companyName ? (
              <p className="text-xs text-neutral-300 font-medium flex items-center gap-1.5 mt-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                {customer.companyName}
              </p>
            ) : authStatus === "REGISTRATION_REQUIRED" ? (
              <button
                type="button"
                onClick={openRegistration}
                className="inline-flex items-center gap-1.5 text-xs text-blue-300 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-xl mt-1.5 transition-all font-semibold border border-white/10"
              >
                Complete Partner Registration <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Apple Glass Search Bar */}
          <div className="relative pt-1">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 pointer-events-none transition-colors" />
              <input
                type="text"
                placeholder="Search products, SKUs, or codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="w-full pl-11 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white focus:text-neutral-900 focus:placeholder:text-neutral-400 placeholder:text-neutral-400 text-white text-xs font-medium rounded-2xl backdrop-blur-xl border border-white/15 outline-none focus:ring-4 focus:ring-blue-500/20 shadow-inner transition-all duration-300 ease-out"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="px-4 space-y-6 mt-5">
        {/* Unregistered Callout */}
        {authStatus === "REGISTRATION_REQUIRED" && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-5 shadow-lg shadow-blue-500/10">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] tracking-wider uppercase font-bold text-blue-200 block">
                  Partner Access
                </span>
                <h3 className="font-bold text-sm text-white mt-0.5">
                  Register to Unlock Ordering
                </h3>
                <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
                  Browse products freely. Complete your partner company profile to order wholesale with delivery.
                </p>
                <button
                  type="button"
                  onClick={openRegistration}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all"
                >
                  Register Partner Account <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feature Highlights Strip (Apple / Samsung Trust Pills) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl p-2.5 border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-center flex flex-col items-center justify-center gap-1">
            <Truck className="w-4 h-4 text-blue-600" />
            <span className="text-[11px] font-bold text-neutral-800 leading-tight">Direct Dispatch</span>
            <span className="text-[9px] text-neutral-400">Fast delivery</span>
          </div>

          <div className="bg-white rounded-2xl p-2.5 border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-center flex flex-col items-center justify-center gap-1">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-bold text-neutral-800 leading-tight">Cash On Delivery</span>
            <span className="text-[9px] text-neutral-400">Pay on arrival</span>
          </div>

          <div className="bg-white rounded-2xl p-2.5 border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-center flex flex-col items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-[11px] font-bold text-neutral-800 leading-tight">Verified Stock</span>
            <span className="text-[9px] text-neutral-400">Authentic goods</span>
          </div>
        </div>

        {/* Recent Order Card (Apple Wallet Style) */}
        {recentOrder && (
          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <h2 className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                Active Order
              </h2>
              <Link
                href="/orders"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                All Orders →
              </Link>
            </div>
            <Link
              href={`/orders/${recentOrder.id}`}
              className="block bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-300 transition-all duration-300 ease-out active:scale-[0.99]"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-neutral-900 block">
                      Order #{recentOrder.orderNo}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(recentOrder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200/60">
                  {recentOrder.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-medium">
                  {recentOrder.items?.length || 0} items &bull; ${Number(recentOrder.totalAmount).toFixed(2)}
                </span>
                <span className="text-blue-600 font-bold flex items-center gap-0.5 text-xs">
                  Track Delivery <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Categories Horizontal Carousel */}
        {categories.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2.5 px-1">
              <h2 className="text-sm font-extrabold text-neutral-900 tracking-tight">
                Categories
              </h2>
              <Link
                href="/products"
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <Link
                href="/products"
                className="bg-neutral-900 text-white px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap shadow-sm shrink-0 active:scale-95 transition-transform"
              >
                All Catalog
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?categoryId=${cat.id}`}
                  className="bg-white border border-neutral-200/90 px-4 py-2 rounded-2xl text-xs font-semibold text-neutral-700 whitespace-nowrap hover:bg-neutral-50 hover:border-neutral-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)] shrink-0 active:scale-95 transition-all"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products Section */}
        <div>
          <div className="flex justify-between items-baseline mb-3 px-1">
            <div>
              <h2 className="text-base font-black text-neutral-900 tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Featured Highlights
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">Top-rated items in live inventory</p>
            </div>
            <Link
              href="/products"
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Browse all
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-3 border border-neutral-200/70 h-56 flex flex-col justify-between animate-shimmer"
                />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-neutral-500 text-xs border border-neutral-200">
              No products found in catalog.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {featuredProducts.map((product) => {
                const isJustAdded = addedId === product.id;
                const inStock = (product.totalStock ?? 1) > 0;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group bg-white rounded-3xl border border-neutral-200/80 p-3 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image Frame */}
                      <div className="h-36 bg-gradient-to-b from-neutral-50 to-neutral-100/70 rounded-2xl relative overflow-hidden flex items-center justify-center p-2.5">
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                        />

                        {/* Stock Badge */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-md bg-white/85 shadow-xs">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inStock ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                            }`}
                          />
                          <span className={inStock ? "text-neutral-700" : "text-red-700"}>
                            {inStock ? "In Stock" : "Out"}
                          </span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="pt-2.5 px-1">
                        <span className="text-[10px] text-neutral-400 font-mono tracking-tight block">
                          {product.code}
                        </span>
                        <h3 className="font-bold text-xs text-neutral-900 tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors mt-0.5">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    {/* Price & Action Row */}
                    <div className="pt-3 px-1 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-neutral-400 block -mb-0.5">Wholesale</span>
                        <span className="font-black text-sm text-neutral-900 tracking-tight">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(product, e)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-85 transition-all duration-300 ease-out ${
                          isJustAdded
                            ? "bg-emerald-600 text-white rotate-0"
                            : "bg-neutral-900 hover:bg-blue-600 text-white"
                        }`}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        {isJustAdded ? (
                          <Check className="w-4 h-4 animate-in zoom-in-50" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Dock Links */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-800 rounded-2xl font-bold text-xs border border-neutral-200/80 shadow-xs active:scale-98 transition-all"
          >
            <Package className="w-4 h-4 text-blue-600" /> Full Catalog
          </Link>
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-800 rounded-2xl font-bold text-xs border border-neutral-200/80 shadow-xs active:scale-98 transition-all"
          >
            <Clock className="w-4 h-4 text-indigo-600" /> Order History
          </Link>
        </div>
      </div>
    </div>
  );
}
