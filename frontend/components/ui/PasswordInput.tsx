"use client";

import { useState } from "react";
import clsx from "clsx";

type Props = {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean; // red border when true
  placeholder?: string;
  onBlur?: () => void; // used to mark field as "touched"
  maxHeight?: boolean;
  disabled?: boolean;
};

export default function PasswordInput({
  value,
  onChange,
  invalid = false,
  placeholder,
  onBlur,
  maxHeight,
  disabled
}: Props) {
  const [visible, setVisible] = useState(false);
  const className = maxHeight
    ? "mt-1 w-full rounded-lg p-2"
    : "w-full rounded-md px-2 py-1 pr-9 text-sm";

  return (
    <div className="relative w-full">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={clsx(
          className,
          "focus:outline-none focus:ring-0 border",
          invalid ? "border-danger" : "border-slate-300"
        )}
      />

      {/* Eye Icon Button */}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        {visible ? (
          // 👁️ Eye-open
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-slate-500 hover:text-slate-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        ) : (
          // 🙈 Eye-off
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-slate-500 hover:text-slate-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.973 9.973 0 012.567-4.304M6.586 6.586A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7-.43 1.37-1.15 2.62-2.07 3.68M15 12a3 3 0 00-3-3m0 0a2.999 2.999 0 00-2.121.879M9 9l6 6"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
