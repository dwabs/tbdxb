"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const showToast = useToast();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    setPending(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("cancel_booking", {
      p_booking_id: bookingId,
    });
    setPending(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    showToast("Booking cancelled.");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              setConfirming(false);
              setError("");
            }}
          >
            Keep it
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={cancel}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Confirm cancel
          </Button>
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => setConfirming(true)}
    >
      Cancel
    </Button>
  );
}
