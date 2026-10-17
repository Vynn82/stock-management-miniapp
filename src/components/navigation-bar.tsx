"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, Clock } from "lucide-react";
import { useCart } from "@/context/cart-context";

export function NavigationBar() {
  const pathname = usePathname();
  const { totalCount } = useCart();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Products", icon: Package },
    { href: "/cart", label: "Cart", icon: ShoppingCart, badge: totalCount },
    { href: "/orders", label: "My Orders", icon: Clock },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-2 max-w-md mx-auto">
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
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
