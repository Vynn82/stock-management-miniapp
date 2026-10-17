'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ShieldAlert,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useTelegram } from '@/context/telegram-context';
import { api } from '@/lib/api';
import { AuthGate } from '@/components/auth-gate';

function CheckoutContent() {
  const router = useRouter();
  const { items, totalAmount, totalCount, clearCart } = useCart();
  const { customer, hapticFeedback } = useTelegram();

  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedRemark = sessionStorage.getItem('tg_order_remark');
    if (savedRemark) {
      setRemark(savedRemark);
    }
  }, []);

  if (items.length === 0) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
        <h2 className="text-base font-bold text-gray-800">Your Cart is Empty</h2>
        <Link
          href="/products"
          className="mt-4 text-xs font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError(null);
    hapticFeedback('medium');

    try {
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        })),
        remark: remark.trim() || undefined,
      };

      const order = await api.createOrder(orderPayload);
      clearCart();
      sessionStorage.removeItem('tg_order_remark');
      hapticFeedback('success');

      router.push(`/orders/${order.id}`);
    } catch (err: unknown) {
      console.error('Order creation failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setError(message);
      hapticFeedback('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Order Confirmation</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Customer / Partner Identity */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Order Recipient
          </span>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-gray-900">
                {customer?.firstName} {customer?.lastName || ''}
              </p>
              {customer?.companyName && (
                <p className="text-xs text-blue-600 font-medium">
                  🏢 {customer.companyName}
                </p>
              )}
            </div>
            {customer?.telegramUsername && (
              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                @{customer.telegramUsername}
              </span>
            )}
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Order Summary ({totalCount} items)
          </span>
          <div className="mt-2 divide-y divide-gray-100">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || 'base'}`}
                className="py-2.5 flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-semibold text-gray-800">
                    {item.productName}
                  </span>
                  {item.variantName && (
                    <span className="text-gray-400 block text-[11px]">
                      Variant: {item.variantName}
                    </span>
                  )}
                  <span className="text-gray-400 block text-[11px]">
                    Qty: {item.quantity} &times; ${item.price.toFixed(2)}
                  </span>
                </div>
                <span className="font-bold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm font-extrabold text-gray-900">
            <span>Total Payable:</span>
            <span className="text-blue-600 text-base">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Delivery Note */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block mb-1">
            Delivery Remark / Note
          </label>
          <textarea
            rows={2}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Add delivery instructions or office location..."
            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Flow & Cash Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 space-y-2 text-xs text-blue-900">
          <div className="flex items-center gap-2 font-bold">
            <Banknote className="w-4 h-4 text-blue-600" />
            <span>Strictly Manual Cash on Delivery</span>
          </div>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            Upon submitting, your order is submitted to staff for review (
            <b>PENDING_REVIEW</b>). Staff will verify stock and coordinate
            delivery. You will pay cash when your items arrive.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Place Order Sticky Button */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 p-3 z-40">
        <button
          type="button"
          disabled={submitting}
          onClick={handlePlaceOrder}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting Order...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" /> Place Order (
              ${totalAmount.toFixed(2)})
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGate
      title="Partner Registration Required"
      subtitle="Please complete your partner registration before placing your order."
      showBackToStore={true}
    >
      <CheckoutContent />
    </AuthGate>
  );
}

