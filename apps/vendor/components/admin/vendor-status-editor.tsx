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
import { createClient } from "@/lib/supabase/client";
import { VENDOR_STATUS_META, type Vendor, type VendorStatus } from "@/lib/types";

const STATUSES = Object.keys(VENDOR_STATUS_META) as VendorStatus[];

export function VendorStatusEditor({ vendor }: { vendor: Vendor }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [status, setStatus] = useState<VendorStatus>(vendor.status);
  // Percent in the UI, fraction in the DB — commission_rate is stored 0-1.
  const [commissionPct, setCommissionPct] = useState(
    String(Math.round(vendor.commission_rate * 100)),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dirty =
    status !== vendor.status ||
    commissionPct !== String(Math.round(vendor.commission_rate * 100));

  async function save() {
    setSaving(true);
    setError("");
    // Goes through an RPC, not a direct .update(): status/commission_rate
    // are column-revoked from `authenticated` entirely (0012), now that
    // vendors can self-update their own row's other fields — a controlled
    // path was the only way to keep both true at once.
    const { error: rpcError } = await supabase.rpc("admin_set_vendor_status", {
      p_vendor_id: vendor.id,
      p_status: status,
      p_commission_rate: Number(commissionPct) / 100,
    });
    setSaving(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <Select value={status} onValueChange={(v) => setStatus(v as VendorStatus)}>
          <SelectTrigger size="sm" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {VENDOR_STATUS_META[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={0}
            max={100}
            value={commissionPct}
            onChange={(e) => setCommissionPct(e.target.value)}
            className="h-8 w-16"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
        <Button type="button" size="sm" disabled={!dirty || saving} onClick={save}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Save
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
