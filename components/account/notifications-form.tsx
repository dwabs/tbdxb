"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function ToggleRow({
  id,
  label,
  body,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  body: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-[0.9375rem] font-medium text-ink">
          {label}
        </p>
        <p className="mt-0.5 text-[0.8125rem] text-ink-muted">{body}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 [touch-action:manipulation]",
          checked ? "bg-primary" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-1 size-4 rounded-full bg-white shadow-sm transition-all duration-200",
            checked ? "start-6" : "start-1",
          )}
        />
      </button>
    </div>
  );
}

export function NotificationsForm({
  t,
  userId,
  marketing: initialMarketing,
  reminders: initialReminders,
}: {
  t: Dictionary["account"]["notifications"];
  userId: string;
  marketing: boolean;
  reminders: boolean;
}) {
  const [supabase] = useState(() => createClient());
  const [marketing, setMarketing] = useState(initialMarketing);
  const [reminders, setReminders] = useState(initialReminders);
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setPending(true);
    setSaveError("");
    setSaved(false);
    const { error } = await supabase
      .from("profile")
      .update({ notify_marketing: marketing, notify_reminders: reminders })
      .eq("id", userId);
    setPending(false);

    if (error) {
      setSaveError(t.save);
      return;
    }
    setSaved(true);
  }

  return (
    <section
      id="notifications"
      className="scroll-mt-24 rounded-card border border-line bg-paper p-6"
    >
      <h2 className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
        {t.title}
      </h2>

      <div className="mt-4 divide-y divide-line">
        <ToggleRow
          id="account-notify-marketing"
          label={t.marketingLabel}
          body={t.marketingBody}
          checked={marketing}
          onChange={setMarketing}
        />
        <ToggleRow
          id="account-notify-reminders"
          label={t.remindersLabel}
          body={t.remindersBody}
          checked={reminders}
          onChange={setReminders}
        />
      </div>

      {saveError ? (
        <p role="alert" className="mt-3 text-[0.8125rem] text-accent-deep">
          {saveError}
        </p>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
        <Button type="button" size="md" onClick={handleSave}>
          {pending ? t.saving : t.save}
        </Button>
        <p aria-live="polite" className="text-[0.8125rem] text-ink-muted">
          {saved ? t.saved : ""}
        </p>
      </div>
    </section>
  );
}
