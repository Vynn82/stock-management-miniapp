"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingBag, Clock } from "lucide-react";
import { useCart } from "@/context/cart-context";

export function NavigationBar() {
  const pathname = usePathname();
  const { totalCount } = useCart();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Catalog", icon: Package },
    { href: "/cart", label: "Cart", icon: ShoppingBag, badge: totalCount },
    { href: "/orders", label: "Orders", icon: Clock },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto backdrop-blur-2xl bg-white/85 border-t border-neutral-200/70 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] px-3 py-2 transition-all">
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
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all duration-300 ease-out active:scale-90 relative ${
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all duration-300 ${
                  isActive ? "bg-blue-50/80 -translate-y-0.5" : "bg-transparent"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? "stroke-[2.4] scale-105" : "stroke-[1.8]"
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 transition-all duration-300 ${
                  isActive ? "font-bold text-blue-600" : "font-medium"
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
