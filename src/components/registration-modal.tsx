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
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useTelegram } from '@/context/telegram-context';
import { useLanguage } from '@/context/language-context';

export function RegistrationModal() {
  const {
    isRegistrationOpen,
    closeRegistration,
    customer,
    telegramUser,
    registerCustomer,
    hapticFeedback,
  } = useTelegram();
  const { t } = useLanguage();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      if (customer.companyName) setCompanyName(customer.companyName);
      if (customer.contactName) setContactName(customer.contactName);
      if (customer.phone) setPhone(customer.phone);
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

    setSubmitting(true);
    try {
      await registerCustomer({
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-neutral-200/80">
        {/* Header */}
        <div className="px-5 py-4 border-b border-blue-500/30 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/25 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                {t("reg_modal_title")}
              </h2>
              <p className="text-[11px] text-blue-100">
                Unlock wholesale ordering & fast delivery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeRegistration}
            className="p-1.5 rounded-full text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
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
                  {t("common_verified")}
                </span>
                <h3 className="text-base font-bold text-neutral-900">
                  {t("reg_complete_title")}
                </h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-xs mx-auto leading-relaxed">
                  {t("reg_complete_desc")}
                </p>
              </div>

              <button
                type="button"
                onClick={closeRegistration}
                className="w-full py-3 px-4 min-h-[44px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                {t("reg_start_ordering")} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              {/* Telegram Identity Card */}
              {telegramUser && (
                <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-blue-500/25">
                    {telegramUser.firstName?.[0] || 'T'}
                  </div>
                  <div className="text-xs min-w-0 flex-1">
                    <div className="font-bold text-neutral-900 truncate text-[11px]">
                      {telegramUser.firstName} {telegramUser.lastName || ''}
                    </div>
                    <div className="text-neutral-500 text-[10px] truncate">
                      {telegramUser.username ? `@${telegramUser.username}` : `ID: ${telegramUser.id}`}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    {t("common_verified")}
                  </span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {t("reg_company_name")}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-blue-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder={t("reg_company_placeholder")}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {t("reg_contact_name")}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-blue-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder={t("reg_contact_placeholder")}
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {t("reg_phone")}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-blue-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder={t("reg_phone_placeholder")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* UX Information Banner */}
                <div className="bg-blue-50/60 border border-blue-200/70 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-blue-900">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong className="text-blue-950 block font-bold">{t("reg_fast_title")}</strong>
                    {t("reg_fast_desc")}
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full min-h-[46px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:from-neutral-400 disabled:to-neutral-400 text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t("reg_submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        {t("reg_submit")}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={closeRegistration}
                    className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold py-2.5 px-4 rounded-2xl text-xs transition-colors"
                  >
                    {t("reg_skip")}
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
