"use client";

import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Experience } from "@/lib/events";
import type { Dictionary, Locale } from "@/lib/i18n";

export function CheckoutModal({
  t,
  locale,
  experience,
  guests,
  fullName,
  phone,
  open,
  onOpenChange,
}: {
  t: Dictionary["checkout"];
  locale: Locale;
  experience: Experience;
  guests: number;
  fullName: string;
  phone: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeLabel={t.close}
        className="max-h-[85vh] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto"
      >
        <DialogTitle className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
          {t.title}
        </DialogTitle>
        <div className="mt-4">
          <CheckoutFlow
            t={t}
            locale={locale}
            experience={experience}
            guests={guests}
            fullName={fullName}
            phone={phone}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
