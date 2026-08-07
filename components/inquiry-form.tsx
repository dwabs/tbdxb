"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, fieldInputClass } from "@/components/ui/field";

/**
 * Structural + copy data for one field — no functions, so a Server Component
 * page can build this and hand it to this Client Component as a plain prop.
 * Validity is a couple of flags rather than a callback for the same reason.
 */
export type InquiryField = {
  name: string;
  type: "text" | "email" | "tel" | "textarea";
  label: string;
  placeholder: string;
  error: string;
  autoComplete?: string;
  /** Every field is required; this only adds the `@` check on top. */
  email?: boolean;
  minLength?: number;
};

function isValid(value: string, field: InquiryField) {
  if (value.length === 0) return false;
  if (field.email && !value.includes("@")) return false;
  if (field.minLength && value.length < field.minLength) return false;
  return true;
}

/**
 * Contact and Partner share this: both are "collect a few fields, validate
 * them, go nowhere yet" — decision 1 keeps everything static, so submitting
 * only simulates the round trip the way the newsletter form already does.
 */
export function InquiryForm({
  idPrefix,
  fields,
  submitLabel,
  sendingLabel,
  successMessage,
}: {
  idPrefix: string;
  fields: InquiryField[];
  submitLabel: string;
  sendingLabel: string;
  successMessage: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const next: Record<string, string> = {};
    for (const field of fields) {
      const value = String(data.get(field.name) ?? "").trim();
      if (!isValid(value, field)) next[field.name] = field.error;
    }
    setErrors(next);

    const firstInvalid = fields.find((field) => next[field.name]);
    if (firstInvalid) {
      form
        .querySelector<HTMLElement>(`[name="${firstInvalid.name}"]`)
        ?.focus();
      return;
    }

    setStatus("sending");
    // Wire to the inbox/CRM here once decision 1 changes.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setStatus("done");
    form.reset();
  }

  function handleFieldChange(field: InquiryField, value: string) {
    if (errors[field.name] && isValid(value.trim(), field)) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest[field.name];
        return rest;
      });
    }
  }

  if (status === "done") {
    return (
      <p
        aria-live="polite"
        className="flex items-center gap-2 rounded-card border border-accent-soft bg-blush px-5 py-4 text-[0.9375rem] text-accent-deep"
      >
        <Check aria-hidden="true" className="size-4 shrink-0" />
        {successMessage}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="rounded-card border border-line bg-paper p-2 shadow-rail">
        <div className="grid gap-1">
          {fields.map((field) => {
            const id = `${idPrefix}-${field.name}`;
            const error = errors[field.name];
            const shared = {
              id,
              name: field.name,
              placeholder: field.placeholder,
              "aria-invalid": error ? (true as const) : undefined,
              "aria-describedby": error ? `${id}-error` : undefined,
              onChange: (
                event: React.ChangeEvent<
                  HTMLInputElement | HTMLTextAreaElement
                >,
              ) => handleFieldChange(field, event.target.value),
            };
            return (
              <Field key={field.name} label={field.label} htmlFor={id} error={error}>
                {field.type === "textarea" ? (
                  <textarea
                    {...shared}
                    rows={4}
                    className={fieldInputClass("resize-none")}
                  />
                ) : (
                  <input
                    {...shared}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    className={fieldInputClass()}
                  />
                )}
              </Field>
            );
          })}
        </div>
      </div>
      <Button type="submit" size="lg" className="mt-4">
        {status === "sending" ? sendingLabel : submitLabel}
      </Button>
    </form>
  );
}
