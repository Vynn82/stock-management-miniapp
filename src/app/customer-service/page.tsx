"use client";

import React from "react";
import { ArrowUpRight, AtSign, Clock3, Headset, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/language-context";

const faqKeys = [
  ["support_faq_order_q", "support_faq_order_a"],
  ["support_faq_delivery_q", "support_faq_delivery_a"],
  ["support_faq_payment_q", "support_faq_payment_a"],
  ["support_faq_status_q", "support_faq_status_a"],
] as const;

export default function CustomerServicePage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8fa] pb-32 text-slate-900">
      <header className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 px-6 pb-24 pt-9 text-center text-white">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
            <Headset className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t("support_title")}</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-white/80">
            {t("support_subtitle")}
          </p>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-12 w-full max-w-md space-y-10 px-5">
        <section className="rounded-[1.7rem] border border-slate-100 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.12)]">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
              <path fill="currentColor" d="M21.7 4.4 18.5 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.6.6-1.2.6l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L5.7 13.7.8 12.2c-1.1-.3-1.1-1 .2-1.5L20.2 3.2c.9-.3 1.7.2 1.5 1.2Z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-slate-400">{t("support_card_eyebrow")}</p>
          <h2 className="mt-1 text-lg font-bold tracking-tight">{t("support_telegram_title")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{t("support_telegram_desc")}</p>
          <div className="mt-4 space-y-2 text-xs text-slate-500">
            <p className="flex items-center gap-2"><AtSign className="h-4 w-4 shrink-0" />{t("support_handle")}</p>
            <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 shrink-0" />{t("support_hours")}</p>
          </div>
          <a
            href="https://t.me/CPLPLAYInsiderHub"
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-full bg-sky-600 px-4 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition-colors hover:bg-sky-700 active:scale-[0.99]"
          >
            {t("support_cta")}<ArrowUpRight className="h-4 w-4" />
          </a>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-extrabold tracking-tight">{t("support_faq_title")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("support_faq_subtitle")}</p>
          </div>
          <div className="overflow-hidden rounded-[1.6rem] bg-white px-4 shadow-sm">
            {faqKeys.map(([question, answer], index) => (
              <details key={question} className="group border-b border-slate-100 last:border-0">
                <summary className="flex cursor-pointer list-none items-center gap-3 py-4 text-sm font-semibold leading-5 marker:content-none">
                  <span className="text-xs font-bold text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                  <span className="flex-1">{t(question)}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-4 pl-8 pr-5 text-sm leading-6 text-slate-500">{t(answer)}</p>
              </details>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
