"use client";

import { Check, Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateVendorForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setTempPassword(null);

    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "create_vendor",
        email: ownerEmail.trim(),
        name: name.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim() || undefined,
      }),
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

    setName("");
    setContactEmail("");
    setContactPhone("");
    setOwnerEmail("");
    setTempPassword(data.tempPassword ?? null);
    router.refresh();
  }

  if (tempPassword) {
    return (
      <div className="grid gap-2 rounded-md border bg-secondary/40 p-4">
        <p className="text-sm font-medium">Vendor created.</p>
        <p className="text-sm text-muted-foreground">
          Share this temporary password with the owner out of band — it
          won&apos;t be shown again. They can change it from Settings after
          signing in.
        </p>
        <div className="flex items-center gap-2">
          <code className="rounded-md border bg-background px-3 py-2 text-sm">
            {tempPassword}
          </code>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(tempPassword);
              setCopied(true);
            }}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="w-fit"
          onClick={() => setTempPassword(null)}
        >
          Create another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <Label htmlFor="vendor-name">Business name</Label>
        <Input id="vendor-name" value={name} onChange={(e) => setName(e.target.value)} required />
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
      <div className="grid gap-1.5">
        <Label htmlFor="vendor-contact-phone">Contact phone (optional)</Label>
        <Input
          id="vendor-contact-phone"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="vendor-owner-email">Owner&apos;s login email</Label>
        <Input
          id="vendor-owner-email"
          type="email"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Create vendor
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
    </form>
  );
}
