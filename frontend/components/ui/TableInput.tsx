"use client";

import { useLayoutEffect, useRef } from "react";

type TableInputProps = {
  value: string | number;
  onChange: (val: string) => void;
  onBlur?: (val: string) => void;
  type?: string;
  list?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
};

export default function TableInput({
  value,
  onChange,
  onBlur,
  type = "text",
  list,
  placeholder,
  multiline = false,
  rows = 1
}: TableInputProps) {
  const stringValue =
    value === null || value === undefined ? "" : String(value);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow textarea height to fit content
  useLayoutEffect(() => {
    if (!multiline) return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [multiline, stringValue]);

  function handleChange(val: string) {
    if (type === "number") {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        if (num > 999999999 || num < -999999999) return;
        if (val.includes(".")) {
          const [, decimal] = val.split(".");
          if (decimal.length > 5) return;
        }
      }
    }
    onChange(val);
  }

  const baseClass =
    "w-full rounded px-1 outline-none border-none bg-transparent";

  if (multiline) {
    return (
      <textarea
        ref={textareaRef}
        rows={rows}
        placeholder={placeholder}
        value={stringValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => onBlur?.(e.target.value)}
        title={stringValue}
        className={[
          baseClass,
          "resize-none whitespace-pre-wrap break-words leading-5"
        ].join(" ")}
      />
    );
  }

  return (
    <input
      type={type}
      list={list}
      placeholder={placeholder}
      value={stringValue}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={(e) => onBlur?.(e.target.value)}
      title={stringValue}
      className={baseClass}
    />
  );
}
