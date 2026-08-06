"use client";

import { Globe, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Closing on navigation is handled in the link's own onClick, not an effect.
  // This one is a genuine external-system sync: stop the page behind scrolling.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[86rem] items-center gap-3 px-5 sm:h-[4.5rem] lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="The Bucket List DXB, home"
        >
          <Mark />
          <span translate="no" className="font-display text-[1.0625rem] leading-none font-bold tracking-[-0.02em] text-ink">
            thebucketlist<span className="text-berry">dxb</span>
          </span>
        </Link>

        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[0.9375rem] font-medium transition-colors duration-150",
                  active ? "bg-blush text-berry-deep" : "text-ink-muted hover:bg-sand-soft hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Globe aria-hidden="true" />
            English
          </Button>
          <Button variant="ink" size="sm" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="tap-target grid size-10 place-items-center rounded-full border border-line-strong text-ink lg:hidden [touch-action:manipulation]"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="animate-rise overscroll-contain border-t border-line bg-canvas px-5 pt-2 pb-6 lg:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === link.href ? "page" : undefined}
              className="block border-b border-line py-3.5 font-display text-lg font-semibold text-ink last:border-0"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

/** The bucket, drawn as a tick dropping into it. */
function Mark() {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" className="size-5">
        <path
          d="M4.5 7.5h15l-1.6 11a2 2 0 0 1-2 1.7H8.1a2 2 0 0 1-2-1.7Z"
          stroke="white"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9 11.8 11.4 14.4 16 8.6"
          stroke="var(--color-berry-soft)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
