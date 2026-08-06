"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SECONDARY_NAV } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Sibling-page nav for the secondary pages. Sticky once there's room for it. */
export function SecondaryNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="More pages" className="lg:sticky lg:top-28 lg:self-start">
      <h2 className="font-display text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
        More from us
      </h2>
      <ul className="mt-3 border-t border-line">
        {SECONDARY_NAV.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href} className="border-b border-line">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block py-3 text-[0.9375rem] transition-colors duration-150",
                  active ? "font-semibold text-accent-deep" : "text-ink-muted hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
