import React from 'react';

export function OrdersListSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-32 animate-pulse">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-xs">
        <div className="flex justify-between items-center mb-2.5">
          <div className="w-24 h-5 bg-gray-200 rounded-md" />
          <div className="w-16 h-6 bg-gray-200 rounded-lg" />
        </div>
        {/* Tabs skeleton */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-20 h-8 bg-gray-200 rounded-xl shrink-0" />
          ))}
        </div>
      </header>

      {/* Orders List Skeleton */}
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-gray-200 space-y-3 shadow-xs"
          >
            <div className="flex justify-between items-center">
              <div className="w-32 h-4 bg-gray-200 rounded" />
              <div className="w-20 h-5 bg-gray-200 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <div className="w-48 h-3.5 bg-gray-200 rounded" />
              <div className="w-28 h-3 bg-gray-200 rounded" />
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <div className="w-24 h-3 bg-gray-200 rounded" />
              <div className="w-16 h-4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrdersListSkeleton;

