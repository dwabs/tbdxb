import Link from "next/link";

import { Button } from "@/components/ui/button";
import { localePath, type Locale } from "@/lib/i18n/config";

export function BookingsEmpty({
  title,
  body,
  browseLabel,
  locale,
}: {
  title: string;
  body: string;
  browseLabel: string;
  locale: Locale;
}) {
  return (
    <div className="rounded-card border border-dashed border-line-strong bg-sand-soft/50 p-10 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      <p className="mt-1.5 text-[0.9375rem] text-ink-muted">{body}</p>
      <Button asChild size="md" className="mt-4">
        <Link href={localePath(locale, "/events")}>{browseLabel}</Link>
      </Button>
    </div>
  );
}
