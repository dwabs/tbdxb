"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

/** Closes a real gap that team-invite (0020) creates: an admin-issued temp
 *  password had nowhere to be changed anywhere in this app. Same
 *  saving/saved/error shape as SessionTimeoutForm, just a different field. */
export function ChangePasswordForm() {
  const [supabase] = useState(() => createClient());
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    setSaved(false);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setPassword("");
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-1.5">
      <Label htmlFor="new-password">Change password</Label>
      <div className="flex items-center gap-3">
        <Input
          id="new-password"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setSaved(false);
          }}
          className="max-w-xs"
        />
        <Button type="submit" size="sm" disabled={saving || !password}>
          Update
        </Button>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {error || (saved ? "Saved." : "")}
        </p>
      </div>
    </form>
  );
}
