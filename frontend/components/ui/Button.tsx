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
type ButtonVariant = "primary" | "accent" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-surface text-white",
  accent: "bg-accent text-white",
  danger: "bg-danger text-white"
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
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ",
        "text-white  disabled:opacity-60 disabled:cursor-not-allowed",
        " transition-shadow  hover:drop-shadow-[0_0_4px_rgba(0,0,0,0.24)]",
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
        "inline-flex items-center gap-1 hover:underline",
        active ? "text-gray-900" : "text-gray-600"
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
