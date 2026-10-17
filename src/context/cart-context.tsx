"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "@/types";

interface CartContextValue {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (
    productId: string,
    variantId: string | null | undefined,
    quantity: number,
  ) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  totalCount: 0,
  totalAmount: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tg_cart_items");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("tg_cart_items", JSON.stringify(items));
      } catch {}
    }
  }, [items, isLoaded]);

  const addToCart = (product: Omit<CartItem, "quantity">, quantity = 1) => {
    if (quantity <= 0) return;
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === product.productId &&
          (i.variantId || null) === (product.variantId || null),
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (
    productId: string,
    variantId: string | null | undefined,
    quantity: number,
  ) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter(
          (i) =>
            !(
              i.productId === productId &&
              (i.variantId || null) === (variantId || null)
            ),
        );
      }
      return prev.map((i) => {
        if (
          i.productId === productId &&
          (i.variantId || null) === (variantId || null)
        ) {
          return { ...i, quantity };
        }
        return i;
      });
    });
  };

  const removeFromCart = (productId: string, variantId?: string | null) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.productId === productId &&
            (i.variantId || null) === (variantId || null)
          ),
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
