import React from "react";

export default function PopupModal({
  children,
  close,
  label
}: {
  children: React.ReactNode;
  close: () => void;
  label: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label={label}
    >
      {/* Dimming backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-4xl rounded-xl bg-surface-10 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight text-white">{label}</h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={close}
            className="rounded-md p-1.5 text-white/50 hover:text-white hover:bg-white/10 transition-colors duration-150"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
