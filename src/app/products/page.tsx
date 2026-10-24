"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Boxes, Plus, Check, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useTelegram } from "@/context/telegram-context";
import { useLanguage } from "@/context/language-context";
import { api } from "@/lib/api";
import { Category, Product } from "@/types";
import { ProductImage } from "@/components/product-image";
import { VariantSelectorSheet } from "@/components/variant-selector-sheet";

function ProductsListContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoryId") || "ALL";
  const initialSearch = searchParams.get("search") || "";

  const { addToCart } = useCart();
  const { hapticFeedback } = useTelegram();
  const { t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [catList, prodList] = await Promise.all([
        api.getCategories().catch(() => []),
        api.getProducts({
          categoryId: selectedCategory === "ALL" ? undefined : selectedCategory,
          search: search.trim() || undefined,
        }).catch(() => []),
      ]);
      setCategories(catList);
      setProducts(prodList);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.variants && product.variants.length > 0) {
      hapticFeedback("light");
      setSelectedProductForVariant(product);
      return;
    }

    hapticFeedback("medium");
    addToCart({
      productId: product.id,
      variantId: null,
      productName: product.name,
      productCode: product.code,
      price: Number(product.price),
      image: product.image,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1400);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7] text-[#1d1d1f] pb-32">
      {/* Apple-style Frosted Glass Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#f5f5f7]/90 border-b border-neutral-200/70 px-4 pt-3.5 pb-2.5 transition-all">
        <div className="flex justify-between items-center mb-2.5">
          <div>
            <h1 className="text-lg font-black tracking-tight text-neutral-900">
              {t("catalog_title")}
            </h1>
            <p className="text-[11px] text-neutral-400 -mt-0.5">
              {t("catalog_subtitle")}
            </p>
          </div>
          {!loading && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
              {products.length} {products.length === 1 ? t("home_item") : t("home_items")}
            </span>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder={t("catalog_search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-xs font-medium text-neutral-900 placeholder:text-neutral-400 rounded-2xl border border-neutral-200/60 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 outline-none transition-all duration-300 ease-out"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 p-0.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills Strip */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 shrink-0 active:scale-95 ${
              selectedCategory === "ALL"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
            }`}
          >
            {t("catalog_all")}
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 shrink-0 active:scale-95 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </header>

      {/* Product Grid Content */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[1.7rem] p-3.5 border border-neutral-200/70 h-72 flex flex-col justify-between animate-shimmer"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200/80 mt-4 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-800">{t("catalog_no_products")}</h3>
              <p className="text-xs text-neutral-400 mt-1">{t("catalog_try_search")}</p>
            </div>
            {(search || selectedCategory !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("ALL");
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                {t("catalog_all")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {products.map((product) => {
              const isJustAdded = addedId === product.id;
              const hasVariants = product.variants && product.variants.length > 0;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-[1.7rem] border border-neutral-200/80 p-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.045)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Card Frame */}
                    <div className="h-40 sm:h-52 bg-[#f5f5f7] rounded-[1.25rem] relative overflow-hidden flex items-center justify-center p-3">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                      />

                      {/* Variant Badge */}
                      {hasVariants && (
                        <span className="absolute bottom-2 left-2 backdrop-blur-md bg-neutral-900/75 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          {product.variants!.length} {t("catalog_options")}
                        </span>
                      )}
                    </div>

                    {/* Product Metadata */}
                    <div className="pt-3 px-1">
                      <span className="text-[10px] text-neutral-400 font-mono tracking-tight block">
                        {product.code}
                      </span>
                      <h3 className="font-bold text-[13px] sm:text-[15px] text-neutral-900 tracking-tight line-clamp-2 min-h-10 group-hover:text-blue-600 transition-colors mt-1">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  {/* Price & Add Button */}
                  <div className="pt-3 px-1 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-neutral-400 block -mb-0.5">{t("home_wholesale")}</span>
                      <span className="font-black text-base sm:text-lg text-neutral-900 tracking-tight">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(product, e)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all duration-300 ease-out ${
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

      <VariantSelectorSheet
        product={selectedProductForVariant}
        isOpen={!!selectedProductForVariant}
        onClose={() => setSelectedProductForVariant(null)}
        onAddToCart={(item, qty) => {
          addToCart(item, qty);
          if (selectedProductForVariant) {
            setAddedId(selectedProductForVariant.id);
            setTimeout(() => setAddedId(null), 1400);
          }
        }}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-neutral-400">
          Loading catalog...
        </div>
      }
    >
      <ProductsListContent />
    </Suspense>
  );
}
