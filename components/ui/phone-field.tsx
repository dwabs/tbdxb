"use client";

import "react-phone-number-input/style.css";

import PhoneInput, { type Country, type Value } from "react-phone-number-input";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * `react-phone-number-input` (the engine behind reui's phone input) renders
 * the flag/country-select and the number input as two sibling elements
 * (`.PhoneInputCountry`, `.PhoneInputInput`) inside one flex row — matching
 * reui's look means giving each its own separate rounded-full pill rather
 * than our other fields' single shared cell, which is why this doesn't reuse
 * `Field`. `limitMaxLength` is what enforces "based on the country we should
 * limit the digits entered": it caps input at that country's real max
 * significant-number length, from libphonenumber-js's own metadata.
 */
export function PhoneField({
  label,
  htmlFor,
  value,
  onChange,
  defaultCountry = "AE",
  placeholder,
  error,
}: {
  label: string;
  htmlFor: string;
  value: Value | undefined;
  onChange: (value: Value | undefined) => void;
  defaultCountry?: Country;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-[0.6875rem] font-semibold tracking-[0.08em] text-ink-muted uppercase"
      >
        {label}
      </label>
      <PhoneInput
        id={htmlFor}
        international
        limitMaxLength
        defaultCountry={defaultCountry}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${htmlFor}-error` : undefined}
        countrySelectProps={{ "aria-label": label }}
        style={{ "--PhoneInputCountryFlag-borderWidth": 0 } as React.CSSProperties}
        numberInputProps={{
          className: cn(
            "h-11 min-w-0 flex-1 rounded-full border bg-transparent px-4 text-[0.9375rem] text-ink placeholder:text-ink-muted transition-colors duration-150 focus:outline-none",
            error
              ? "border-accent-soft bg-blush"
              : "border-line-strong focus:border-ink",
          ),
        }}
        className={cn(
          "mt-1.5 gap-2",
          "[&_.PhoneInputCountry]:m-0 [&_.PhoneInputCountry]:h-11 [&_.PhoneInputCountry]:shrink-0",
          "[&_.PhoneInputCountry]:rounded-full [&_.PhoneInputCountry]:border [&_.PhoneInputCountry]:px-3",
          error
            ? "[&_.PhoneInputCountry]:border-accent-soft [&_.PhoneInputCountry]:bg-blush"
            : "[&_.PhoneInputCountry]:border-line-strong",
        )}
      />
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1.5 px-4 text-[0.8125rem] text-accent-deep"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
