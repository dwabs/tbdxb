"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  LOCALE_NAMES,
  LOCALES,
  localePath,
  stripLocale,
  type Locale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * The language control names the language you are currently reading and only
 * changes it once you pick from the list — a button that silently means "go
 * to Arabic" gives you no way to check which language you are in, and no way
 * to back out once you've opened it.
 *
 * Every option is a real link to the same page in that locale, so switching
 * never loses your place, and each one is openable in a new tab and crawlable
 * as an alternate.
 */
export function LanguageMenu({
  locale,
  label,
  className,
}: {
  locale: Locale;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const here = stripLocale(pathname);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        // The visible text is just "English", so the accessible name spells
        // out what that word is doing there. It still contains the visible
        // label, which is what voice control matches on.
        aria-label={`${label}: ${LOCALE_NAMES[locale]}`}
        className={cn(
          "group inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-ink-muted transition-colors duration-200 hover:bg-sand-soft hover:text-ink data-[state=open]:bg-sand-soft data-[state=open]:text-ink [touch-action:manipulation]",
          className,
        )}
      >
        <Globe aria-hidden="true" className="size-4" />
        {LOCALE_NAMES[locale]}
        {/* Tailwind v4 animates the independent `rotate` property, not
            `transform` — transition-transform would cover it, but naming it
            keeps the transition off the colours above. */}
        <ChevronDown
          aria-hidden="true"
          className="size-3.5 transition-[rotate] duration-200 group-data-[state=open]:rotate-180"
        />
      </PopoverTrigger>

      <PopoverContent align="end" aria-label={label} className="w-48 p-1.5">
        <ul>
          {LOCALES.map((option) => {
            const current = option === locale;
            return (
              <li key={option}>
                <Link
                  href={localePath(option, here)}
                  hrefLang={option}
                  lang={option}
                  aria-current={current ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] transition-colors duration-150",
                    current
                      ? "font-medium text-ink"
                      : "text-ink-muted hover:bg-sand-soft hover:text-ink",
                  )}
                >
                  {LOCALE_NAMES[option]}
                  {current ? (
                    <Check
                      aria-hidden="true"
                      className="size-4 shrink-0 text-accent-deep"
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
