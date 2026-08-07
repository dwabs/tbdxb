import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A labelled control cell for the search panel. The whole cell is one hit
 * target: clicking the label focuses the input inside it.
 *
 * The panel is white, so a cell can no longer signal hover or focus by
 * filling white — it lights blush instead, deeper when the cell is live than
 * when the cursor is merely over it. `focus-within:hover:` is stacked on
 * purpose: Tailwind emits `hover` after `focus-within`, so without it a
 * focused cell would drop back to the hover tint under the cursor.
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
        "group relative flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2.5 transition-colors duration-200 hover:bg-blush/60 focus-within:bg-blush focus-within:hover:bg-blush",
        className,
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
      </span>
    </div>
  );
}

export function fieldInputClass(className?: string) {
  return cn(
    // The cell itself shows focus (blush fill), so the input needs no ring of
    // its own — one indicator per control, not two.
    //
    // Placeholders are ink-muted rather than ink-subtle: subtle clears AA on
    // white (4.7:1) but only manages 4.2:1 once the cell lights blush, and a
    // placeholder that fails contrast exactly when you reach for the field is
    // the wrong trade. Muted holds 5.5:1 on blush.
    "w-full border-0 bg-transparent p-0 text-[0.9375rem] text-ink placeholder:text-ink-muted focus:outline-none focus-visible:outline-none",
    className,
  );
}
