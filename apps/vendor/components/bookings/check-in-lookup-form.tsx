"use client";

import { Scanner, type IDetectedBarcode, type IScannerError } from "@yudiel/react-qr-scanner";
import { CheckCircle2, Loader2, QrCode, XCircle } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const REASON_LABEL: Record<string, string> = {
  not_found: "No booking with that reference.",
  cancelled: "This booking was cancelled.",
  already_checked_in: "Already checked in.",
};

const SCAN_ERROR_LABEL: Record<string, string> = {
  "permission-denied":
    "Camera access was denied. Allow it in your browser settings, or enter the reference manually.",
  "no-camera": "No camera found on this device.",
  "in-use": "The camera is already in use by another app.",
  "insecure-context": "Camera scanning needs a secure (https) connection.",
  unsupported: "This browser doesn't support camera scanning.",
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
 * table first. Manual entry and QR scanning both feed the same
 * attemptCheckIn loop: clears and refocuses (or closes the camera) after
 * every attempt so staff can process a line of guests without touching the
 * mouse between scans/entries.
 */
export function CheckInLookupForm() {
  const [supabase] = useState(() => createClient());
  const [reference, setReference] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function attemptCheckIn(rawReference: string) {
    const ref = rawReference.trim();
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

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    attemptCheckIn(reference);
  }

  function handleScan(codes: IDetectedBarcode[]) {
    const value = codes[0]?.rawValue;
    if (!value) return;
    // Stop immediately, not after the RPC resolves — otherwise the same
    // frame keeps re-triggering onScan while the check-in is in flight.
    setScanning(false);
    attemptCheckIn(value);
  }

  function handleScanError(error: IScannerError) {
    setScanning(false);
    setScanError(
      SCAN_ERROR_LABEL[error.kind] ?? "Couldn't start the camera. Enter the reference manually instead.",
    );
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

      {scanning ? (
        <div className="grid gap-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-md border bg-black">
            <Scanner
              onScan={handleScan}
              onError={handleScanError}
              formats={["qr_code"]}
              constraints={{ facingMode: "environment" }}
              sound={false}
              classNames={{ container: "size-full", video: "size-full object-cover" }}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setScanning(false)}>
            Cancel scan
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setScanError("");
            setScanning(true);
          }}
        >
          <QrCode className="size-4" />
          Scan QR code
        </Button>
      )}

      {scanError ? <p className="text-xs text-destructive">{scanError}</p> : null}

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
