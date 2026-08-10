"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const FORMATTER = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "2026-08-14T18:00" ⇄ { date: Date, time: "18:00" }, kept local so no
 *  timezone shift can move the day (same convention as the public site's
 *  DateField and this form's own toDateTimeLocal/dubaiDateTimeToISO). */
function parseValue(value: string): { date: Date | undefined; time: string } {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/);
  if (!match) return { date: undefined, time: "" };
  const [, y, m, d, time] = match;
  return { date: new Date(Number(y), Number(m) - 1, Number(d)), time };
}

function toValue(date: Date | undefined, time: string): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}T${time || "00:00"}`;
}

/** Date + time picker for the vendor event form's Starts/Ends fields — a
 *  calendar popover for the date plus a native time input, combined into
 *  the same "YYYY-MM-DDTHH:mm" string a plain `datetime-local` input would
 *  produce, so the rest of the form (toDateTimeLocal / dubaiDateTimeToISO)
 *  doesn't need to change. */
export function DateTimeField({
  id,
  value,
  onChange,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { date, time } = parseValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start gap-2 px-3 font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0" />
          <span className="truncate">
            {date ? `${FORMATTER.format(date)}${time ? ` · ${time}` : ""}` : "Pick a date"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          startMonth={new Date(new Date().getFullYear() - 1, 0)}
          endMonth={new Date(new Date().getFullYear() + 3, 11)}
          onSelect={(next) => onChange(toValue(next, time || "12:00"))}
          autoFocus
        />
        <div className="mt-2 flex items-center gap-2 border-t pt-2">
          <input
            type="time"
            value={time}
            onChange={(e) => onChange(toValue(date ?? new Date(), e.target.value))}
            className="border-input h-9 flex-1 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          {date ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              Clear
            </Button>
          ) : null}
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
