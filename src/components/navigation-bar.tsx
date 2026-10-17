"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingBag, Clock } from "lucide-react";
import { useCart } from "@/context/cart-context";

export function NavigationBar() {
  const pathname = usePathname();
  const { totalCount } = useCart();

  // Hide navigation bar during checkout flow to avoid clutter and overlap
  if (pathname === "/checkout" || pathname?.startsWith("/checkout/")) {
    return null;
  }

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Catalog", icon: Package },
    { href: "/cart", label: "Cart", icon: ShoppingBag, badge: totalCount },
    { href: "/orders", label: "Orders", icon: Clock },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto backdrop-blur-2xl bg-white/90 border-t border-neutral-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] px-3 py-2 transition-all">
      <div className="flex justify-around items-center">
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
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1.5 rounded-2xl transition-all duration-300 ease-out active:scale-90 relative ${
                isActive
                  ? "text-neutral-900 font-bold"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              <div
                className={`relative px-3.5 py-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 text-white shadow-md shadow-black/20 -translate-y-0.5"
                    : "bg-transparent text-neutral-500"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? "stroke-[2.4] text-white scale-105" : "stroke-[1.8]"
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 text-white text-[10px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200 ${
                      isActive ? "bg-red-500" : "bg-neutral-900"
                    }`}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 transition-all duration-300 ${
                  isActive ? "font-extrabold text-neutral-900" : "font-medium text-neutral-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
