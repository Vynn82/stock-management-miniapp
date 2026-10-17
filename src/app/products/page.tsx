"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Package, Plus, Check, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useTelegram } from "@/context/telegram-context";
import { api } from "@/lib/api";
import { Category, Product } from "@/types";
import { ProductImage } from "@/components/product-image";

function ProductsListContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoryId") || "ALL";
  const initialSearch = searchParams.get("search") || "";

  const { addToCart } = useCart();
  const { hapticFeedback } = useTelegram();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
      {/* Apple-style Frosted Glass Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/85 border-b border-neutral-200/70 shadow-xs px-4 pt-3.5 pb-2.5 transition-all">
        <div className="flex justify-between items-center mb-2.5">
          <div>
            <h1 className="text-lg font-black tracking-tight text-neutral-900">
              Product Catalog
            </h1>
            <p className="text-[11px] text-neutral-400 -mt-0.5">
              Wholesale inventory & direct ordering
            </p>
          </div>
          {!loading && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
              {products.length} {products.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, SKU, or code..."
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
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
            }`}
          >
            All Items
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
                    ? "bg-neutral-900 text-white shadow-sm"
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
                className="bg-white rounded-3xl p-3 border border-neutral-200/70 h-60 flex flex-col justify-between animate-shimmer"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200/80 mt-4 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-800">No products match your search</h3>
              <p className="text-xs text-neutral-400 mt-1">Try clearing your filters or search keywords.</p>
            </div>
            {(search || selectedCategory !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("ALL");
                }}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {products.map((product) => {
              const isJustAdded = addedId === product.id;
              const hasVariants = product.variants && product.variants.length > 0;
              const inStock = (product.totalStock ?? 1) > 0;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-3xl border border-neutral-200/80 p-3 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between"
                >
                  <div>
                    {/* Image Card Frame */}
                    <div className="h-36 bg-gradient-to-b from-neutral-50 to-neutral-100/70 rounded-2xl relative overflow-hidden flex items-center justify-center p-2.5">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Floating Stock Pill */}
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

                      {/* Variant Badge */}
                      {hasVariants && (
                        <span className="absolute bottom-2 left-2 backdrop-blur-md bg-neutral-900/75 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          {product.variants!.length} options
                        </span>
                      )}
                    </div>

                    {/* Product Metadata */}
                    <div className="pt-2.5 px-1">
                      <span className="text-[10px] text-neutral-400 font-mono tracking-tight block">
                        {product.code}
                      </span>
                      <h3 className="font-bold text-xs text-neutral-900 tracking-tight line-clamp-2 group-hover:text-blue-600 transition-colors mt-0.5">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  {/* Price & Add Button */}
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
