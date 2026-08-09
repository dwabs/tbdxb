"use client";

import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toast, useToast } from "@/components/ui/toast";
import { CATEGORIES } from "@/lib/categories";
import { dubaiDateTimeToISO, slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/client";
import {
  STATUS_META,
  type EventImage,
  type EventRow,
  type TicketType,
} from "@/lib/types";

/** `id` present means this row already exists in `ticket_type`; absent
 *  means it's a new row added client-side and not yet saved. Price fields
 *  are strings here (controlled number inputs), parsed back to numbers only
 *  when persisting. */
type TicketRowState = {
  id?: string;
  title: string;
  price_aed: string;
  discount_price_aed: string;
  quantity_total: string;
  _localId: string;
};

type CoreFields = {
  title: string;
  shortTitle: string;
  summary: string;
  body: string;
  category: string;
  venue: string;
  area: string;
  startsAt: string;
  endsAt: string;
  durationLabel: string;
  groupSize: string;
  tags: string;
  ageMin: string;
};

function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";
  // Dubai is fixed at +04:00 (no DST) — read the wall-clock fields straight
  // out of the ISO string rather than through Date's local-timezone getters,
  // which would apply the browser's own offset instead.
  const match = iso.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return match ? match[1] : "";
}

function emptyFields(): CoreFields {
  return {
    title: "",
    shortTitle: "",
    summary: "",
    body: "",
    category: "",
    venue: "",
    area: "",
    startsAt: "",
    endsAt: "",
    durationLabel: "",
    groupSize: "",
    tags: "",
    ageMin: "",
  };
}

function fieldsFromEvent(event: EventRow): CoreFields {
  return {
    title: event.title,
    shortTitle: event.short_title,
    summary: event.summary,
    body: event.body,
    category: event.category,
    venue: event.venue,
    area: event.area,
    startsAt: toDateTimeLocal(event.starts_at),
    endsAt: toDateTimeLocal(event.ends_at),
    durationLabel: event.duration_label,
    groupSize: event.group_size,
    tags: event.tags.join(", "),
    ageMin: event.age_min?.toString() ?? "",
  };
}

/** The public URL Supabase Storage returns embeds the bucket-relative path
 *  after a fixed segment — reversing that is the only way to get back to a
 *  path for `.remove()`, since we only persist the URL on `event_image`. */
function pathFromPublicUrl(url: string): string | null {
  const marker = "/event-images/";
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

export function EventForm(
  props:
    | { mode: "create"; vendorId: string }
    | {
        mode: "edit";
        vendorId: string;
        event: EventRow;
        ticketTypes: TicketType[];
        images: EventImage[];
      },
) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  const [fields, setFields] = useState<CoreFields>(() =>
    props.mode === "edit" ? fieldsFromEvent(props.event) : emptyFields(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusPending, setStatusPending] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [ticketTypes, setTicketTypes] = useState<TicketRowState[]>(
    props.mode === "edit"
      ? props.ticketTypes.map((t) => ({
          id: t.id,
          title: t.title,
          price_aed: String(t.price_aed),
          discount_price_aed: t.discount_price_aed?.toString() ?? "",
          quantity_total: String(t.quantity_total),
          _localId: t.id,
        }))
      : [],
  );

  const [images, setImages] = useState<EventImage[]>(
    props.mode === "edit" ? props.images : [],
  );
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  function setField<K extends keyof CoreFields>(key: K, value: CoreFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: fields.title.trim(),
      short_title: fields.shortTitle.trim() || fields.title.trim(),
      summary: fields.summary.trim(),
      body: fields.body.trim(),
      category: fields.category,
      venue: fields.venue.trim(),
      area: fields.area.trim(),
      starts_at: dubaiDateTimeToISO(fields.startsAt),
      ends_at: dubaiDateTimeToISO(fields.endsAt),
      duration_label: fields.durationLabel.trim(),
      group_size: fields.groupSize.trim(),
      tags: fields.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      age_min: fields.ageMin ? Number(fields.ageMin) : null,
    };

    if (!payload.title) {
      setError("Title is required.");
      setSaving(false);
      return;
    }

    if (props.mode === "edit") {
      const { error: updateError } = await supabase
        .from("event")
        .update(payload)
        .eq("id", props.event.id);
      if (updateError) {
        setSaving(false);
        setError(updateError.message);
        return;
      }
      const ticketError = await persistTicketTypes();
      setSaving(false);
      if (ticketError) {
        setError(ticketError);
        return;
      }
      showToast("Changes saved.");
      router.refresh();
      return;
    }

    // Creating: the slug has to be unique, and two vendors could plausibly
    // both title an event "Sunset Yoga" — retry once with a random suffix
    // rather than surfacing a raw constraint error for the common case.
    const baseSlug = slugify(payload.title) || "event";
    for (const slug of [baseSlug, `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`]) {
      const { data, error: insertError } = await supabase
        .from("event")
        .insert({ ...payload, vendor_id: props.vendorId, slug, status: "draft" })
        .select("id")
        .single();

      if (!insertError && data) {
        router.push(`/events/${data.id}`);
        return;
      }
      if (insertError && insertError.code !== "23505") {
        setSaving(false);
        setError(insertError.message);
        return;
      }
    }
    setSaving(false);
    setError("Couldn't generate a unique slug — try a different title.");
  }

  async function setStatus(status: "submitted" | "archived") {
    if (props.mode !== "edit") return;
    setStatusPending(true);
    const { error: statusError } = await supabase.rpc(
      status === "submitted" ? "vendor_submit_event" : "vendor_archive_event",
      { p_event_id: props.event.id },
    );
    setStatusPending(false);
    if (statusError) {
      setError(statusError.message);
      return;
    }
    showToast(status === "submitted" ? "Submitted for review." : "Event archived.");
    router.refresh();
  }

  async function deleteEvent() {
    if (props.mode !== "edit") return;
    setDeleting(true);
    const { error: deleteError } = await supabase
      .from("event")
      .delete()
      .eq("id", props.event.id);
    if (deleteError) {
      setDeleting(false);
      setError(deleteError.message);
      return;
    }
    router.push("/events");
  }

  function addTicketRow() {
    setTicketTypes((prev) => [
      ...prev,
      {
        title: "",
        price_aed: "",
        discount_price_aed: "",
        quantity_total: "",
        _localId: crypto.randomUUID(),
      },
    ]);
  }

  function updateTicketRow(
    localId: string,
    patch: Partial<{ title: string; price_aed: string; discount_price_aed: string; quantity_total: string }>,
  ) {
    setTicketTypes((prev) =>
      prev.map((row) => (row._localId === localId ? { ...row, ...patch } : row)),
    );
  }

  /** Persists every ticket row with a title and price — called from the
   *  single global "Save changes" button rather than its own per-row save,
   *  so ticket edits follow the same save model as every other field on
   *  the page. Returns an error message, if any, for the caller to show. */
  async function persistTicketTypes(): Promise<string | null> {
    if (props.mode !== "edit") return null;

    for (const row of ticketTypes) {
      if (!row.title.trim() || !row.price_aed) continue;

      const payload = {
        event_id: props.event.id,
        title: row.title.trim(),
        price_aed: Number(row.price_aed),
        discount_price_aed: row.discount_price_aed ? Number(row.discount_price_aed) : null,
        quantity_total: Number(row.quantity_total) || 0,
        position: ticketTypes.indexOf(row),
      };

      if (row.id) {
        const { error: updateError } = await supabase
          .from("ticket_type")
          .update(payload)
          .eq("id", row.id);
        if (updateError) return updateError.message;
      } else {
        const { data, error: insertError } = await supabase
          .from("ticket_type")
          .insert(payload)
          .select()
          .single();
        if (insertError) return insertError.message;
        if (data) {
          setTicketTypes((prev) =>
            prev.map((r) => (r._localId === row._localId ? { ...r, id: data.id } : r)),
          );
        }
      }
    }
    return null;
  }

  async function removeTicketRow(localId: string) {
    const row = ticketTypes.find((r) => r._localId === localId);
    if (row?.id) {
      const { error: deleteError } = await supabase
        .from("ticket_type")
        .delete()
        .eq("id", row.id);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
    }
    setTicketTypes((prev) => prev.filter((r) => r._localId !== localId));
    showToast("Ticket type removed.");
  }

  async function handleImageUpload(fileList: FileList | null) {
    if (props.mode !== "edit" || !fileList || fileList.length === 0) return;
    setUploading(true);
    setImageError("");
    let uploaded = 0;

    for (const file of Array.from(fileList)) {
      const dimensions = await new Promise<{ width: number; height: number } | null>(
        (resolve) => {
          const img = new Image();
          const objectUrl = URL.createObjectURL(file);
          img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
            URL.revokeObjectURL(objectUrl);
          };
          img.onerror = () => {
            resolve(null);
            URL.revokeObjectURL(objectUrl);
          };
          img.src = objectUrl;
        },
      );

      if (!dimensions) {
        setImageError(`Couldn't read "${file.name}" as an image.`);
        continue;
      }

      const path = `${props.vendorId}/${props.event.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(path, file);
      if (uploadError) {
        setImageError(uploadError.message);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from("event-images")
        .getPublicUrl(path);

      const { data: imageRow, error: insertError } = await supabase
        .from("event_image")
        .insert({
          event_id: props.event.id,
          url: publicUrlData.publicUrl,
          alt: "",
          width: dimensions.width,
          height: dimensions.height,
          position: images.length,
        })
        .select()
        .single();

      if (insertError) {
        setImageError(insertError.message);
      } else if (imageRow) {
        setImages((prev) => [...prev, imageRow as EventImage]);
        uploaded += 1;
      }
    }
    setUploading(false);
    if (uploaded > 0) {
      showToast(uploaded === 1 ? "Photo uploaded." : `${uploaded} photos uploaded.`);
    }
  }

  async function removeImage(image: EventImage) {
    const path = pathFromPublicUrl(image.url);
    if (path) await supabase.storage.from("event-images").remove([path]);
    const { error: deleteError } = await supabase
      .from("event_image")
      .delete()
      .eq("id", image.id);
    if (deleteError) {
      setImageError(deleteError.message);
      return;
    }
    setImages((prev) => prev.filter((i) => i.id !== image.id));
    showToast("Photo removed.");
  }

  async function saveImageAlt(imageId: string, alt: string) {
    await supabase.from("event_image").update({ alt }).eq("id", imageId);
  }

  return (
    <div className="grid gap-6">
      <Toast toast={toast} onDone={dismissToast} />

      {props.mode === "edit" ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className={STATUS_META[props.event.status].className}
            >
              {STATUS_META[props.event.status].label}
            </Badge>
            {props.event.status === "rejected" && props.event.rejection_reason ? (
              <p className="text-sm text-muted-foreground">
                Changes needed: {props.event.rejection_reason}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {confirmingDelete ? (
              <>
                <p className="text-sm text-muted-foreground">Delete this event for good?</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={deleting}
                  onClick={() => setConfirmingDelete(false)}
                >
                  Keep it
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleting}
                  onClick={deleteEvent}
                >
                  {deleting ? <Loader2 className="size-4 animate-spin" /> : null}
                  Delete permanently
                </Button>
              </>
            ) : (
              <>
                {props.event.status === "draft" || props.event.status === "rejected" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    Delete
                  </Button>
                ) : null}
                {props.event.status === "draft" || props.event.status === "rejected" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={statusPending}
                    onClick={() => setStatus("submitted")}
                  >
                    {statusPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    Submit for review
                  </Button>
                ) : null}
                {props.event.status === "published" || props.event.status === "approved" ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={statusPending}
                    onClick={() => setStatus("archived")}
                  >
                    Archive
                  </Button>
                ) : null}
                <Button type="submit" form="event-form" disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save changes
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}

      <form id="event-form" onSubmit={handleSave} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={fields.title}
                  onChange={(e) => setField("title", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="shortTitle">Short title (optional)</Label>
                <Input
                  id="shortTitle"
                  value={fields.shortTitle}
                  onChange={(e) => setField("shortTitle", e.target.value)}
                  placeholder={fields.title || "Falls back to Title"}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                rows={2}
                value={fields.summary}
                onChange={(e) => setField("summary", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="body">Full description</Label>
              <Textarea
                id="body"
                rows={6}
                value={fields.body}
                onChange={(e) => setField("body", e.target.value)}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label>Category</Label>
                <Select
                  value={fields.category}
                  onValueChange={(value) => setField("category", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={fields.venue}
                  onChange={(e) => setField("venue", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  value={fields.area}
                  onChange={(e) => setField("area", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="startsAt">Starts</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={fields.startsAt}
                  onChange={(e) => setField("startsAt", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="endsAt">Ends</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={fields.endsAt}
                  onChange={(e) => setField("endsAt", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="durationLabel">Duration</Label>
                <Input
                  id="durationLabel"
                  placeholder="2 hours"
                  value={fields.durationLabel}
                  onChange={(e) => setField("durationLabel", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="groupSize">Group size</Label>
                <Input
                  id="groupSize"
                  placeholder="Up to 16 people"
                  value={fields.groupSize}
                  onChange={(e) => setField("groupSize", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ageMin">Minimum age (optional)</Label>
                <Input
                  id="ageMin"
                  type="number"
                  min={0}
                  value={fields.ageMin}
                  onChange={(e) => setField("ageMin", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="Workshop, Hands-on, Includes food"
                value={fields.tags}
                onChange={(e) => setField("tags", e.target.value)}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            {props.mode === "create" ? (
              <div>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  Create draft
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </form>

      {props.mode === "edit" ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Ticket types</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {ticketTypes.map((row) => (
                <div
                  key={row._localId}
                  className="grid grid-cols-2 items-end gap-2 rounded-md border p-3 sm:grid-cols-5"
                >
                  <div className="grid gap-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    <Input
                      value={row.title}
                      onChange={(e) => updateTicketRow(row._localId, { title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">Price (AED)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={row.price_aed}
                      onChange={(e) => updateTicketRow(row._localId, { price_aed: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">Quantity</Label>
                    <Input
                      type="number"
                      min={0}
                      value={row.quantity_total}
                      onChange={(e) =>
                        updateTicketRow(row._localId, { quantity_total: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeTicketRow(row._localId)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addTicketRow} className="w-fit">
                <Plus className="size-4" />
                Add ticket type
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {images.map((image) => (
                    <div key={image.id} className="grid gap-1.5">
                      <div className="relative aspect-square overflow-hidden rounded-md border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element -- vendor-uploaded, unoptimized is fine */}
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image)}
                          aria-label="Remove photo"
                          className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      <Input
                        placeholder="Alt text"
                        defaultValue={image.alt}
                        onBlur={(e) => saveImageAlt(image.id, e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No photos yet.</p>
              )}

              <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:border-ring hover:text-foreground">
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                Upload photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </label>
              {imageError ? <p className="text-sm text-destructive">{imageError}</p> : null}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
