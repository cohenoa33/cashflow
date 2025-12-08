"use client";

import React from "react";

type TableInputProps = {
  value: string | number;
  onChange: (val: string) => void;
  onBlur?: (val: string) => void;
  type?: string; // "text", "number", "date", etc.
  list?: string; // datalist id
  placeholder?: string;
};

export default function TableInput({
  value,
  onChange,
  onBlur,
  type = "text",
  list,
  placeholder
}: TableInputProps) {
  const stringValue =
    value === null || value === undefined ? "" : String(value);

  return (
    <input
      type={type}
      list={list}
      placeholder={placeholder}
      value={stringValue}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onBlur?.(e.target.value)}
      className={"w-full rounded px-1 outline-none border-none bg-transparent"}
    />
  );
}
