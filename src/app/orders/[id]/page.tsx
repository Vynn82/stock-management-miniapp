'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Truck,
  Banknote,
  Check,
  AlertCircle,
  Clock,
  Zap,
  Undo2,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useTelegram } from '@/context/telegram-context';
import { api } from '@/lib/api';
import { CustomerOrder } from '@/types';

export default function OrderDetailPage({
  params,
}: {
  params?: { id?: string };
}) {
  const router = useRouter();
  const routeParams = useParams();
  const orderId = (params?.id || routeParams?.id || '') as string;

  const { hapticFeedback } = useTelegram();
  const { t } = useLanguage();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      const data = await api.getMyOrder(orderId);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const lastStaffQuestion = order?.messages
    ?.slice()
    .reverse()
    .find((m) => m.senderType === 'STAFF');

  const shortageItem = order?.items?.find((i) => Number(i.waitingQuantity || 0) > 0);
  const targetItemId = (lastStaffQuestion?.metadata as { itemId?: string })?.itemId || shortageItem?.id;

  const totalRequestedQty = (order?.items || []).reduce(
    (sum, item) => sum + Number(item.requestedQuantity || 0),
    0,
  );

  // Extract proposed quantity dynamically:
  // 1. From metadata.proposedQuantity
  // 2. From order items if approvedQuantity > 0
  // 3. From text analysis of staff question (e.g. "have 10", "10 units", "only 10")
  const proposedQty = (() => {
    if (!order) return undefined;
    const metaQty = Number((lastStaffQuestion?.metadata as { proposedQuantity?: number })?.proposedQuantity);
    if (!isNaN(metaQty) && metaQty > 0) return metaQty;

    const approvedItem = order.items?.find((i) => Number(i.approvedQuantity) > 0);
    if (approvedItem && Number(approvedItem.approvedQuantity) > 0) {
      return Number(approvedItem.approvedQuantity);
    }

    if (lastStaffQuestion?.message) {
      const match = lastStaffQuestion.message.match(
        /(?:only|have|accept|take|available|quantity of)?\s*(\b\d+\b)\s*(?:units?|pcs?|items?|available|left)?/i,
      );
      if (match && Number(match[1]) > 0 && Number(match[1]) <= totalRequestedQty) {
        return Number(match[1]);
      }
    }

    return undefined;
  })();

  const hasAvailableStock = typeof proposedQty === 'number' && proposedQty > 0;

  const handleAcceptSuggested = async (suggestedQty?: number) => {
    if (!order) return;
    setSubmittingAction(true);
    hapticFeedback('success');

    try {
      await api.sendCustomerResponse(order.id, {
        responseType: 'ACCEPT',
        acceptedQuantity: suggestedQty,
        itemId: targetItemId,
        message: suggestedQty
          ? `I accept the proposed quantity of ${suggestedQty} units.`
          : 'I confirm and accept.',
      });
      setReplySuccess('Thank you! Your order has been confirmed.');
      await loadOrder();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit response');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleWaitForAll = async (totalQty: number) => {
    if (!order) return;
    setSubmittingAction(true);
    hapticFeedback('medium');

    try {
      await api.sendCustomerResponse(order.id, {
        responseType: 'WAIT_STOCK',
        itemId: targetItemId,
        message: `I choose to wait for all ${totalQty} units.`,
      });
      setReplySuccess(
        `You chose to wait for all ${totalQty} units. Your order is queued and will be fulfilled as soon as stock arrives.`,
      );
      await loadOrder();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit response');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCancelOrder = async () => {
    if (
      !confirm(
        t(
          'order_cancel_confirm',
          'Exit and return to shopping without purchasing?',
        ),
      )
    ) {
      return;
    }
    if (!order) return;
    setSubmittingAction(true);
    hapticFeedback('medium');

    try {
      await api.cancelOrder(order.id);
      // Immediately navigate back to catalog/products since customer chose not to buy
      router.push('/products');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel');
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-base font-bold text-gray-800">Order Not Found</h2>
        <Link
          href="/orders"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  const isWaitingCustomer = order.status === 'WAITING_CUSTOMER';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.push('/orders')}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">
              Order #{order.orderNo}
            </h1>
            <span className="text-[10px] text-gray-400">
              {new Date(order.createdAt).toLocaleDateString()} &bull; Cash on Delivery
            </span>
          </div>
        </div>

        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            order.status === 'CANCELLED'
              ? 'bg-gray-100 text-gray-700 border-gray-200'
              : order.status === 'WAITING_CUSTOMER'
                ? 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse'
                : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
          {order.status === 'CANCELLED'
            ? 'Not Placed'
            : order.status.replace(/_/g, ' ')}
        </span>
      </header>

      <div className="p-4 space-y-4">
        {/* ACTION REQUIRED: Staff Question Interactive Card */}
        {isWaitingCustomer && (
          <div className="bg-gradient-to-b from-blue-50/80 to-indigo-50/30 border-2 border-blue-200/90 rounded-2xl p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                <div className={`w-6 h-6 rounded-lg ${hasAvailableStock ? 'bg-blue-600/10 text-blue-600' : 'bg-amber-600/10 text-amber-600'} flex items-center justify-center`}>
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <span>
                  {hasAvailableStock
                    ? t('order_action_required', 'Action Required: Staff Inquiry')
                    : t('order_action_out_of_stock', 'Action Required: Out of Stock')}
                </span>
              </div>
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                hasAvailableStock
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {hasAvailableStock
                  ? t('order_decision_needed', 'Decision Needed')
                  : t('order_out_of_stock', 'Out of Stock')}
              </span>
            </div>

            <div className="bg-white/95 p-3.5 rounded-xl border border-blue-100/80 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                <span className="font-semibold text-gray-600">
                  {lastStaffQuestion?.senderName || 'Store Operations Staff'}
                </span>
                {lastStaffQuestion?.createdAt && (
                  <span>
                    {new Date(lastStaffQuestion.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-800 leading-relaxed font-medium">
                {lastStaffQuestion?.message ||
                  (hasAvailableStock
                    ? t(
                        'order_default_question',
                        'We have limited stock available for your order. Would you like to accept the available items now, wait for full restock, or cancel your order?',
                      )
                    : t(
                        'order_out_of_stock_question',
                        'This item is currently out of stock. Would you like to wait for restock or cancel your order?',
                      ))}
              </p>
            </div>

            {/* Decision Action Buttons: If Out of Stock, hide option 1 and show only Wait & Cancel */}
            <div className="flex flex-col gap-2 pt-0.5">
              {/* Option 1: Accept Available (ONLY shown if stock > 0) */}
              {hasAvailableStock && (
                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleAcceptSuggested(proposedQty)}
                  className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white shadow-sm transition-all disabled:opacity-50 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">
                        {`${t('order_accept_available', 'Accept Available Now')} (${proposedQty} ${t('order_units', 'units')})`}
                      </div>
                      <div className="text-[10px] text-blue-100/90 leading-tight mt-0.5">
                        {t('order_accept_subtext', 'Proceed with available units immediately')}
                      </div>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-white/90 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              )}

              {/* Option 2: Wait for Full Order / Restock */}
              <button
                type="button"
                disabled={submittingAction}
                onClick={() => handleWaitForAll(totalRequestedQty)}
                className={`w-full text-left p-3 rounded-xl ${
                  !hasAvailableStock
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    : 'bg-white hover:bg-blue-50/60 border border-blue-200 text-gray-800'
                } active:scale-[0.99] shadow-xs transition-all disabled:opacity-50 flex items-center justify-between group`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${!hasAvailableStock ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'} flex items-center justify-center shrink-0`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold leading-tight ${!hasAvailableStock ? 'text-white' : 'text-gray-900'}`}>
                      {totalRequestedQty > (proposedQty || 0)
                        ? `${t('order_wait_full', 'Wait for Full Order')} (${totalRequestedQty} ${t('order_units', 'units')})`
                        : `${t('order_wait_restock', 'Wait for Restock')} (${totalRequestedQty} ${t('order_units', 'units')})`}
                    </div>
                    <div className={`text-[10px] leading-tight mt-0.5 ${!hasAvailableStock ? 'text-blue-100' : 'text-gray-500'}`}>
                      {t('order_wait_subtext', 'Hold and dispatch all items together once restocked')}
                    </div>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  !hasAvailableStock
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'text-blue-700 bg-blue-50 border border-blue-100'
                }`}>
                  {totalRequestedQty} {t('order_units', 'units')}
                </span>
              </button>

              {/* Option 3: Don't Buy / Go Back */}
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleCancelOrder}
                className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-200 hover:border-gray-300 text-gray-700 shadow-xs transition-all disabled:opacity-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
                    <Undo2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-800 leading-tight">
                      {t('order_cancel_btn', "Don't Buy / Go Back")}
                    </div>
                    <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
                      {t(
                        'order_cancel_subtext',
                        'Exit without purchasing and return to catalog',
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-gray-600 font-semibold px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                  {t('order_cancel_action', "Don't Buy")}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* If Order is in Cancelled State */}
        {order.status === 'CANCELLED' && (
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs text-center space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mx-auto">
              <Undo2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">
              {t('order_cancelled_title', 'Purchase Cancelled / Not Placed')}
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              {t(
                'order_cancelled_desc',
                'This order was not placed. You can return to our catalog to browse other products available in stock.',
              )}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all mt-1"
            >
              {t('cart_explore_catalog', 'Explore Catalog')}{' '}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {replySuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{replySuccess}</span>
          </div>
        )}

        {/* Order Status & Delivery Progress */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Delivery & Payment
          </span>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-[11px] text-gray-500 block">Delivery Status</span>
              <span className="text-xs font-bold text-gray-800 mt-0.5 block flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                {order.deliveryStatus || 'PENDING'}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-[11px] text-gray-500 block">Payment (Cash)</span>
              <span
                className={`text-xs font-bold mt-0.5 block flex items-center gap-1 ${
                  order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                {order.paymentStatus === 'PAID' ? 'PAID (Cash)' : 'UNPAID (Cash)'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 pt-1">
            💵 Payment is collected in cash when delivery arrives at your location.
          </p>
        </div>

        {/* Ordered Items List */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Ordered Items ({order.items.length})
          </span>

          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 space-y-1">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.product?.name}</h3>
                    {item.variant && (
                      <span className="text-[11px] text-blue-600 font-medium block">
                        Variant: {item.variant.name}
                      </span>
                    )}
                  </div>
                  <span className="font-extrabold text-gray-900">
                    ${(Number(item.unitPrice) * Number(item.requestedQuantity)).toFixed(2)}
                  </span>
                </div>

                {/* Quantity Breakdown Pills */}
                <div className="flex items-center gap-1.5 text-[11px] pt-1">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">
                    Requested: <b>{Number(item.requestedQuantity)}</b>
                  </span>
                  <span className="bg-emerald-50 px-2 py-0.5 rounded text-emerald-800 font-medium">
                    Approved: <b>{Number(item.approvedQuantity || 0)}</b>
                  </span>
                  {Number(item.waitingQuantity) > 0 && (
                    <span className="bg-amber-50 px-2 py-0.5 rounded text-amber-800 font-medium">
                      Waiting: <b>{Number(item.waitingQuantity)}</b>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm font-extrabold text-gray-900">
            <span>Total:</span>
            <span className="text-blue-600 text-base">${Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
