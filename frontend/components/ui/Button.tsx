"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  variant?: ButtonVariant;
};
type ButtonVariant = "primary" | "accent" | "danger" | "secondary" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-surface-10 text-white hover:bg-surface-20 active:bg-surface-30",
  accent: "bg-accent text-white hover:bg-surface-40 active:bg-surface-50",
  danger: "bg-danger text-white hover:bg-danger-muted active:opacity-90",
  secondary:
    "bg-transparent border border-surface-20 text-fg hover:bg-black/5 active:bg-black/10",
  ghost:
    "bg-transparent text-fg/70 hover:text-fg hover:bg-black/8 active:bg-black/12"
};

export default function Button({
  onClick,
  children,
  className = "",
  type = "button",
  disabled = false,
  variant = "primary"
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={() => onClick?.()}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
        "transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        variantClasses[variant],
        className
      ].join(" ")}
    >
      {children}
    </button>
  );
}



export function SortButton({
  children,
  active,
  dir,
  onClick
}: {
  children: React.ReactNode;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1 transition-colors duration-150 hover:underline",
        active ? "text-fg font-semibold" : "text-fg/60 hover:text-fg"
      ].join(" ")}
      title="Sort"
    >
      {children}
      <span className="text-[10px]">
        {active ? (dir === "asc" ? "▲" : "▼") : ""}
      </span>
    </button>
  );
}
