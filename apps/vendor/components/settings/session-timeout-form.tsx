"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

const OPTIONS = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "90", label: "90 minutes" },
];

export function SessionTimeoutForm({
  userId,
  minutes,
}: {
  userId: string;
  minutes: number;
}) {
  const [supabase] = useState(() => createClient());
  const [value, setValue] = useState(String(minutes));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(next: string) {
    setValue(next);
    setSaved(false);
    setError("");
    const { error: updateError } = await supabase
      .from("profile")
      .update({ session_timeout_minutes: Number(next) })
      .eq("id", userId);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaved(true);
  }

  return (
    <div className="grid gap-1.5">
      <Label htmlFor="session-timeout">Log out after</Label>
      <div className="flex items-center gap-3">
        <Select value={value} onValueChange={handleChange}>
          <SelectTrigger id="session-timeout" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {error || (saved ? "Saved." : "")}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Signs you out of the vendor dashboard after this much time with no
        activity.
      </p>
    </div>
  );
}
