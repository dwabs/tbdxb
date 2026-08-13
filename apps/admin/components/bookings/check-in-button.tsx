"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const REASON_LABEL: Record<string, string> = {
  not_found: "No booking with that reference.",
  cancelled: "This booking was cancelled.",
  already_checked_in: "Already checked in.",
};

/** No confirm step, unlike CancelBookingButton — check-in isn't
 *  destructive the way cancel is, and a door with a line of guests can't
 *  afford a two-tap confirm per person. */
export function CheckInButton({ reference }: { reference: string }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const showToast = useToast();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function checkIn() {
    setPending(true);
    setMessage("");
    const { data, error: rpcError } = await supabase
      .rpc("check_in_booking", { p_reference: reference })
      .single();
    setPending(false);

    if (rpcError) {
      setMessage(rpcError.message);
      return;
    }
    const result = data as { ok: boolean; reason: string };
    if (result.ok) {
      showToast("Checked in.");
      router.refresh();
      return;
    }
    setMessage(REASON_LABEL[result.reason] ?? result.reason);
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <Button type="button" size="sm" disabled={pending} onClick={checkIn}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Check in
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
