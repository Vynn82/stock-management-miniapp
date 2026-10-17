'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Package, Plus, Check } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useTelegram } from '@/context/telegram-context';
import { api } from '@/lib/api';
import { Category, Product } from '@/types';

function ProductsListContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('categoryId') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

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
          categoryId: selectedCategory === 'ALL' ? undefined : selectedCategory,
          search: search.trim() || undefined,
        }).catch(() => []),
      ]);
      setCategories(catList);
      setProducts(prodList);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    hapticFeedback('medium');
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
      {/* Search Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-xs">
        <h1 className="text-base font-bold text-gray-900 mb-2">Product Catalog</h1>

        <div className="relative">
          <input
            type="text"
            placeholder="Search by product name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pt-2.5 pb-0.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Product List */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-gray-200 animate-pulse h-52" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-gray-200 mt-4">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No products found</p>
            <p className="text-xs text-gray-400 mt-1">Try another search or select a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => {
              const isJustAdded = addedId === product.id;
              const hasVariants = product.variants && product.variants.length > 0;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow transition-shadow flex flex-col justify-between"
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
                      {hasVariants && (
                        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                          {product.variants!.length} Variants
                        </span>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="font-semibold text-xs text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">Code: {product.code}</p>
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
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
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
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Loading catalog...</div>}>
      <ProductsListContent />
    </Suspense>
  );
}
