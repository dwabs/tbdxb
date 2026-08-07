import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A labelled control cell for the search panel. The whole cell is one hit
 * target: clicking the label focuses the input inside it.
 *
 * The panel is white, so a cell can no longer signal hover or focus by
 * filling white. It borrows the header nav's two tints instead — sand-soft
 * under the cursor, blush once the cell is live — so "hovering" and "this is
 * the live one" read the same here as they do up there.
 *
 * `focus-within:hover:` is stacked on purpose: Tailwind emits `hover` after
 * `focus-within`, so without it a focused cell would drop back to the hover
 * tint under the cursor.
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
   * "fill" is the search panel's tinted cell (sand-soft hover, blush focus).
   * "outline" swaps the focus fill for a border — for contexts like a modal,
   * where a bordered field row already sits on its own surface and a pink
   * flash on focus fights the rest of the chrome rather than matching it.
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
        variant === "fill" &&
          "hover:bg-sand-soft focus-within:bg-blush focus-within:hover:bg-blush",
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
    // The cell itself shows focus (the blush fill), so the input needs no
    // ring of its own — one indicator per control, not two.
    //
    // Placeholders are ink-muted rather than ink-subtle: subtle clears AA on
    // white (4.7:1) but drops to 4.2:1 once the cell fills blush, and a
    // placeholder that fails contrast exactly when you reach for the field is
    // the wrong trade. Muted holds 5.5:1 on blush.
    "w-full border-0 bg-transparent p-0 text-[0.9375rem] text-ink placeholder:text-ink-muted focus:outline-none focus-visible:outline-none",
    className,
  );
}
