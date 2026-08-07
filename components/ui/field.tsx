import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A labelled control cell for the search panel. The whole cell is one hit
 * target: clicking the label focuses the input inside it.
 *
 * The panel is white, so a cell can no longer signal hover by filling white.
 * It borrows the header nav's sand-soft tint for that. Focus gets no fill of
 * its own — the text caret already shows it for a typed field, and adding a
 * colour flash on top just fights that.
 */
export function Field({
  label,
  htmlFor,
  icon,
  error,
  variant = "fill",
  errorPlacement = "inside",
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  icon?: React.ReactNode;
  error?: string;
  /**
   * "fill" is the search panel's tinted cell (sand-soft on hover, no fill on
   * focus). "outline" swaps the hover fill for a border — for contexts like a
   * modal, where a bordered field row already sits on its own surface.
   */
  variant?: "fill" | "outline";
  /**
   * "inside" (default) keeps the error in the tinted/bordered cell, which is
   * what every existing caller's `className` (flex-basis, col-span, shape
   * overrides) targets — changing that root would break them.
   * "outside" drops the error below the cell instead, in normal flow so it
   * can't overlap a field stacked underneath. It wraps the cell in a plain
   * div and moves `className` there, so only use it where callers don't
   * depend on `className` landing on the cell itself (the sign-in modal).
   */
  errorPlacement?: "inside" | "outside";
  className?: string;
  children: React.ReactNode;
}) {
  const cell = (
    <div
      className={cn(
        "group relative flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2.5 transition-colors duration-200",
        variant === "fill" && "hover:bg-sand-soft",
        variant === "outline" &&
          "border border-line-strong focus-within:border-ink",
        errorPlacement === "inside" && className,
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="shrink-0 text-ink-muted [&_svg]:size-[1.125rem]"
        >
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
        {errorPlacement === "inside" && error ? (
          <p
            id={`${htmlFor}-error`}
            role="alert"
            className="mt-1 text-[0.8125rem] text-accent-deep"
          >
            {error}
          </p>
        ) : null}
      </span>
    </div>
  );

  if (errorPlacement === "outside") {
    return (
      <div className={className}>
        {cell}
        {error ? (
          <p
            id={`${htmlFor}-error`}
            role="alert"
            className="mt-1.5 px-4 text-[0.8125rem] text-accent-deep"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return cell;
}

export function fieldInputClass(className?: string) {
  return cn(
    // No ring of its own — the text caret is the focus indicator, and the
    // "outline" cell variant shows its own border instead.
    "w-full border-0 bg-transparent p-0 text-[0.9375rem] text-ink placeholder:text-ink-muted focus:outline-none focus-visible:outline-none",
    className,
  );
}
