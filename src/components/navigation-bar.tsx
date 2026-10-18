"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  Package,
  ReceiptText,
  Settings2,
  Headset,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function NavigationBar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Hide navigation bar during checkout flow to avoid clutter and button collision
  if (
    pathname === "/checkout" ||
    pathname?.startsWith("/checkout/") ||
    pathname?.startsWith("/products/")
  ) {
    return null;
  }

  const navItems: NavItem[] = [
    { href: "/", label: t("nav_home"), icon: Store },
    { href: "/products", label: t("nav_catalog"), icon: Package },
    { href: "/orders", label: t("nav_orders"), icon: ReceiptText },
    { href: "/customer-service", label: t("support_nav"), icon: Headset },
  ];

  const isSettingsActive = pathname === "/settings" || pathname?.startsWith("/settings/");

  return (
    <nav className="fixed bottom-3.5 left-0 right-0 z-50 px-3 max-w-md mx-auto flex items-center gap-2 pointer-events-none transition-all">
      {/* Main Glassmorphic Dock Capsule */}
      <div className="pointer-events-auto flex-1 backdrop-blur-2xl bg-white/85 border border-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.09)] rounded-[2.2rem] px-2 py-1.5 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-full transition-all duration-300 ease-out active:scale-90 relative ${
                isActive ? "text-blue-600" : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              <div
                className={`relative transition-all duration-300 flex flex-col items-center justify-center ${
                  isActive
                    ? "bg-gradient-to-b from-blue-50/90 to-indigo-50/80 shadow-[0_4px_16px_rgba(37,99,235,0.12)] border border-blue-100/90 rounded-full px-3.5 py-1 -translate-y-0.5"
                    : "px-2 py-1"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isActive ? "stroke-[2.5] text-blue-600 scale-105" : "stroke-[1.8]"
                    }`}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className="absolute -top-1.5 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200"
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[9px] tracking-tight mt-0.5 transition-all duration-300 ${
                    isActive ? "font-extrabold text-blue-600" : "font-medium text-neutral-400"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Right Circular Floating Button for Settings / More */}
      <Link
        href="/settings"
        className={`pointer-events-auto w-14 h-14 rounded-full backdrop-blur-2xl border shadow-[0_12px_40px_rgba(0,0,0,0.09)] flex flex-col items-center justify-center shrink-0 active:scale-95 transition-all duration-300 ${
          isSettingsActive
            ? "bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white border-blue-400/40 shadow-lg shadow-blue-500/25 -translate-y-0.5"
            : "bg-white/85 text-neutral-500 hover:text-blue-600 border-white/80"
        }`}
        aria-label="Settings"
      >
        <Settings2
          className={`w-5 h-5 transition-transform duration-300 ${
            isSettingsActive ? "stroke-[2.4] text-white scale-105" : "stroke-[1.8]"
          }`}
        />
        <span
          className={`text-[9px] tracking-tight mt-0.5 ${
            isSettingsActive ? "font-extrabold text-white" : "font-medium text-neutral-400"
          }`}
        >
          {t("nav_settings")}
        </span>
      </Link>
    </nav>
  );
}
