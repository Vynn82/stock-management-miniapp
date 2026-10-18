'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ShieldAlert,
  Ban,
  Building2,
  User,
  Phone,
  RefreshCw,
  LogOut,
  Send,
  CheckCircle2,
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import { useTelegram } from '@/context/telegram-context';

export interface AuthGateProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackToStore?: boolean;
}

export function AuthGate({
  children,
  title,
  subtitle,
  showBackToStore = true,
}: AuthGateProps) {
  const {
    isReady,
    authStatus,
    authError,
    customer,
    telegramUser,
    statusMessage,
    refreshAuth,
    registerCustomer,
    closeApp,
    hapticFeedback,
  } = useTelegram();

  // Registration / Resubmission form state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [formInitialized, setFormInitialized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize form default values when customer or telegramUser is available
  React.useEffect(() => {
    if (!formInitialized) {
      if (customer) {
        if (customer.companyName) setCompanyName(customer.companyName);
        if (customer.contactName) setContactName(customer.contactName);
        if (customer.phone) setPhone(customer.phone);
        setFormInitialized(true);
      } else if (telegramUser) {
        const defaultContact = [telegramUser.firstName, telegramUser.lastName]
          .filter(Boolean)
          .join(' ');
        if (defaultContact) setContactName(defaultContact);
        setFormInitialized(true);
      }
    }
  }, [customer, telegramUser, formInitialized]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    hapticFeedback('light');
    try {
      await refreshAuth();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!companyName.trim()) {
      setErrorMsg('Please enter your company or partner name');
      return;
    }
    if (!contactName.trim()) {
      setErrorMsg('Please enter a contact person name');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter a valid phone number');
      return;
    }

    setSubmitting(true);
    try {
      await registerCustomer({
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setErrorMsg(message);
      hapticFeedback('error');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Initial Loading State
  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-gray-800">Connecting to Telegram...</h2>
        <p className="text-sm text-gray-500 mt-1">Verifying your partner credentials</p>
      </div>
    );
  }

  // 2. ACTIVE: Full Access Granted (no approval step)
  if (authStatus === 'ACTIVE' || authStatus === 'PENDING') {
    return <>{children}</>;
  }

  // 3. REGISTRATION REQUIRED: First time customer form
  if (authStatus === 'REGISTRATION_REQUIRED') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 p-4 pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-md w-full mx-auto my-auto">
          {showBackToStore && (
            <div className="mb-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Browse Products First
              </Link>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {title || 'Partner Registration'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {subtitle ||
                'Welcome! Complete your company profile to start browsing and ordering immediately.'}
            </p>
          </div>

          {/* Telegram Identity Card */}
          {telegramUser && (
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 mb-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {telegramUser.firstName?.[0] || 'T'}
              </div>
              <div className="text-xs min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {telegramUser.firstName} {telegramUser.lastName || ''}
                </div>
                <div className="text-gray-500 truncate">
                  {telegramUser.username ? `@${telegramUser.username}` : `ID: ${telegramUser.id}`}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1 text-[10px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                Verified
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Company / Partner Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Phnom Penh Retailers Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Contact Person Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sokha Chan"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 012 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* UX Information Banner */}
            <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-neutral-600">
              <MapPin className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong className="text-neutral-900 block font-bold">Fast Registration</strong>
                No map pinning required now! You can set or change your delivery location anytime in <span className="font-semibold text-neutral-900">Settings</span> or during checkout.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[46px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:from-neutral-400 disabled:to-neutral-400 text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 mt-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Registration...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Registration
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-gray-400 text-center mt-4">
            Registration is instant. You can browse and create orders immediately.
          </p>

          {showBackToStore && (
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <Link
                href="/products"
                className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
              >
                ← Continue Browsing Products as Guest
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. SUSPENDED SCREEN
  if (authStatus === 'SUSPENDED') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-md w-full mx-auto my-auto text-center">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
            Account Suspended
          </span>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Suspended</h2>

          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Your account is currently suspended.
            <br />
            Please contact our staff or customer support for assistance.
          </p>

          <div className="space-y-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Check Status
            </button>

            <button
              onClick={closeApp}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Close App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 7. BLOCKED SCREEN
  if (authStatus === 'BLOCKED') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-md w-full mx-auto my-auto text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Ban className="w-8 h-8" />
          </div>

          <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
            Account Blocked
          </span>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Blocked</h2>

          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Your account is blocked.
            <br />
            You cannot access the ordering system.
          </p>

          <button
            onClick={closeApp}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Close App
          </button>
        </div>
      </div>
    );
  }

  // 8. Error / Connection Failure Screen
  if (authError) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-md w-full mx-auto my-auto text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
            Connection Error
          </span>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Unable to Connect
          </h2>

          <p className="text-xs text-gray-600 leading-relaxed mb-6">
            {authError ||
              'Could not establish a secure connection to the stock management server. Please check your internet connection and try again.'}
          </p>

          <div className="space-y-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              {isRefreshing ? 'Reconnecting...' : 'Retry Connection'}
            </button>

            {showBackToStore && (
              <Link
                href="/products"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors text-center"
              >
                Browse Catalog Anyway
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback if status is unknown or pending check
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-lg font-bold text-gray-800">Verifying Status...</h2>
      <p className="text-sm text-gray-500 mt-1">
        {statusMessage || 'Loading your account'}
      </p>
    </div>
  );
}
