import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A labelled control cell for the search panel. The whole cell is one hit
 * target: clicking the label focuses the input inside it.
 */
export function Field({
  label,
  htmlFor,
  icon,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2.5 transition-colors duration-200 focus-within:bg-paper hover:bg-paper/70 focus-within:shadow-lift",
        className,
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0 text-ink-subtle [&_svg]:size-[1.125rem]">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <label
          htmlFor={htmlFor}
          className="block cursor-pointer text-[0.6875rem] font-semibold tracking-[0.08em] text-ink-muted uppercase"
        >
          {label}
        </label>
        {children}
      </span>
    </div>
  );
}

export function fieldInputClass(className?: string) {
  return cn(
    "w-full border-0 bg-transparent p-0 text-[0.9375rem] text-ink placeholder:text-ink-subtle focus:outline-none",
    className,
  );
}
