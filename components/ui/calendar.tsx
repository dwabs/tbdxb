"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

/**
 * shadcn's Calendar, in the dropdown caption layout — month and year are
 * <select>s, so jumping to a far-off date takes one click instead of paging.
 * Styled against this project's tokens rather than shadcn's default neutrals.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn("w-fit p-1", className)}
      classNames={{
        // The nav is absolutely placed so the caption dropdowns can own the
        // full width of the header row without the arrows pushing them around.
        months: "relative flex flex-col gap-4",
        month: "flex flex-col gap-3",
        nav: "absolute top-0 end-0 flex items-center gap-1",
        button_previous:
          "inline-grid size-8 place-items-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink disabled:opacity-35 [touch-action:manipulation]",
        button_next:
          "inline-grid size-8 place-items-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink disabled:opacity-35 [touch-action:manipulation]",
        month_caption: "flex h-8 items-center",
        // Also used inside each dropdown, where it sits over the hidden
        // <select> — hence inline-flex for the chevron and pointer-events-none
        // so the click falls through to the select underneath.
        caption_label:
          "pointer-events-none inline-flex items-center gap-0.5 text-[0.9375rem] font-semibold text-ink",
        dropdowns: "flex items-center gap-1",
        dropdown_root:
          "relative inline-flex items-center rounded-lg px-2 py-1 transition-colors hover:bg-sand-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-accent-deep",
        dropdown:
          "absolute inset-0 cursor-pointer opacity-0 [color-scheme:light]",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 text-[0.6875rem] font-semibold tracking-wide text-ink-subtle uppercase",
        weeks: "",
        week: "mt-1 flex w-full",
        day: "relative size-9 p-0 text-center",
        day_button:
          "size-9 rounded-full text-[0.875rem] text-ink transition-colors hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-30 [touch-action:manipulation]",
        today: "font-bold text-primary",
        outside: "text-ink-subtle opacity-50",
        disabled: "opacity-30",
        hidden: "invisible",
        selected: "",
        range_start: "",
        range_end: "",
        range_middle: "",
        ...classNames,
      }}
      modifiersClassNames={{
        selected:
          "[&>button]:bg-primary [&>button]:text-white [&>button]:font-semibold",
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass, ...rest }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "right"
                ? ChevronRight
                : ChevronDown;
          return <Icon className={cn("size-4", chevronClass)} {...rest} />;
        },
      }}
      {...props}
    />
  );
}
