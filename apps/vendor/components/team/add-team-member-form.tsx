"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VendorRole } from "@/lib/types";

/** Shared between the admin vendor-detail page and a vendor owner's own
 *  Settings page — same request shape either way, the route handler's own
 *  authorization decides whether the caller is allowed to make it. */
export function AddTeamMemberForm({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<VendorRole>("staff");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");

    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "add_member", email: email.trim(), vendorId, role }),
    });
    // A route-handler crash (e.g. SUPABASE_SECRET_KEY unset) returns a
    // non-JSON 500 from the framework, not this route's own
    // Response.json() error shape — res.json() would throw and leave the
    // button stuck mid-spin with nothing shown.
    const data = await res.json().catch(() => null);
    setPending(false);

    if (!res.ok) {
      setError(data?.error ?? "Something went wrong.");
      return;
    }

    setEmail("");
    setNotice(
      data.tempPassword
        ? `Added. Temporary password: ${data.tempPassword}`
        : "Added — they already had an account and can sign in as usual.",
    );
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-2">
      <Input
        type="email"
        placeholder="teammate@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="max-w-xs"
        required
      />
      <Select value={role} onValueChange={(v) => setRole(v as VendorRole)}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="staff">Staff</SelectItem>
          <SelectItem value="owner">Owner</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Add to team
      </Button>
      {error ? <p className="w-full text-sm text-destructive">{error}</p> : null}
      {notice ? <p className="w-full text-sm text-muted-foreground">{notice}</p> : null}
    </form>
  );
}
