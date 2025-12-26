"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { suggestCategoriesHelper } from "@/lib/suggestCategory";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onPick?: (v: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  maxItems?: number;
};

export default function CategoryInput({
  value,
  onChange,
  onPick,
  options,
  placeholder,
  required,

}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [pos, setPos] = useState<{ left: number; top: number; width: number }>({
    left: 0,
    top: 0,
    width: 0
  });

  const sorted = useMemo(
    () => [...options].sort((a, b) => a.localeCompare(b)),
    [options]
  );

  const suggestions = useMemo(
    () => suggestCategoriesHelper(sorted, value, ),
    [sorted, value,]
  );

  function updatePosition() {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      left: r.left + window.scrollX,
      top: r.bottom + window.scrollY,
      width: r.width
    });
  }

  useEffect(() => {
    if (!open) return;

    // position right away
    updatePosition();

    // keep positioned when scrolling inside scroll containers + window scroll
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // keep active item visible (inside the dropdown itself)
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

  const menu =
    open && suggestions.length > 0 ? (
      <div
        className="fixed z-[9999] mt-1 rounded-md border bg-white shadow text-sm max-h-56 overflow-auto"
        style={{
          left: pos.left,
          top: pos.top + 4,
          width: pos.width
        }}
      >
        {suggestions.map((c, idx) => {
          const active = idx === activeIndex;
          return (
            <button
              id={`catopt-${idx}`}
              key={c}
              type="button"
              tabIndex={-1}
              className={[
                "block w-full text-left px-2 py-1",
                active ? "bg-gray-100" : "hover:bg-gray-50"
              ].join(" ")}
              onMouseDown={(e) => e.preventDefault()} // keep focus in input
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => pick(c)}
            >
              {c}
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <div
      className="relative"
      onBlur={(e) => {
        // close only if focus left the whole container
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
          // make sure position is correct when opening
          // (especially after scrolling inside the table)
          if (typeof window !== "undefined") updatePosition();
        }}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(suggestions.length ? 0 : -1);
          if (typeof window !== "undefined") updatePosition();
        }}
        onBlur={(e) => {
          pick(e.target.value);
        }}
        placeholder={placeholder}
        required={required}
        className="w-full rounded px-1 outline-none border-none bg-transparent"
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setOpen(true);
            setActiveIndex(suggestions.length ? 0 : -1);
            if (typeof window !== "undefined") updatePosition();
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

      {/* Render dropdown in a portal so it's not clipped by overflow containers */}
      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
