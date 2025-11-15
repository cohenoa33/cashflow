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
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-label={label}
    >
      {/* Backdrop (non-dismissable by click) */}
      <div className="absolute inset-0 bg-gray-500/50" />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-xl rounded-xl bg-black p-4 shadow-xl"
        // prevent closing when clicking inside
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{label}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {children}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={close}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
