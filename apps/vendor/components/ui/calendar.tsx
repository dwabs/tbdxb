"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

/** shadcn's Calendar in the dropdown caption layout — month and year are
 *  <select>s, so jumping to a far-off date takes one click instead of paging. */
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
        months: "relative flex flex-col gap-4",
        month: "flex flex-col gap-3",
        nav: "absolute top-0 end-0 flex items-center gap-1",
        button_previous:
          "inline-grid size-7 place-items-center rounded-md border text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-35",
        button_next:
          "inline-grid size-7 place-items-center rounded-md border text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-35",
        month_caption: "flex h-8 items-center",
        caption_label:
          "pointer-events-none inline-flex items-center gap-0.5 text-sm font-semibold text-foreground",
        dropdowns: "flex items-center gap-1",
        dropdown_root:
          "relative inline-flex items-center rounded-md px-2 py-1 transition-colors hover:bg-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-ring",
        dropdown: "absolute inset-0 cursor-pointer opacity-0 [color-scheme:light]",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground uppercase",
        weeks: "",
        week: "mt-1 flex w-full",
        day: "relative size-9 p-0 text-center",
        day_button:
          "size-9 rounded-md text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30",
        today: "font-bold text-primary",
        outside: "text-muted-foreground opacity-50",
        disabled: "opacity-30",
        hidden: "invisible",
        selected: "",
        range_start: "",
        range_end: "",
        range_middle: "",
        ...classNames,
      }}
      modifiersClassNames={{
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:font-semibold",
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass, ...rest }) => {
          const Icon =
            orientation === "left" ? ChevronLeft : orientation === "right" ? ChevronRight : ChevronDown;
          return <Icon className={cn("size-4", chevronClass)} {...rest} />;
        },
      }}
      {...props}
    />
  );
}
