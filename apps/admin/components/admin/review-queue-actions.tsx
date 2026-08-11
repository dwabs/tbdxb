"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

export function ReviewQueueActions({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  async function approve() {
    setPending(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("admin_publish_event", {
      p_event_id: eventId,
    });
    setPending(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    router.refresh();
  }

  async function reject() {
    if (!reason.trim()) return;
    setPending(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("admin_reject_event", {
      p_event_id: eventId,
      p_reason: reason.trim(),
    });
    setPending(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    router.refresh();
  }

  if (rejecting) {
    return (
      <div className="grid w-64 shrink-0 gap-2">
        <Textarea
          rows={2}
          placeholder="Reason for the vendor…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          autoFocus
        />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              setRejecting(false);
              setReason("");
              setError("");
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pending || !reason.trim()}
            onClick={reject}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Confirm reject
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => setRejecting(true)}
        >
          Reject
        </Button>
        <Button type="button" size="sm" disabled={pending} onClick={approve}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Approve
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
