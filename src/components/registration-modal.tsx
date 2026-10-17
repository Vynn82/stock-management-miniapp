'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  Phone,
  Send,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useTelegram } from '@/context/telegram-context';
import { LocationInputSection } from './location-input-section';

export function RegistrationModal() {
  const {
    isRegistrationOpen,
    closeRegistration,
    customer,
    telegramUser,
    registerCustomer,
    hapticFeedback,
  } = useTelegram();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [province, setProvince] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [commune, setCommune] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      if (customer.companyName) setCompanyName(customer.companyName);
      if (customer.contactName) setContactName(customer.contactName);
      if (customer.phone) setPhone(customer.phone);
      if (customer.address) setAddress(customer.address);
      if (customer.latitude !== undefined && customer.latitude !== null) {
        setLatitude(Number(customer.latitude));
      }
      if (customer.longitude !== undefined && customer.longitude !== null) {
        setLongitude(Number(customer.longitude));
      }
      if (customer.province) setProvince(customer.province);
      if (customer.district) setDistrict(customer.district);
      if (customer.commune) setCommune(customer.commune);
    } else if (telegramUser) {
      const defaultContact = [telegramUser.firstName, telegramUser.lastName]
        .filter(Boolean)
        .join(' ');
      if (defaultContact) setContactName(defaultContact);
    }
  }, [customer, telegramUser]);

  if (!isRegistrationOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (!address.trim()) {
      setErrorMsg('Please enter your primary delivery address');
      return;
    }

    setSubmitting(true);
    try {
      await registerCustomer({
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        latitude,
        longitude,
        province,
        district,
        commune,
      });
      setSubmittedSuccess(true);
      hapticFeedback('success');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setErrorMsg(message);
      hapticFeedback('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">
                Partner Registration
              </h2>
              <p className="text-[11px] text-gray-500">
                Register to unlock wholesale and retail ordering
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeRegistration}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
            title="Skip for now"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {submittedSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                  Registration Complete
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  Account Active
                </h3>
                <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto leading-relaxed">
                  Your partner account is now active. You can add items to your cart and create orders immediately.
                </p>
              </div>

              <button
                type="button"
                onClick={closeRegistration}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                Start Shopping & Ordering <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              {/* Telegram Identity Card */}
              {telegramUser && (
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {telegramUser.firstName?.[0] || 'T'}
                  </div>
                  <div className="text-xs min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 truncate text-[11px]">
                      {telegramUser.firstName} {telegramUser.lastName || ''}
                    </div>
                    <div className="text-gray-500 text-[10px] truncate">
                      {telegramUser.username ? `@${telegramUser.username}` : `ID: ${telegramUser.id}`}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    Verified
                  </span>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Company / Partner Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phnom Penh Retailers Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Contact Person Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sokha Chan"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 012 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <LocationInputSection
                  address={address}
                  latitude={latitude}
                  longitude={longitude}
                  province={province}
                  district={district}
                  commune={commune}
                  onChange={(loc) => {
                    setAddress(loc.address);
                    setLatitude(loc.latitude);
                    setLongitude(loc.longitude);
                    setProvince(loc.province || null);
                    setDistrict(loc.district || null);
                    setCommune(loc.commune || null);
                  }}
                  required
                />

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit Registration
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={closeRegistration}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-xl text-xs transition-colors"
                  >
                    Skip for Now & Browse Catalog
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
