"use client";

import Link from "next/link";
import { useState } from "react";

import { Avatar } from "@/components/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fill, type Dictionary } from "@/lib/i18n";
import { localePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function AccountMenu({
  name,
  avatarUrl,
  locale,
  t,
  onSignOut,
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  locale: Locale;
  t: Dictionary["auth"];
  onSignOut: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const accountHref = localePath(locale, "/account");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={fill(t.menu.accountAria, { name })}
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full transition-transform duration-150 data-[state=open]:scale-95 [touch-action:manipulation]",
          className,
        )}
      >
        <Avatar name={name} avatarUrl={avatarUrl} className="size-9 text-sm" />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-48 p-1.5">
        <ul>
          <li>
            <Link
              href={accountHref}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-[0.9375rem] text-ink-muted transition-colors duration-150 hover:bg-sand-soft hover:text-ink"
            >
              {t.menu.editProfile}
            </Link>
          </li>
          <li>
            <Link
              href={localePath(locale, "/account/bookings")}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-[0.9375rem] text-ink-muted transition-colors duration-150 hover:bg-sand-soft hover:text-ink"
            >
              {t.menu.yourBookings}
            </Link>
          </li>
          <li>
            <Link
              href={`${accountHref}#notifications`}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-[0.9375rem] text-ink-muted transition-colors duration-150 hover:bg-sand-soft hover:text-ink"
            >
              {t.menu.settings}
            </Link>
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
