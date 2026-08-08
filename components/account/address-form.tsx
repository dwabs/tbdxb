"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, fieldInputClass } from "@/components/ui/field";
import type { Dictionary } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

export function AddressForm({
  t,
  userId,
  line1: initialLine1,
  line2: initialLine2,
  city: initialCity,
  country: initialCountry,
}: {
  t: Dictionary["account"]["address"];
  userId: string;
  line1: string;
  line2: string;
  city: string;
  country: string;
}) {
  const [supabase] = useState(() => createClient());
  const [line1, setLine1] = useState(initialLine1);
  const [line2, setLine2] = useState(initialLine2);
  const [city, setCity] = useState(initialCity);
  const [country, setCountry] = useState(initialCountry);
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setSaveError("");
    setSaved(false);
    const { error } = await supabase
      .from("profile")
      .update({
        address_line1: line1.trim() || null,
        address_line2: line2.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
      })
      .eq("id", userId);
    setPending(false);

    if (error) {
      setSaveError(t.saveError);
      return;
    }
    setSaved(true);
  }

  return (
    <section className="rounded-card border border-line bg-paper p-6">
      <h2 className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
        {t.title}
      </h2>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            variant="outline"
            errorPlacement="outside"
            label={t.line1Label}
            htmlFor="account-address-line1"
            className="sm:col-span-2"
          >
            <input
              id="account-address-line1"
              type="text"
              autoComplete="address-line1"
              placeholder={t.line1Placeholder}
              value={line1}
              onChange={(event) => setLine1(event.target.value)}
              className={fieldInputClass()}
            />
          </Field>
          <Field
            variant="outline"
            errorPlacement="outside"
            label={t.line2Label}
            htmlFor="account-address-line2"
            className="sm:col-span-2"
          >
            <input
              id="account-address-line2"
              type="text"
              autoComplete="address-line2"
              placeholder={t.line2Placeholder}
              value={line2}
              onChange={(event) => setLine2(event.target.value)}
              className={fieldInputClass()}
            />
          </Field>
          <Field
            variant="outline"
            errorPlacement="outside"
            label={t.cityLabel}
            htmlFor="account-address-city"
          >
            <input
              id="account-address-city"
              type="text"
              autoComplete="address-level2"
              placeholder={t.cityPlaceholder}
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className={fieldInputClass()}
            />
          </Field>
          <Field
            variant="outline"
            errorPlacement="outside"
            label={t.countryLabel}
            htmlFor="account-address-country"
          >
            <input
              id="account-address-country"
              type="text"
              autoComplete="country-name"
              placeholder={t.countryPlaceholder}
              value={country}
              onChange={(event) => setCountry(event.target.value)}
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
