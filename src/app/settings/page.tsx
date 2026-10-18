"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Phone,
  MapPin,
  Navigation,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ShoppingCart,
  ReceiptText,
  Boxes,
  LogOut,
  AlertTriangle,
  Globe,
} from "lucide-react";
import { useTelegram } from "@/context/telegram-context";
import { useLanguage } from "@/context/language-context";
import { LocationMapPicker } from "@/components/location-map-picker";
import { LocationData } from "@/types";
import { LanguageFlag } from "@/components/language-flag";

export default function SettingsPage() {
  const {
    customer,
    telegramUser,
    authStatus,
    refreshAuth,
    updateCustomerLocation,
    openRegistration,
    logout,
    hapticFeedback,
  } = useTelegram();

  const { language, setLanguage, t } = useLanguage();

  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    hapticFeedback("light");
    try {
      await refreshAuth();
      showToast(t("settings_refreshed"));
    } finally {
      setIsRefreshing(false);
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 2800);
  };

  const handleConfirmLocation = async (loc: LocationData) => {
    hapticFeedback("medium");
    await updateCustomerLocation({
      address: loc.address,
      latitude: loc.latitude,
      longitude: loc.longitude,
      province: loc.province || null,
      district: loc.district || null,
      commune: loc.commune || null,
    });
    showToast(t("settings_saved"));
  };

  const handleSelectLanguage = (lang: "en" | "km") => {
    hapticFeedback("medium");
    setLanguage(lang);
    showToast(lang === "km" ? "បានប្តូរទៅជាភាសាខ្មែរ" : "Switched to English");
  };

  const handlePerformLogout = () => {
    hapticFeedback("heavy");
    logout();
    setShowLogoutModal(false);
    showToast(language === "km" ? "បានចាកចេញដោយជោគជ័យ" : "Logged out successfully");
  };

  const areaText = [customer?.commune, customer?.district, customer?.province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7] text-[#1d1d1f] pb-36">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl shadow-blue-500/25 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 border border-blue-400/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Frosted Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#f5f5f7]/90 border-b border-neutral-200/70 px-4 py-3.5 flex justify-between items-center">
        <div>
          <h1 className="text-base font-black tracking-tight text-neutral-900">
            {t("settings_title")}
          </h1>
          <span className="text-[10px] text-neutral-400 font-medium">
            {t("settings_subtitle")}
          </span>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 active:scale-95 transition-all"
          title="Refresh Account Data"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
          />
        </button>
      </header>

      <div className="p-4 pt-5 space-y-4 max-w-lg mx-auto w-full">
        {/* Partner Identity Card */}
        <div className="bg-white p-4 rounded-[1.6rem] border border-white shadow-[0_8px_24px_rgba(15,23,42,0.055)] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/20 ring-4 ring-blue-50 shrink-0">
              {customer?.contactName?.[0] || telegramUser?.firstName?.[0] || "P"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold text-neutral-900 truncate">
                  {customer?.contactName ||
                    `${telegramUser?.firstName || ""} ${telegramUser?.lastName || ""}`.trim() ||
                    t("home_welcome_partner")}
                </h2>
                {authStatus === "ACTIVE" ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t("common_verified")}
                  </span>
                ) : (
                  <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-full">
                    {authStatus || t("common_unregistered")}
                  </span>
                )}
              </div>

              {customer?.companyName && (
                <p className="text-xs font-semibold text-neutral-700 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="truncate">{customer.companyName}</span>
                </p>
              )}

              {customer?.phone && (
                <p className="text-[11px] font-mono text-neutral-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-neutral-400" />
                  <span>{customer.phone}</span>
                </p>
              )}
            </div>
          </div>

          {telegramUser?.username && (
            <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-[11px]">
              <span className="text-neutral-400">{t("settings_telegram_handle")}</span>
              <span className="font-mono font-medium text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-lg">
                @{telegramUser.username}
              </span>
            </div>
          )}
        </div>

        {/* LANGUAGE SWITCHER CARD (Khmer & English) */}
        <div className="bg-white p-4 rounded-[1.6rem] border border-white shadow-[0_8px_24px_rgba(15,23,42,0.055)] space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  {t("settings_language")}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {t("settings_language_desc")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-[#f3f4f6] p-1 pt-1">
            <button
              type="button"
              onClick={() => handleSelectLanguage("km")}
              className={`min-h-11 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-transparent active:scale-[0.98] ${
                language === "km"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-transparent hover:bg-white text-neutral-600"
              }`}
            >
              <LanguageFlag language="km" />
              <span>{t("settings_language_km")}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectLanguage("en")}
              className={`min-h-11 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-transparent active:scale-[0.98] ${
                language === "en"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-transparent hover:bg-white text-neutral-600"
              }`}
            >
              <LanguageFlag language="en" />
              <span>{t("settings_language_en")}</span>
            </button>
          </div>
        </div>

        {/* PRIMARY DELIVERY LOCATION SETTING */}
        <div className="bg-white p-4 rounded-[1.6rem] border border-white shadow-[0_8px_24px_rgba(15,23,42,0.055)] space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {t("settings_primary_delivery")}
            </span>
            {customer?.latitude && customer?.longitude ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-mono">
                <Navigation className="w-2.5 h-2.5" />
                {t("checkout_pinned")}
              </span>
            ) : null}
          </div>

          <div className="bg-[#f5f5f7] rounded-2xl p-3.5 border border-neutral-200/60 space-y-1.5">
            <p className="text-xs font-bold text-neutral-800 leading-snug">
              {customer?.address || "Phnom Penh, Cambodia"}
            </p>
            {areaText ? (
              <p className="text-[11px] text-neutral-500 font-medium">
                {areaText}
              </p>
            ) : null}

            {customer?.latitude && customer?.longitude ? (
              <div className="pt-1.5 border-t border-neutral-200/60 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>{t("settings_pinned_location")}:</span>
                <span className="text-neutral-700 font-semibold">
                  {Number(customer.latitude).toFixed(5)}, {Number(customer.longitude).toFixed(5)}
                </span>
              </div>
            ) : (
              <p className="text-[10px] text-amber-700 pt-1 leading-relaxed">
                {t("settings_no_pinned_location")}
              </p>
            )}
          </div>

          {/* Map Trigger Button */}
          <button
            type="button"
            onClick={() => {
              hapticFeedback("light");
              setIsMapPickerOpen(true);
            }}
            className="w-full py-3 px-4 min-h-[46px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <MapPin className="w-4 h-4" />
            <span>
              {customer?.latitude && customer?.longitude
                ? t("settings_change_pin")
                : t("settings_set_pin")}
            </span>
          </button>
        </div>

        {/* Quick Hub Navigation Cards */}
        <div className="bg-white rounded-[1.6rem] border border-white divide-y divide-neutral-100 shadow-[0_8px_24px_rgba(15,23,42,0.055)] overflow-hidden">
          <Link
            href="/orders"
            className="p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ReceiptText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  {t("home_order_history")}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {t("settings_order_history_desc")}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors" />
          </Link>

          <Link
            href="/cart"
            className="p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  {t("nav_cart")}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {t("settings_cart_desc")}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
          </Link>

          <Link
            href="/products"
            className="p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  {t("home_full_catalog")}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {t("settings_browse_catalog_desc")}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-cyan-700 transition-colors" />
          </Link>
        </div>

        {/* Partner Registration Notice if not active */}
        {authStatus === "REGISTRATION_REQUIRED" && (
          <div className="bg-blue-50/80 border border-blue-200 rounded-3xl p-4 flex items-start justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-blue-950 block">
                {t("home_complete_reg")}
              </span>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                {t("home_reg_desc")}
              </p>
            </div>
            <button
              type="button"
              onClick={openRegistration}
              className="shrink-0 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              {t("home_register_now")}
            </button>
          </div>
        )}

        {/* LOGOUT BUTTON CARD */}
        {authStatus === "ACTIVE" && (
        <div className="bg-white p-4 rounded-[1.6rem] border border-white shadow-[0_8px_24px_rgba(15,23,42,0.055)] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  {t("settings_logout")}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {t("settings_logout_desc")}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                hapticFeedback("light");
                setShowLogoutModal(true);
              }}
              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              {t("settings_logout")}
            </button>
          </div>
        </div>
        )}

        {/* Support & System Info Footer */}
        <div className="bg-white p-4 rounded-[1.6rem] border border-white text-xs space-y-2 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
          <div className="flex justify-between items-center text-neutral-500">
            <span>Customer Platform</span>
            <span className="font-semibold text-neutral-800">Telegram WebApp v2.0</span>
          </div>
          <div className="flex justify-between items-center text-neutral-500">
            <span>Customer ID</span>
            <span className="font-mono text-neutral-800 font-semibold">
              {customer?.id || telegramUser?.id || "N/A"}
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-[11px] text-neutral-400">
            <span>Cash on Delivery Partner System</span>
            <span className="font-bold text-emerald-600">Connected</span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-neutral-200/80 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-neutral-900">
                {t("settings_logout_confirm_title")}
              </h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                {t("settings_logout_confirm_desc")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 px-3 rounded-2xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all active:scale-95"
              >
                {t("settings_logout_cancel")}
              </button>

              <button
                type="button"
                onClick={handlePerformLogout}
                className="py-2.5 px-3 rounded-2xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/25 transition-all active:scale-95"
              >
                {t("settings_logout_confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Location Map Picker Modal */}
      {isMapPickerOpen && (
        <LocationMapPicker
          isOpen={isMapPickerOpen}
          initialLat={customer?.latitude ? Number(customer.latitude) : undefined}
          initialLng={customer?.longitude ? Number(customer.longitude) : undefined}
          initialAddress={customer?.address || ""}
          onClose={() => setIsMapPickerOpen(false)}
          onConfirm={handleConfirmLocation}
        />
      )}
    </div>
  );
}
