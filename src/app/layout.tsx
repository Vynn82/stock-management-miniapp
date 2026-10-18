import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "@/context/language-context";
import { TelegramProvider } from "@/context/telegram-context";
import { CartProvider } from "@/context/cart-context";
import { NavigationBar } from "@/components/navigation-bar";
import { RegistrationModal } from "@/components/registration-modal";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Stock Management - Partner Store",
  description: "Telegram Mini App customer ordering system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 text-gray-900 min-h-screen`}
      >
        <LanguageProvider>
          <TelegramProvider>
            <CartProvider>
              <main className="max-w-md mx-auto min-h-screen bg-white shadow-md flex flex-col pb-16 relative">
                {children}
                <NavigationBar />
                <RegistrationModal />
              </main>
            </CartProvider>
          </TelegramProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
