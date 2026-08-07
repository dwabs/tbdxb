"use client";

import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fill, type Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function AccountMenu({
  name,
  t,
  onSignOut,
  className,
}: {
  name: string;
  t: Dictionary["auth"];
  onSignOut: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={fill(t.menu.accountAria, { name })}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white transition-transform duration-150 data-[state=open]:scale-95 [touch-action:manipulation]",
          className,
        )}
      >
        {initials(name)}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-48 p-1.5">
        <ul>
          <li>
            <a
              href="#"
              onClick={(event) => event.preventDefault()}
              className="block rounded-xl px-3 py-2.5 text-[0.9375rem] text-ink-muted transition-colors duration-150 hover:bg-sand-soft hover:text-ink"
            >
              {t.menu.editProfile}
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(event) => event.preventDefault()}
              className="block rounded-xl px-3 py-2.5 text-[0.9375rem] text-ink-muted transition-colors duration-150 hover:bg-sand-soft hover:text-ink"
            >
              {t.menu.settings}
            </a>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="block w-full rounded-xl px-3 py-2.5 text-start text-[0.9375rem] text-accent-deep transition-colors duration-150 hover:bg-sand-soft"
            >
              {t.signOut}
            </button>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}
