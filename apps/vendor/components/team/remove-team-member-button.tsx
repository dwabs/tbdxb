"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

export function RemoveTeamMemberButton({
  vendorId,
  userId,
}: {
  vendorId: string;
  userId: string;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const showToast = useToast();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setPending(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("remove_vendor_member", {
      p_vendor_id: vendorId,
      p_user_id: userId,
    });
    setPending(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    showToast("Team member removed.");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex shrink-0 flex-col items-end gap-1.5">
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
            Keep them
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={remove}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Confirm remove
          </Button>
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setConfirming(true)}
      >
        Remove
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
