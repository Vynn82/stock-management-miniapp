"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  ReceiptText,
  Sparkles,
  ChevronRight,
  Plus,
  Check,
  Building2,
  ArrowRight,
} from "lucide-react";
import { useTelegram } from "@/context/telegram-context";
import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";
import { api } from "@/lib/api";
import { CustomerOrder, Product } from "@/types";
import { ProductImage } from "@/components/product-image";
import { LanguageFlag } from "@/components/language-flag";

export default function HomePage() {
  const {
    customer,
    authStatus,
    telegramUser,
    openRegistration,
    hapticFeedback,
  } = useTelegram();
  const { addToCart, totalCount } = useCart();
  const { language, toggleLanguage, t } = useLanguage();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentOrder, setRecentOrder] = useState<CustomerOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [activeBanner, setActiveBanner] = useState(0);

  const banners = [
    {
      image: "/promo-pro.jpg",
      alt: "iPhone Pro promotional banner",
      title: "iPhone 18 Pro",
      subtitle: "Pro further.",
      href: "/products",
    },
    {
      image: "/promo-fold.png",
      alt: "Samsung Galaxy Z Fold promotional banner",
      title: "",
      subtitle: "",
      href: "/products",
    },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, orders] = await Promise.all([
          api.getProducts({ limit: 6 }).catch(() => []),
          api.getMyOrders({ limit: 1 }).catch(() => []),
        ]);

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
    <div className="flex flex-col min-h-screen bg-[#fbfbfd] text-[#1d1d1f] pb-32">
      {/* Modern Flagship Hero Showcase */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white pt-6 pb-7 px-5 rounded-b-[2rem] shadow-xl shadow-blue-900/10">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-400/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Row: Brand & Actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-200">
                {t("home_partner_store")}
              </span>
              {authStatus === "ACTIVE" ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t("home_verified")}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Language Switcher Pill */}
              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  toggleLanguage();
                }}
                className="px-2.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                title="Switch Language / ប្តូរភាសា"
              >
                <LanguageFlag language={language} />
                <span>{language === "en" ? "English" : "ខ្មែរ"}</span>
              </button>

              <Link
                href="/cart"
                className="relative p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 active:scale-95 transition-all duration-300 ease-out flex items-center justify-center"
                aria-label="View Cart"
              >
                <ShoppingCart className="w-5 h-5 text-white" />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-extrabold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-lg animate-in zoom-in-75">
                    {totalCount > 99 ? "99+" : totalCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* User Welcome */}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white/95">
              {t("home_welcome")}, {customer?.contactName || customer?.firstName || telegramUser?.firstName || t("home_welcome_partner")}
            </h1>
            {customer?.companyName ? (
              <p className="text-xs text-blue-100/90 font-medium flex items-center gap-1.5 mt-1">
                <Building2 className="w-3.5 h-3.5 text-blue-300" />
                {customer.companyName}
              </p>
            ) : authStatus === "REGISTRATION_REQUIRED" ? (
              <button
                type="button"
                onClick={openRegistration}
                className="inline-flex items-center gap-1.5 text-xs text-blue-200 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-xl mt-1.5 transition-all font-semibold border border-white/10"
              >
                {t("home_complete_reg")} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Glass Search Bar */}
          <div className="relative pt-1">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 pointer-events-none transition-colors" />
              <input
                type="text"
                placeholder={t("home_search_placeholder")}
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
        {/* Promotional Banner Slideshow */}
        <section className="relative h-[235px] sm:h-[260px] overflow-hidden rounded-[1.75rem] bg-neutral-950 shadow-[0_14px_34px_rgba(15,23,42,0.16)]" aria-roledescription="carousel" aria-label="Store promotions">
          <Image
            key={banners[activeBanner].image}
            src={banners[activeBanner].image}
            alt={banners[activeBanner].alt}
            fill
            priority
            sizes="(max-width: 520px) 100vw, 520px"
            className="object-cover object-center animate-in fade-in duration-500"
          />
          {activeBanner === 0 && (
            <div className="absolute z-10 top-4 inset-x-12 text-center text-white drop-shadow-md pointer-events-none">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight leading-tight">iPhone 18 Pro</h2>
              <p className="text-xs sm:text-sm text-white/90 mt-0.5">Pro further.</p>
            </div>
          )}
          <div className={`absolute z-20 flex items-center gap-2 ${activeBanner === 0 ? "left-1/2 -translate-x-1/2 top-[64px]" : "left-[63%] -translate-x-1/2 top-[95px]"}`}>
            <Link href={banners[activeBanner].href} className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-[10px] sm:text-xs font-semibold whitespace-nowrap shrink-0 shadow-md shadow-blue-950/25 active:scale-95 transition-all">
              Learn more
            </Link>
            <Link href={banners[activeBanner].href} className="rounded-full border border-blue-300/80 bg-black/35 hover:bg-black/50 text-white px-3.5 py-1.5 text-[10px] sm:text-xs font-semibold whitespace-nowrap shrink-0 active:scale-95 transition-all">
              Buy
            </Link>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 rounded-full bg-black/20 backdrop-blur-sm px-2.5 py-1.5" aria-label="Choose promotion">
            {banners.map((banner, index) => (
              <button key={banner.image} type="button" onClick={() => setActiveBanner(index)} className={`h-1.5 rounded-full transition-all ${activeBanner === index ? "w-5 bg-white" : "w-1.5 bg-white/55"}`} aria-label={`Show promotion ${index + 1}`} aria-current={activeBanner === index ? "true" : undefined} />
            ))}
          </div>
        </section>

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

        {/* Recent Order Card (Apple Wallet Style) */}
        {recentOrder && (
          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <h2 className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                {t("home_recent_order")}
              </h2>
              <Link
                href="/orders"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {t("orders_all")} →
              </Link>
            </div>
            <Link
              href={`/orders/${recentOrder.id}`}
              className="block bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-300 transition-all duration-300 ease-out active:scale-[0.99]"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ReceiptText className="w-4 h-4" />
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
                  {recentOrder.items?.length || 0} {t("home_items")} &bull; ${Number(recentOrder.totalAmount).toFixed(2)}
                </span>
                <span className="text-blue-600 font-bold flex items-center gap-0.5 text-xs">
                  {t("orders_active")} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Featured Products Section */}
        <div>
          <div className="flex justify-between items-end mb-3 px-1">
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
                <div key={i} className="bg-white rounded-[1.7rem] p-3.5 border border-neutral-200/70 h-72 animate-shimmer">
                  <div className="h-40 bg-neutral-100 rounded-[1.25rem]" />
                </div>
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

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group bg-white rounded-[1.7rem] border border-neutral-200/80 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.045)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image Frame */}
                      <div className="h-36 bg-[#f5f5f7] rounded-[1.25rem] relative overflow-hidden flex items-center justify-center p-3">
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                        />

                      </div>

                      {/* Product Details */}
                      <div className="pt-3 px-1">
                        <span className="text-[10px] text-neutral-400 font-mono tracking-tight block">
                          {product.code}
                        </span>
                        <h3 className="font-bold text-xs text-neutral-900 tracking-tight line-clamp-2 min-h-10 group-hover:text-blue-600 transition-colors mt-1">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    {/* Price & Action Row */}
                    <div className="pt-3 px-1 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] text-neutral-400 block -mb-0.5">{t("home_wholesale")}</span>
                        <span className="font-black text-sm text-neutral-900 tracking-tight">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(product, e)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all duration-300 ease-out ${
                          isJustAdded
                            ? "bg-emerald-600 text-white rotate-0"
                            : "bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25"
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

      </div>
    </div>
  );
}
