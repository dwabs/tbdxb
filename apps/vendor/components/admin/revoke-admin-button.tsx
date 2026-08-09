"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function RevokeAdminButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function revoke() {
    setPending(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("admin_revoke_admin", {
      p_user_id: userId,
    });
    setPending(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={revoke}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Revoke
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
