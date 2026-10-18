"use client";

import React, { useEffect, useState } from "react";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  className?: string;
}

export function QuantityInput({
  value,
  onChange,
  label,
  className = "",
}: QuantityInputProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Number(draft);
    const next = Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
    setDraft(String(next));
    if (next !== value) onChange(next);
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      min={1}
      step={1}
      aria-label={label}
      value={draft}
      onChange={(event) => {
        const nextDraft = event.currentTarget.value;
        if (nextDraft === "" || /^\d+$/.test(nextDraft)) {
          setDraft(nextDraft);
          const parsed = Number(nextDraft);
          if (Number.isSafeInteger(parsed) && parsed > 0) onChange(parsed);
        }
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
      className={`appearance-none text-center font-mono font-bold text-xs text-neutral-900 bg-white border border-neutral-200/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${className}`}
    />
  );
}
