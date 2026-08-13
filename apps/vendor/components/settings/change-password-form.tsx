"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

/** Closes a real gap that team-invite (0020) creates: an admin-issued temp
 *  password had nowhere to be changed anywhere in this app. */
export function ChangePasswordForm() {
  const [supabase] = useState(() => createClient());
  const showToast = useToast();
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setPassword("");
    showToast("Password updated.");
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
          onChange={(e) => setPassword(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" size="sm" disabled={saving || !password}>
          Update
        </Button>
        {error ? (
          <p aria-live="polite" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
