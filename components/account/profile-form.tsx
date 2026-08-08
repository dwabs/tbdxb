"use client";

import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import { isValidPhoneNumber, type Value } from "react-phone-number-input";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Field, fieldInputClass } from "@/components/ui/field";
import { PhoneField } from "@/components/ui/phone-field";
import type { Dictionary } from "@/lib/i18n";
import { emitProfileUpdated } from "@/lib/profile-events";
import { createClient } from "@/lib/supabase/client";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;

export function ProfileForm({
  t,
  userId,
  fullName: initialFullName,
  phone: initialPhone,
  birthday: initialBirthday,
  avatarUrl: initialAvatarUrl,
}: {
  t: Dictionary["account"]["profile"];
  userId: string;
  fullName: string;
  phone: string | null;
  birthday: string | null;
  avatarUrl: string | null;
}) {
  const [supabase] = useState(() => createClient());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(initialFullName);
  const [nameError, setNameError] = useState("");
  const [mobile, setMobile] = useState<Value | undefined>(
    (initialPhone as Value) ?? undefined,
  );
  const [mobileError, setMobileError] = useState("");
  const [birthday, setBirthday] = useState(initialBirthday ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > MAX_AVATAR_BYTES) {
      setAvatarError(t.avatarError);
      return;
    }

    setAvatarError("");
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      setUploading(false);
      setAvatarError(t.avatarError);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // The path is stable (upsert overwrites it), so bust the cache or the
    // browser/CDN keeps serving the previous image at the same URL.
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profile")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);
    setUploading(false);
    if (updateError) {
      setAvatarError(t.avatarError);
      return;
    }

    setAvatarUrl(publicUrl);
    emitProfileUpdated({ avatarUrl: publicUrl });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = fullName.trim();
    const nextNameError = trimmedName.length === 0 ? t.nameError : "";
    const nextMobileError =
      !mobile || !isValidPhoneNumber(mobile) ? t.mobileError : "";
    setNameError(nextNameError);
    setMobileError(nextMobileError);
    if (nextNameError || nextMobileError) return;

    setPending(true);
    setSaveError("");
    setSaved(false);
    const { error } = await supabase
      .from("profile")
      .update({ full_name: trimmedName, phone: mobile, birthday: birthday || null })
      .eq("id", userId);
    setPending(false);

    if (error) {
      setSaveError(t.saveError);
      return;
    }
    setSaved(true);
    emitProfileUpdated({ fullName: trimmedName });
  }

  return (
    <section className="rounded-card border border-line bg-paper p-6">
      <h2 className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
        {t.title}
      </h2>

      <form onSubmit={handleSubmit} noValidate className="mt-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t.changePhoto}
            className="group relative inline-flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full [touch-action:manipulation]"
          >
            <Avatar
              name={fullName || initialFullName}
              avatarUrl={avatarUrl}
              className="size-20 text-2xl"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-primary/0 text-white opacity-0 transition-opacity duration-150 group-hover:bg-primary/40 group-hover:opacity-100">
              <Camera aria-hidden="true" className="size-6" />
            </span>
          </button>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[0.9375rem] font-medium text-accent-deep hover:underline"
            >
              {uploading ? t.uploading : t.changePhoto}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="sr-only"
            />
            {avatarError ? (
              <p role="alert" className="mt-1 text-[0.8125rem] text-accent-deep">
                {avatarError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <Field
            variant="outline"
            errorPlacement="outside"
            label={t.nameLabel}
            htmlFor="account-name"
            error={nameError}
          >
            <input
              id="account-name"
              name="name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                if (nameError) setNameError("");
              }}
              aria-invalid={nameError ? true : undefined}
              className={fieldInputClass()}
            />
          </Field>
          <PhoneField
            label={t.mobileLabel}
            htmlFor="account-mobile"
            value={mobile}
            onChange={(value) => {
              setMobile(value);
              if (mobileError) setMobileError("");
            }}
            error={mobileError}
          />
          <Field variant="outline" label={t.birthdayLabel} htmlFor="account-birthday">
            <input
              id="account-birthday"
              name="birthday"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
              className={fieldInputClass()}
            />
          </Field>
        </div>

        {saveError ? (
          <p role="alert" className="mt-3 text-[0.8125rem] text-accent-deep">
            {saveError}
          </p>
        ) : null}

        <div className="mt-4 flex items-center gap-3">
          <Button type="submit" size="md">
            {pending ? t.saving : t.save}
          </Button>
          <p aria-live="polite" className="text-[0.8125rem] text-ink-muted">
            {saved ? t.saved : ""}
          </p>
        </div>
      </form>
    </section>
  );
}
