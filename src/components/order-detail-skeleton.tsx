import React from 'react';

export function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20 animate-pulse">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="space-y-1.5">
            <div className="w-32 h-4 bg-gray-200 rounded-md" />
            <div className="w-24 h-2.5 bg-gray-200 rounded-md" />
          </div>
        </div>
        <div className="w-20 h-6 bg-gray-200 rounded-full" />
      </header>

      <div className="p-4 space-y-4">
        {/* Action card placeholder */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-36 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-5 bg-gray-200 rounded-full" />
          </div>
          <div className="w-full h-12 bg-gray-100 rounded-xl" />
        </div>

        {/* Delivery & Payment Card Skeleton */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="w-32 h-3 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
              <div className="w-16 h-2.5 bg-gray-200 rounded" />
              <div className="w-24 h-4 bg-gray-200 rounded" />
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
              <div className="w-16 h-2.5 bg-gray-200 rounded" />
              <div className="w-24 h-4 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="w-48 h-2.5 bg-gray-200 rounded" />
        </div>

        {/* Ordered Items Skeleton */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="w-28 h-3 bg-gray-200 rounded" />
          <div className="divide-y divide-gray-100">
            {[1, 2].map((i) => (
              <div key={i} className="py-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <div className="w-36 h-3.5 bg-gray-200 rounded" />
                    <div className="w-20 h-2.5 bg-gray-200 rounded" />
                  </div>
                  <div className="w-14 h-4 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-2 pt-1">
                  <div className="w-20 h-5 bg-gray-200 rounded" />
                  <div className="w-20 h-5 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
            <div className="w-16 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-5 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailSkeleton;

