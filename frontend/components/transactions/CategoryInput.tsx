"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { suggestCategoriesHelper } from "@/lib/suggestCategory";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onPick?: (v: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  maxItems?: number;
  className?: string[];
};

export default function CategoryInput({
  value,
  onChange,
  onPick,
  options,
  placeholder,
  required, className
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const sorted = useMemo(
    () => [...options].sort((a, b) => a.localeCompare(b)),
    [options]
  );

  const suggestions = useMemo(
    () => suggestCategoriesHelper(sorted, value),
    [sorted, value]
  );

  // Keep active item visible
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    document
      .getElementById(`catopt-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function pick(v: string) {
    onChange(v);
    onPick?.(v);
    setOpen(false);
    setActiveIndex(-1);
  }

  return (
    <div
      className={`w-full relative p-0 ${open ? "bg-gray-100" : ""}`}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <input
        ref={inputRef}
        value={value}
        onFocus={() => {
          setOpen(true);
          setActiveIndex(suggestions.length ? 0 : -1);
        }}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(suggestions.length ? 0 : -1);
        }}
        onBlur={(e) => {
          pick(e.target.value);
        }}
        placeholder={placeholder}
        required={required}
        className={
          className
            ? className.join(" ")
            : `w-full rounded px-1 outline-none border-none bg-transparent`
        }
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setOpen(true);
            setActiveIndex(suggestions.length ? 0 : -1);
            return;
          }

          if (e.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
            return;
          }

          if (!suggestions.length) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
            return;
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
            return;
          }

          if (e.key === "Enter") {
            if (activeIndex >= 0 && activeIndex < suggestions.length) {
              e.preventDefault();
              pick(suggestions[activeIndex]);
            }
          }
        }}
      />

      {open && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 z-50 rounded-md border bg-white shadow text-sm max-h-56 overflow-auto mt-1"
          onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
          onTouchMove={(e) => e.preventDefault()}
        >
          {suggestions.map((c, idx) => (
            <button
              id={`catopt-${idx}`}
              key={c}
              type="button"
              tabIndex={-1}
              className={`block w-full text-left px-2 py-1 ${
                idx === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => pick(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
