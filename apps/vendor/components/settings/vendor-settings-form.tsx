"use client";

import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { Vendor } from "@/lib/types";

const MAX_LOGO_BYTES = 3 * 1024 * 1024;

type VendorFields = Pick<
  Vendor,
  "id" | "name" | "contact_email" | "contact_phone" | "logo_url" | "bio"
>;

export function VendorSettingsForm({ vendor }: { vendor: VendorFields }) {
  const [supabase] = useState(() => createClient());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(vendor.name);
  const [contactEmail, setContactEmail] = useState(vendor.contact_email);
  const [contactPhone, setContactPhone] = useState(vendor.contact_phone ?? "");
  const [bio, setBio] = useState(vendor.bio ?? "");
  const [logoUrl, setLogoUrl] = useState(vendor.logo_url);
  const [uploading, setUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > MAX_LOGO_BYTES) {
      setLogoError("Choose an image under 3MB.");
      return;
    }

    setLogoError("");
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    // Fixed path, upsert: true — a new upload overwrites the old file in
    // place, so there's never an orphaned logo to separately clean up.
    const path = `${vendor.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("vendor-logos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      setUploading(false);
      setLogoError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("vendor-logos").getPublicUrl(path);
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("vendor")
      .update({ logo_url: publicUrl })
      .eq("id", vendor.id);
    setUploading(false);
    if (updateError) {
      setLogoError(updateError.message);
      return;
    }

    setLogoUrl(publicUrl);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaved(false);

    // Explicit keys, not spread from broader state — this is the vendor's
    // own self-update path, and status/commission_rate must never be
    // reachable from it (the column revoke in 0012 would reject them
    // outright even if they were included).
    const { error } = await supabase
      .from("vendor")
      .update({
        name: name.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", vendor.id);
    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- vendor-uploaded, unoptimized is fine
            <img src={logoUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">No logo</span>
          )}
        </button>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : null}
            {uploading ? "Uploading…" : "Change logo"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />
          {logoError ? (
            <p className="mt-1 text-xs text-destructive">{logoError}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="vendor-name">Business name</Label>
          <Input
            id="vendor-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="vendor-contact-email">Contact email</Label>
          <Input
            id="vendor-contact-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="vendor-contact-phone">Contact phone (optional)</Label>
        <Input
          id="vendor-contact-phone"
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="vendor-bio">Bio</Label>
        <Textarea
          id="vendor-bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Save changes
        </Button>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {saved ? "Saved." : ""}
        </p>
      </div>
    </form>
  );
}
