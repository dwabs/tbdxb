"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const REASON_LABEL: Record<string, string> = {
  not_found: "No booking with that reference.",
  cancelled: "This booking was cancelled.",
  already_checked_in: "Already checked in.",
};

type Result =
  | { ok: true; attendeeName: string; eventTitle: string; quantity: number }
  | { ok: false; message: string };

const CHECKED_IN_AT = new Intl.DateTimeFormat("en-AE", {
  hour: "numeric",
  minute: "2-digit",
});

/**
 * Standalone check-in surface for door operations — separate from the
 * per-row button on /bookings, which requires finding the booking in a
 * table first. This is a straight reference-in, result-out loop: clears
 * and refocuses after every attempt so staff can process a line of guests
 * without touching the mouse between scans/entries.
 */
export function CheckInLookupForm() {
  const [supabase] = useState(() => createClient());
  const [reference, setReference] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const ref = reference.trim();
    if (!ref) return;

    setPending(true);
    setResult(null);

    const { data, error } = await supabase
      .rpc("check_in_booking", { p_reference: ref })
      .single();

    setPending(false);
    setReference("");
    inputRef.current?.focus();

    if (error) {
      setResult({ ok: false, message: error.message });
      return;
    }

    const row = data as {
      ok: boolean;
      reason: string;
      attendee_name: string | null;
      event_title: string | null;
      quantity: number | null;
      checked_in_at: string | null;
    };

    if (row.ok) {
      setResult({
        ok: true,
        attendeeName: row.attendee_name ?? "",
        eventTitle: row.event_title ?? "",
        quantity: row.quantity ?? 0,
      });
    } else {
      setResult({ ok: false, message: REASON_LABEL[row.reason] ?? row.reason });
    }
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Booking reference"
          autoFocus
          autoComplete="off"
          className="h-12 text-lg tracking-wide"
        />
        <Button type="submit" size="lg" disabled={pending || !reference.trim()}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Check in
        </Button>
      </form>

      {result ? (
        result.ok ? (
          <div className="flex items-start gap-3 rounded-md border border-emerald-600/30 bg-emerald-600/10 px-4 py-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <div className="text-sm">
              <p className="font-medium">{result.attendeeName || "Checked in"}</p>
              <p className="text-muted-foreground">
                {result.eventTitle} · {result.quantity}{" "}
                {result.quantity === 1 ? "ticket" : "tickets"} · checked in at{" "}
                {CHECKED_IN_AT.format(new Date())}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3">
            <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <p className="text-sm font-medium">{result.message}</p>
          </div>
        )
      ) : null}
    </div>
  );
}
