"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * The site's signature control. Their own copy says "one you'll definitely
 * want to tick off your bucket list" — so saving is a tick being drawn, not a
 * heart. The stroke animates on; nothing else on the card moves.
 */
export function BucketListToggle({
  title,
  className,
  size = "md",
}: {
  title: string;
  className?: string;
  size?: "md" | "lg";
}) {
  const [ticked, setTicked] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setTicked((previous) => !previous)}
      aria-pressed={ticked}
      aria-label={ticked ? `Remove ${title} from your bucket list` : `Add ${title} to your bucket list`}
      className={cn(
        "tap-target grid place-items-center rounded-full border transition-[background-color,border-color,transform] duration-200 ease-[var(--ease-out-soft)] [touch-action:manipulation] active:scale-90",
        size === "lg" ? "size-11" : "size-9",
        ticked
          ? "border-accent bg-accent text-primary"
          : "border-white/70 bg-white/85 text-ink backdrop-blur-sm hover:border-accent hover:text-accent-deep",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={size === "lg" ? "size-[1.375rem]" : "size-[1.125rem]"}
      >
        {/* Ghost tick: the empty checkbox, so the control reads as "not yet". */}
        <path
          d="M5 12.8 9.6 17.4 19 8"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-25"
        />
        {/* Live tick: draws itself on when saved. */}
        <path
          d="M5 12.8 9.6 17.4 19 8"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={24}
          strokeDasharray={24}
          style={{
            strokeDashoffset: ticked ? 0 : 24,
            transition: "stroke-dashoffset 320ms var(--ease-out-soft)",
          }}
        />
      </svg>
    </button>
  );
}
