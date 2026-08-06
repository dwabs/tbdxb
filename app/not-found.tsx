import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SECONDARY_NAV } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[86rem] flex-col items-start px-5 pt-20 pb-28 lg:px-8">
      {/* Same type as the heading below it, so the two read as one block. */}
      <p className="font-display text-display font-bold text-accent-deep">404</p>
      <h1 className="mt-4 max-w-2xl text-display font-bold text-ink">
        This one isn’t on the list.
      </h1>
      <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-muted">
        The page you’re after doesn’t exist, or it moved. The experiences are all still where you
        left them.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/events">Browse experiences</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/">Back home</Link>
        </Button>
      </div>

      <nav aria-label="Other pages" className="mt-14 w-full border-t border-line pt-6">
        <h2 className="font-display text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
          Or try one of these
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {SECONDARY_NAV.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[0.9375rem] text-ink-muted underline-offset-4 hover:text-accent-deep hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
