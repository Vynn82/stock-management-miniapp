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
import { useTelegram } from "@/context/telegram-context";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function NavigationBar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { hapticFeedback } = useTelegram();

  // Hide navigation bar during checkout flow or product detail to avoid clutter and button collision
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
    { href: "/settings", label: t("nav_settings"), icon: Settings2 },
  ];

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-40 px-3 max-w-md mx-auto pointer-events-none transition-all">
      {/* Unified 5-Tab Glassmorphic Capsule */}
      <div className="pointer-events-auto backdrop-blur-2xl bg-white/92 border border-neutral-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.08)] rounded-[2rem] p-1.5 flex items-center justify-between">
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
              onClick={() => {
                try {
                  hapticFeedback("light");
                } catch {}
              }}
              className="flex-1 min-w-0 flex flex-col items-center justify-center py-0.5 px-0.5 active:scale-95 transition-transform duration-200"
            >
              <div
                className={`w-full flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50/90 text-blue-600 border border-blue-100/90 shadow-xs"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive
                        ? "stroke-[2.4] text-blue-600 scale-105"
                        : "stroke-[1.8]"
                    }`}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-black rounded-full min-w-3.5 h-3.5 px-1 flex items-center justify-center shadow-xs">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap truncate max-w-full text-center transition-colors duration-200 ${
                    isActive
                      ? "font-extrabold text-blue-600"
                      : "font-medium text-neutral-400"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
