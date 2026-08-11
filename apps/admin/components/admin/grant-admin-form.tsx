"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function GrantAdminForm() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("admin_grant_admin", {
      p_email: email.trim(),
    });
    setPending(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setEmail("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <Input
        type="email"
        placeholder="teammate@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="max-w-xs"
        required
      />
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Grant access
      </Button>
      {error ? <p className="self-center text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
