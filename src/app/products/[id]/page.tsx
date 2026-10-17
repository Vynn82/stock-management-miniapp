'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Plus,
  Minus,
  Check,
  Banknote,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useTelegram } from '@/context/telegram-context';
import { api } from '@/lib/api';
import { Product, ProductVariant } from '@/types';

export default function ProductDetailPage({
  params,
}: {
  params?: { id?: string };
}) {
  const router = useRouter();
  const routeParams = useParams();
  const productId = (params?.id || routeParams?.id || '') as string;

  const { addToCart, totalCount } = useCart();
  const { authStatus, openRegistration, hapticFeedback } = useTelegram();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await api.getProduct(productId);
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-base font-bold text-gray-800">Product Not Found</h2>
        <Link
          href="/products"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const activePrice = Number(
    selectedVariant?.price !== undefined && selectedVariant?.price !== null
      ? selectedVariant.price
      : product.price,
  );

  const activeImage = selectedVariant?.image || product.image;

  const handleAddToCart = () => {
    hapticFeedback('success');
    addToCart(
      {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        productName: product.name,
        variantName: selectedVariant?.name || null,
        productCode: product.code,
        price: activePrice,
        image: activeImage,
      },
      quantity,
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleOrderNow = () => {
    if (!product) return;
    hapticFeedback('medium');
    addToCart(
      {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        productName: product.name,
        variantName: selectedVariant?.name || null,
        productCode: product.code,
        price: activePrice,
        image: activeImage,
      },
      quantity,
    );

    if (authStatus === 'REGISTRATION_REQUIRED') {
      openRegistration();
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-gray-800 truncate max-w-[200px]">
          {product.name}
        </span>
        <Link
          href="/cart"
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 relative"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </Link>
      </header>

      {/* Main Image */}
      <div className="bg-white border-b border-gray-200">
        <div className="h-64 relative flex items-center justify-center bg-gray-50">
          {activeImage ? (
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <Package className="w-16 h-16 text-gray-300" />
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Title & Price */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex justify-between items-start gap-3">
            <div>
              <span className="text-[11px] font-semibold text-blue-600 tracking-wide uppercase">
                {product.category?.name || 'General Product'}
              </span>
              <h1 className="text-lg font-bold text-gray-900 mt-0.5">{product.name}</h1>
              <p className="text-xs text-gray-400 mt-0.5">Code: {product.code}</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-blue-600">
                ${activePrice.toFixed(2)}
              </span>
              <span className="block text-[10px] text-gray-400">per unit</span>
            </div>
          </div>
        </div>

        {/* Variants Selector (If product has variants) */}
        {product.variants && product.variants.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <label className="text-xs font-bold text-gray-800 block mb-2">
              Select Variant:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      hapticFeedback('light');
                      setSelectedVariant(v);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{v.name}</span>
                    {v.price && (
                      <span className="block text-[10px] text-gray-500 font-normal">
                        ${Number(v.price).toFixed(2)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Stepper */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
          <span className="text-xs font-bold text-gray-800">Order Quantity</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                hapticFeedback('light');
                setQuantity((q) => Math.max(1, q - 1));
              }}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 active:scale-95"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-gray-800">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => {
                hapticFeedback('light');
                setQuantity((q) => q + 1);
              }}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cash Notice */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-blue-900 text-xs">
          <Banknote className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Payment on Delivery</span>
            No advance online payment required. Pay by cash when delivered.
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 p-3 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 ${
            added
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleOrderNow}
          className="flex-1 py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md active:scale-98"
        >
          <span>Order Now</span>
          <span className="font-extrabold text-white/90">
            (${(activePrice * quantity).toFixed(2)})
          </span>
        </button>
      </div>
    </div>
  );
}
