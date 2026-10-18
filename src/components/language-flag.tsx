import React, { useId } from "react";
import Image from "next/image";
import type { Language } from "@/context/language-context";

export function LanguageFlag({ language }: { language: Language }) {
  const clipId = useId().replace(/:/g, "");

  if (language === "km") {
    return (
      <Image
        src="/cambodia-flag.png"
        alt="Cambodia flag"
        width={120}
        height={80}
        className="h-5 w-7 shrink-0 rounded-[3px] object-cover shadow-sm"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 30 20"
      className="h-4 w-6 shrink-0 rounded-[3px] shadow-sm"
      role="img"
      aria-label="English language flag"
    >
      <defs>
        <clipPath id={clipId}>
          <rect width="30" height="20" rx="2" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="30" height="20" fill="#17336f" />
        <path d="m0 0 30 20M30 0 0 20" stroke="white" strokeWidth="5" />
        <path d="m0 0 30 20M30 0 0 20" stroke="#c8102e" strokeWidth="2" />
        <path d="M15 0v20M0 10h30" stroke="white" strokeWidth="7" />
        <path d="M15 0v20M0 10h30" stroke="#c8102e" strokeWidth="3" />
      </g>
    </svg>
  );
}
