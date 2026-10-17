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
  Send,
  XCircle,
  Check,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
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

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [customReply, setCustomReply] = useState('');
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

  const handleAcceptSuggested = async (suggestedQty?: number) => {
    if (!order) return;
    setSubmittingAction(true);
    hapticFeedback('success');

    try {
      await api.sendCustomerResponse(order.id, {
        responseType: 'ACCEPT',
        acceptedQuantity: suggestedQty,
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
    if (!confirm('Are you sure you want to cancel this order?')) return;
    if (!order) return;
    setSubmittingAction(true);
    hapticFeedback('error');

    try {
      await api.cancelOrder(order.id);
      setReplySuccess('Order cancelled successfully.');
      await loadOrder();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSendCustomMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReply.trim() || !order) return;

    setSubmittingAction(true);
    hapticFeedback('medium');

    try {
      await api.sendCustomerResponse(order.id, {
        responseType: 'MESSAGE',
        message: customReply.trim(),
      });
      setCustomReply('');
      setReplySuccess('Message sent! Our staff will review and update your order.');
      await loadOrder();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
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

  // Find latest staff question if waiting customer
  const lastStaffQuestion = order.messages
    ?.slice()
    .reverse()
    .find((m) => m.senderType === 'STAFF');

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

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {order.status.replace(/_/g, ' ')}
        </span>
      </header>

      <div className="p-4 space-y-4">
        {/* ACTION REQUIRED: Staff Question Interactive Card */}
        {isWaitingCustomer && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span>Question from Staff:</span>
            </div>

            <p className="text-xs text-purple-950 bg-white/80 p-3 rounded-xl border border-purple-200 leading-relaxed font-medium">
              {lastStaffQuestion?.message ||
                'We have limited stock available for your order. Would you like to proceed with the available units?'}
            </p>

            {/* Quick Action Decision Buttons */}
            {lastStaffQuestion?.metadata?.proposedQuantity !== undefined &&
            Number(lastStaffQuestion.metadata.proposedQuantity) > 0 ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() =>
                    handleAcceptSuggested(
                      Number(lastStaffQuestion.metadata?.proposedQuantity),
                    )
                  }
                  className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <span>
                    ⚡ Get Available Now (
                    {lastStaffQuestion.metadata.proposedQuantity})
                  </span>
                </button>

                {(order.items || []).reduce(
                  (sum, item) => sum + Number(item.requestedQuantity),
                  0,
                ) > Number(lastStaffQuestion.metadata.proposedQuantity) && (
                  <button
                    type="button"
                    disabled={submittingAction}
                    onClick={() =>
                      handleWaitForAll(
                        (order.items || []).reduce(
                          (sum, item) => sum + Number(item.requestedQuantity),
                          0,
                        ),
                      )
                    }
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <span>
                      ⏳ Wait for All (
                      {(order.items || []).reduce(
                        (sum, item) => sum + Number(item.requestedQuantity),
                        0,
                      )}
                      )
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={handleCancelOrder}
                  className="w-full py-2.5 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <XCircle className="w-4 h-4 text-red-500" /> ❌ Cancel Order
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleAcceptSuggested()}
                  className="flex-1 py-2.5 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" /> Accept & Confirm
                </button>

                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={handleCancelOrder}
                  className="py-2.5 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                >
                  <XCircle className="w-4 h-4 text-red-500" /> Cancel Order
                </button>
              </div>
            )}
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
                    Requested: <b>{item.requestedQuantity}</b>
                  </span>
                  <span className="bg-emerald-50 px-2 py-0.5 rounded text-emerald-800 font-medium">
                    Approved: <b>{item.approvedQuantity}</b>
                  </span>
                  {Number(item.waitingQuantity) > 0 && (
                    <span className="bg-amber-50 px-2 py-0.5 rounded text-amber-800 font-medium">
                      Waiting: <b>{item.waitingQuantity}</b>
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

        {/* Free Text Chat & Messages with Staff */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            Communication & Updates
          </span>

          {order.messages && order.messages.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {order.messages.map((msg) => {
                const isCustomer = msg.senderType === 'CUSTOMER';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isCustomer ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        isCustomer
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-75 mb-0.5">
                        {isCustomer ? 'You' : msg.senderName || 'Staff'}
                      </div>
                      <p>{msg.message}</p>
                    </div>
                    <span className="text-[9px] text-gray-400 mt-0.5 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No messages yet.</p>
          )}

          {/* Customer Reply Input */}
          <form onSubmit={handleSendCustomMessage} className="pt-2 flex gap-2">
            <input
              type="text"
              placeholder="Type message to staff..."
              value={customReply}
              onChange={(e) => setCustomReply(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={submittingAction || !customReply.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-xl transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-gray-400">
            💬 You can also reply directly in your Telegram chat.
          </p>
        </div>
      </div>
    </div>
  );
}
