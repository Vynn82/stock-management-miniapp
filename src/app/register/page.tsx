"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Building2,
  User,
  Phone,
  MapPin,
  ArrowLeft,
  Navigation,
} from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { useTelegram } from "@/context/telegram-context";

function RegisterStatusPage() {
  const { customer } = useTelegram();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4 pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-md w-full mx-auto my-auto text-center">
        <div className="flex items-center justify-start mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
        </div>

        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
          Active Partner
        </span>

        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Account Verified
        </h1>
        <p className="text-xs text-gray-500 mb-6">
          Your partner account is active and verified. You can place orders
          directly.
        </p>

        {customer && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-left text-xs space-y-2 mb-6 text-gray-600">
            <div className="flex items-center gap-2 text-gray-800 font-semibold border-b border-gray-200 pb-2 mb-1">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>{customer.companyName}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Contact:
              </span>
              <span className="font-medium text-gray-900">
                {customer.contactName}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Phone:
              </span>
              <span className="font-medium text-gray-900">
                {customer.phone}
              </span>
            </div>
            <div className="py-1">
              <span className="text-gray-400 flex items-center gap-1 mb-0.5">
                <MapPin className="w-3.5 h-3.5" /> Delivery Address:
              </span>
              <span className="font-medium text-gray-900 block truncate">
                {customer.address}
              </span>
            </div>
            {customer.latitude && customer.longitude && (
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" /> GPS Pin:
                </span>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${customer.latitude}&mlon=${customer.longitude}#map=16/${customer.latitude}/${customer.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-blue-600 hover:underline font-medium"
                >
                  {Number(customer.latitude).toFixed(6)}, {Number(customer.longitude).toFixed(6)}
                </a>
              </div>
            )}
            {(customer.province || customer.district || customer.commune) && (
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 flex items-center gap-1">
                  Area:
                </span>
                <span className="font-medium text-gray-900 truncate">
                  {[customer.commune, customer.district, customer.province].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}

        <Link
          href="/products"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          Browse Products & Order <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthGate
      title="Partner Registration"
      subtitle="Complete your company registration to place wholesale and retail orders."
      showBackToStore={true}
    >
      <RegisterStatusPage />
    </AuthGate>
  );
}
